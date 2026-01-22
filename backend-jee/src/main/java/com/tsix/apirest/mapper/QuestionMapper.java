package com.tsix.apirest.mapper;

import com.tsix.apirest.dto.res.AnswerResponse;
import com.tsix.apirest.dto.res.KeywordResponse;
import com.tsix.apirest.dto.res.OpenAnswerResponse;
import com.tsix.apirest.dto.res.QuestionResponse;
import com.tsix.apirest.dto.res.TestQuestionResponse;
import com.tsix.apirest.entity.test.Question;
import com.tsix.apirest.entity.test.TestQuestions;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.stream.Collectors;

@ApplicationScoped
public class QuestionMapper {
    public QuestionResponse toDto(Question question) {

        return new QuestionResponse(
                question.getId(),
                question.getLabel(),
                question.getHint(),
                question.getQuestionType() != null ? question.getQuestionType().getDisplayName() : "Unknown",
                question.getPoints(),

                question.getAnswers().stream()
                        .map(a -> new AnswerResponse(
                                a.getId(),
                                a.getLabel(),
                                a.isCorrect()
                        ))
                        .collect(Collectors.toSet()),

                question.getOpenAnswers() != null
                        ? new OpenAnswerResponse(
                        question.getOpenAnswers().getId(),
                        question.getOpenAnswers().getExpectedAnswer(),
                        question.getOpenAnswers().getKeyWords().stream()
                                .map(k -> new KeywordResponse(
                                        k.getId(),
                                        k.getKeyword()
                                ))
                                .collect(Collectors.toSet())
                )
                        : null
        );
    }

    public TestQuestionResponse toTestQuestionDto(TestQuestions testQuestion) {
        Question question = testQuestion.getQuestion();

        return new TestQuestionResponse(
                testQuestion.getPosition(),
                question.getId(),
                question.getLabel(),
                question.getHint(),
                question.getQuestionType() != null ? question.getQuestionType().getDisplayName() : "Unknown",
                question.getPoints(),

                question.getAnswers().stream()
                        .map(a -> new AnswerResponse(
                                a.getId(),
                                a.getLabel(),
                                a.isCorrect()
                        ))
                        .collect(Collectors.toSet()),

                question.getOpenAnswers() != null
                        ? new OpenAnswerResponse(
                        question.getOpenAnswers().getId(),
                        question.getOpenAnswers().getExpectedAnswer(),
                        question.getOpenAnswers().getKeyWords().stream()
                                .map(k -> new KeywordResponse(
                                        k.getId(),
                                        k.getKeyword()
                                ))
                                .collect(Collectors.toSet())
                )
                        : null
        );
    }
}
