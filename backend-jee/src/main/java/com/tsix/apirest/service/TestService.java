package com.tsix.apirest.service;

import com.tsix.apirest.dto.req.TestRequest;
import com.tsix.apirest.dto.req.TestSessionReq;
import com.tsix.apirest.dto.res.QuestionResponse;
import com.tsix.apirest.dto.res.TestQuestionResponse;
import com.tsix.apirest.dto.res.TestResponse;
import com.tsix.apirest.entity.enterprise.Enterprise;
import com.tsix.apirest.entity.test.*;
import com.tsix.apirest.exceptions.userExceptions.BadRequestException;
import com.tsix.apirest.mapper.QuestionMapper;
import com.tsix.apirest.mapper.TestMapper;
import com.tsix.apirest.mapper.TestSessionMapper;
import com.tsix.apirest.repository.*;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.mail.MessagingException;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Stateless
public class TestService {
    @Inject
    private QuestionRepo questionRepo;
    @Inject
    private OpenAnswerRepo openAnswerRepo ;
    @Inject
    private QuestionMapper mapper ;
    @Inject
    private TestMapper testMapper ;
    @Inject
    private TestRepo testRepo ;
    @Inject
    private TestSessionRepo testSessionRepo ;
    @Inject
    private EnterpriseRepo enterpriseRepo;

    public String insertQuestionAnswer(Question question){
        QuestionType questionType = question.getQuestionType();

        if (questionType == null) {
            throw new BadRequestException("Question type is required");
        }

        if(checkAnswer(question, questionType)){
            // Reset IDs for answers to force generation of new IDs
            question.getAnswers().forEach(answer -> {
                answer.setId(0);
                answer.setQuestion(question);
            });
            questionRepo.save(question);
            return "Question with id " + question.getId() + " saved successfully." ;
        } else if (checkOpenAnswer(question, questionType)) {
            OpenAnswer openAnswer = question.getOpenAnswers();

            //openAnswer.setId(0);

            question.getOpenAnswers().getKeyWords().forEach(keyWords -> {
                keyWords.setId(0);
                keyWords.setOpenAnswer(openAnswer);
            });
            openAnswer.setQuestion(question);
            Question q = questionRepo.save(question);
            return "Question with id " + q.getId() + " and its open answer saved successfully." ;
        }
       throw new BadRequestException("Invalid answers for question type: " + questionType) ;
    }

    public boolean checkAnswer(Question question, QuestionType questionType) {
        if (question.getAnswers() == null) {
            return false;
        }
        if (questionType == QuestionType.QCM) {
            return question.getAnswers()
                    .stream()
                    .anyMatch(Answer::isCorrect);
        } else if (questionType == QuestionType.TRUE_OR_FALSE) {
            return question.getAnswers()
                    .stream()
                    .anyMatch(a -> a.isCorrect() && "true".equalsIgnoreCase(a.getLabel()))
                    && question.getAnswers().size() == 2
                    && question.getAnswers()
                    .stream()
                    .filter(answer -> answer.getLabel().equalsIgnoreCase("true"))
                    .count() == 1
                    && question.getAnswers()
                    .stream()
                    .filter(Answer::isCorrect)
                    .count() == 1;
        }
        return false;
    }

    public boolean checkOpenAnswer(Question question, QuestionType questionType ){
        if (question.getOpenAnswers() == null){
            return false ;
        } else if (questionType == QuestionType.OPEN_QUESTION) {
            OpenAnswer openAnswer = question.getOpenAnswers();
            return !openAnswer.getKeyWords().isEmpty();
        }
        return false ;
    }

    public List<QuestionResponse> allQuestion(){
        List<Question> questions = questionRepo.findAll(Question.class) ;
        return questions.stream()
                .map(mapper::toDto)
                .toList() ;
    }

