package com.tsix.apirest.service;

import com.tsix.apirest.dto.req.OpenQuestionScoreRequest;
import com.tsix.apirest.dto.req.SubmitAnswerRequest;
import com.tsix.apirest.dto.req.SubmitTestRequest;
import com.tsix.apirest.dto.res.DetailedTestResultResponse;
import com.tsix.apirest.dto.res.OpenQuestionScoreResponse;
import com.tsix.apirest.dto.res.QuestionResultResponse;
import com.tsix.apirest.dto.res.SubmitTestResponse;
import com.tsix.apirest.entity.TestSessionStatus;
import com.tsix.apirest.entity.test.*;
import com.tsix.apirest.exceptions.userExceptions.BadRequestException;
import com.tsix.apirest.repository.*;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
@Stateless
public class CandidateTestService {
    @Inject
    private TestSessionRepo testSessionRepo;
    @Inject
    private QuestionRepo questionRepo;
    @Inject
    private AnswerRepo answerRepo;
    @Inject
    private CandidateAnswerRepo candidateAnswerRepo;

    @Inject
    private GroqScoringService groqScoringService;

    public SubmitTestResponse submitTest(SubmitTestRequest request) {
        Optional<TestSession> sessionOpt = testSessionRepo.findById(TestSession.class, request.getTestSessionId());
        if (sessionOpt.isEmpty()) {
            throw new BadRequestException("Test session not found");
        }
        TestSession session = sessionOpt.get();
        if (session.getDateExpiration() != null && LocalDateTime.now().isAfter(session.getDateExpiration())) {
            throw new BadRequestException("Test session has expired");
        }
        if (session.getStatus() == TestSessionStatus.FINISHED) {
            throw new BadRequestException("Test has already been submitted");
        }
        double totalScore = 0.0;
        int answeredQuestions = 0;
        for (SubmitAnswerRequest answerRequest : request.getAnswers()) {
            if (candidateAnswerRepo.existsByTestSessionAndQuestion(
                    request.getTestSessionId(), answerRequest.getQuestionId())) {
                continue;
            }
            Optional<Question> questionOpt = questionRepo.findById(Question.class, answerRequest.getQuestionId());
            if (questionOpt.isEmpty()) {
                continue;
            }
            Question question = questionOpt.get();
            CandidateAnswer candidateAnswer = new CandidateAnswer();
            candidateAnswer.setTestSession(session);
            candidateAnswer.setQuestion(question);
            candidateAnswer.setSubmittedAt(LocalDateTime.now());
            double pointsEarned = 0.0;
            Boolean isCorrect = false;
            if (answerRequest.getSelectedAnswerId() != null) {
                Optional<Answer> selectedAnswerOpt = answerRepo.findById(Answer.class, answerRequest.getSelectedAnswerId());
                if (selectedAnswerOpt.isPresent()) {
                    Answer selectedAnswer = selectedAnswerOpt.get();
                    candidateAnswer.setSelectedAnswer(selectedAnswer);
                    isCorrect = selectedAnswer.isCorrect();
                    if (isCorrect) {
                        pointsEarned = question.getPoints();
                    }
                }
            } else if (answerRequest.getOpenAnswerText() != null && !answerRequest.getOpenAnswerText().trim().isEmpty()) {
                candidateAnswer.setOpenAnswerText(answerRequest.getOpenAnswerText());

                // Use Groq AI to score open questions
                OpenAnswer openAnswer = question.getOpenAnswers();
                if (openAnswer != null && openAnswer.getExpectedAnswer() != null) {
                    try {
                        OpenQuestionScoreRequest scoreRequest = new OpenQuestionScoreRequest(
                            question.getId(),
                            answerRequest.getOpenAnswerText(),
                            openAnswer.getExpectedAnswer(),
                            (int) question.getPoints()
                        );

                        OpenQuestionScoreResponse scoreResponse = groqScoringService.scoreOpenQuestion(scoreRequest);

                        // Calculate points earned based on Groq score
                        pointsEarned = scoreResponse.getScore();

                        // Determine if answer is correct (>= 60% of max points)
                        isCorrect = pointsEarned >= (question.getPoints() * 0.6);

                    } catch (Exception e) {
                        // If Groq scoring fails, mark for manual review
                        System.err.println("Error scoring open question with Groq: " + e.getMessage());
                        isCorrect = null;
                        pointsEarned = 0.0;
                    }
                } else {
                    // No expected answer available, mark for manual review
                    isCorrect = null;
                    pointsEarned = 0.0;
                }
            }
            candidateAnswer.setIsCorrect(isCorrect);
            candidateAnswer.setPointsEarned(pointsEarned);

            candidateAnswerRepo.save(candidateAnswer);

            // Add points to total score (for both multiple choice and AI-scored open questions)
            if (pointsEarned > 0) {
                totalScore += pointsEarned;
            }
            answeredQuestions++;
        }
        session.setStatus(TestSessionStatus.FINISHED);
        session.setScore(totalScore);
        testSessionRepo.update(session);

        Test test = session.getTest();
        int totalQuestions = test.getTestQuestions() != null ? test.getTestQuestions().size() : 0;

        // Calculate total possible points
        double totalPossiblePoints = 0.0;
        if (test.getTestQuestions() != null) {
            for (TestQuestions tq : test.getTestQuestions()) {
                if (tq.getQuestion() != null) {
                    totalPossiblePoints += tq.getQuestion().getPoints();
                }
            }
        }

        // Calculate percentage
        double scorePercentage = totalPossiblePoints > 0
            ? (totalScore / totalPossiblePoints) * 100
            : 0.0;

        // Build detailed question results
        List<QuestionResultResponse> questionResults = buildQuestionResults(request.getTestSessionId());

        // Format total score fraction
        String totalScoreFraction = String.format("%.1f/%.1f", totalScore, totalPossiblePoints);

        return new SubmitTestResponse(
                session.getId(),
                totalScore,
                totalPossiblePoints,
                totalScoreFraction,
                scorePercentage,
                totalQuestions,
                answeredQuestions,
                "FINISHED",
                "Test submitted successfully",
                questionResults
        );
    }
    public SubmitTestResponse getTestResults(Long testSessionId) {
        Optional<TestSession> sessionOpt = testSessionRepo.findById(TestSession.class, testSessionId);
        if (sessionOpt.isEmpty()) {
            throw new BadRequestException("Test session not found");
        }
        TestSession session = sessionOpt.get();
        if (session.getStatus() != TestSessionStatus.FINISHED) {
            throw new BadRequestException("Test has not been completed yet");
        }
        List<CandidateAnswer> answers = candidateAnswerRepo.findByTestSessionId(testSessionId);
        Test test = session.getTest();
        int totalQuestions = test.getTestQuestions() != null ? test.getTestQuestions().size() : 0;

        // Calculate total possible points
        double totalPossiblePoints = 0.0;
        if (test.getTestQuestions() != null) {
            for (TestQuestions tq : test.getTestQuestions()) {
                if (tq.getQuestion() != null) {
                    totalPossiblePoints += tq.getQuestion().getPoints();
                }
            }
        }

        // Calculate percentage
        double scorePercentage = totalPossiblePoints > 0
            ? (session.getScore() / totalPossiblePoints) * 100
            : 0.0;

        // Build detailed question results
        List<QuestionResultResponse> questionResults = buildQuestionResults(testSessionId);

        // Format total score fraction
        String totalScoreFraction = String.format("%.1f/%.1f", session.getScore(), totalPossiblePoints);

        return new SubmitTestResponse(
                session.getId(),
                session.getScore(),
                totalPossiblePoints,
                totalScoreFraction,
                scorePercentage,
                totalQuestions,
                answers.size(),
                session.getStatus().name(),
                "Test results retrieved successfully",
                questionResults
        );
    }

