package com.tsix.apirest.service;

import com.tsix.apirest.dto.res.CandidateAnswerResponse;
import com.tsix.apirest.dto.res.CandidateAuthResponse;
import com.tsix.apirest.dto.res.CandidateQuestionResponse;
import com.tsix.apirest.entity.test.Question;
import com.tsix.apirest.entity.test.Test;
import com.tsix.apirest.entity.test.TestQuestions;
import com.tsix.apirest.repository.TestQuestionRepo;
import com.tsix.apirest.repository.TestRepo;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Stateless
public class RenderQuestions {
    @Inject
    private TestQuestionRepo testQuestionRepo ;
    @Inject
    private TestRepo testRepo ;

    public CandidateAuthResponse responseAfterAuth(int idTest){
        Optional<Test> test = testRepo.findById(Test.class , idTest) ;
        String testName = test.isPresent() ? test.get().getName() : "Unknown Test" ;
        int duration = test.map(Test::getDurationMinute).orElse(0) ;
        Long totalQuestions = testQuestionRepo.countByTestId(idTest) ;
        return new CandidateAuthResponse(testName , totalQuestions , duration , idTest) ;
    }

    public List<CandidateQuestionResponse> getAllQuestionsByTestId(int testId) {
        Optional<Test> testOptional = testRepo.findById(Test.class, testId);

        if (testOptional.isEmpty()) {
            throw new IllegalArgumentException("Test not found with id: " + testId);
        }

        Test test = testOptional.get();

        return test.getTestQuestions().stream()
                .sorted(Comparator.comparingInt(TestQuestions::getPosition))
                .map(testQuestion -> {
                    Question question = testQuestion.getQuestion();
                    String questionType = question.getQuestionType() != null
                        ? question.getQuestionType().getDisplayName()
                        : "Unknown";

                    boolean isOpenQuestion = question.getAnswers() == null || question.getAnswers().isEmpty();

                    return new CandidateQuestionResponse(
                            question.getId(),
                            question.getLabel(),
                            question.getHint(),
                            questionType,
                            question.getPoints(),
                            isOpenQuestion ? null : question.getAnswers().stream()
                                    .map(answer -> new CandidateAnswerResponse(
                                            answer.getId(),
                                            answer.getLabel()
                                    ))
                                    .collect(Collectors.toSet())
                    );
                })
                .collect(Collectors.toList());
    }
}