    public List<QuestionResponse> allQuestionByEnterpriseId(UUID id){
        List<Question> questions = questionRepo.findByEnterpriseId(id) ;
        return questions.stream()
                .map(mapper::toDto)
                .toList() ;
    }

    public String insertTest(TestRequest testRequest){
        Test test = testMapper.toTest(testRequest) ;
        List<Question> questions = testRequest.getQuestions() ;
        AtomicInteger position = new AtomicInteger(1);
        questions.forEach(
                question -> {
                    test.addQuestions(question , position.get());
                    position.getAndIncrement();
                }
        );
        testRepo.save(test);
        return "Test with id " + test.getId() + " saved successfully." ;
    }

    public List<TestResponse> getTestsByEnterpriseId(UUID enterpriseId) {
        List<Test> tests = testRepo.findByEnterpriseId(enterpriseId);
        return tests.stream()
                .map(this::mapToTestResponse)
                .collect(Collectors.toList());
    }

    private TestResponse mapToTestResponse(Test test) {
        return new TestResponse(
                test.getId(),
                test.getName(),
                test.getDurationMinute(),
                test.getIsActive(),
                test.getIsPublic(),
                test.getEnterprise() != null ? test.getEnterprise().getId() : null,
                test.getAdminAccount() != null ? test.getAdminAccount().getId() : null
        );
    }

    public List<TestQuestionResponse> getQuestionsByTestId(int testId, UUID enterpriseId) {
        Test test = testRepo.findByIdAndEnterpriseId(testId, enterpriseId)
                .orElseThrow(() -> new BadRequestException(
                        "Test not found or does not belong to your enterprise"));

        return test.getTestQuestions().stream()
                .sorted(Comparator.comparingInt(tq -> tq.getPosition()))
                .map(mapper::toTestQuestionDto)
                .collect(Collectors.toList());
    }

    public String registerCandidate(TestSessionReq req, UUID enterpriseId){
        List<TestSession> testSessions = TestSessionMapper.toEntity(req) ;
        testSessionRepo.saveAll(testSessions) ;
        String enterpriseName = enterpriseRepo.findById(Enterprise.class , enterpriseId).get().getName() ;
        testSessions.forEach(
                t -> {
                    try {
                        // Skip if email is null or empty
                        if (t.getEmailCandidate() != null && !t.getEmailCandidate().trim().isEmpty()) {
                            MailService.sendMail("test invitation from "+enterpriseName ,
                                    "you are invited to pass a test . your access code is : "+t.getCodeSession() +" be careful this code be only valid before "+t.getDateExpiration() ,
                                    t.getEmailCandidate()) ;
                        }
                    } catch (MessagingException e) {
                        throw new RuntimeException(e);
                    }
                }
        );
        return "Test invitation sent successfully" ;
    }

    public List<com.tsix.apirest.dto.res.TestSessionResponse> getTestSessionsByTestId(int testId, UUID enterpriseId) {
        // Verify test belongs to enterprise
        Test test = testRepo.findByIdAndEnterpriseId(testId, enterpriseId)
                .orElseThrow(() -> new BadRequestException("Test not found or access denied"));

        List<TestSession> sessions = testSessionRepo.findByTestId(testId);

        return sessions.stream()
                .map(session -> {
                    com.tsix.apirest.dto.res.TestSessionResponse response = new com.tsix.apirest.dto.res.TestSessionResponse();
                    response.setSessionId(session.getId());
                    response.setCandidateEmail(session.getEmailCandidate());
                    response.setAccessCode(session.getCodeSession());
                    response.setStartTime(session.getDateCreation());
                    response.setExpirationTime(session.getDateExpiration());
                    response.setIsUsed(session.getIsUsed());
                    response.setStatus(session.getStatus().name());
                    response.setScore(session.getScore());
                    response.setTestName(test.getName());
                    response.setTestId(test.getId());
                    response.setTestDuration(test.getDurationMinute());
                    return response;
                })
                .collect(Collectors.toList());
    }

}