    private List<QuestionResultResponse> buildQuestionResults(Long testSessionId) {
        List<CandidateAnswer> candidateAnswers = candidateAnswerRepo.findByTestSessionId(testSessionId);
        List<QuestionResultResponse> results = new ArrayList<>();

        for (CandidateAnswer candidateAnswer : candidateAnswers) {
            Question question = candidateAnswer.getQuestion();
            QuestionType questionType = question.getQuestionType();

            QuestionResultResponse result = new QuestionResultResponse();
            result.setQuestionId(question.getId());
            result.setQuestionLabel(question.getLabel());
            result.setQuestionType(questionType != null ? questionType.getDisplayName() : "Unknown");
            result.setMaxPoints(question.getPoints());
            result.setPointsEarned(candidateAnswer.getPointsEarned() != null ? candidateAnswer.getPointsEarned() : 0.0);
            result.setIsCorrect(candidateAnswer.getIsCorrect());

            // Format score as fraction
            String scoreFraction = String.format("%.1f/%.1f",
                candidateAnswer.getPointsEarned() != null ? candidateAnswer.getPointsEarned() : 0.0,
                question.getPoints());
            result.setScoreFraction(scoreFraction);

            // Handle different question types
            if (candidateAnswer.getSelectedAnswer() != null) {
                // Multiple choice or True/False
                Answer selectedAnswer = candidateAnswer.getSelectedAnswer();
                result.setCandidateAnswer(selectedAnswer.getLabel());

                // Find correct answer
                String correctAnswerLabel = question.getAnswers().stream()
                    .filter(Answer::isCorrect)
                    .map(Answer::getLabel)
                    .findFirst()
                    .orElse("N/A");
                result.setCorrectAnswer(correctAnswerLabel);

            } else if (candidateAnswer.getOpenAnswerText() != null) {
                // Open question
                result.setCandidateAnswer(candidateAnswer.getOpenAnswerText());

                // Get expected answer if available
                OpenAnswer openAnswer = question.getOpenAnswers();
                if (openAnswer != null) {
                    result.setCorrectAnswer(openAnswer.getExpectedAnswer());
                } else {
                    result.setCorrectAnswer("No model answer available");
                }
            }

            results.add(result);
        }

        return results;
    }

}
