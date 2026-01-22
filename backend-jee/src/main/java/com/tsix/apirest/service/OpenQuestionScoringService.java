package com.tsix.apirest.service;

import com.tsix.apirest.dto.req.OpenQuestionScoreRequest;
import com.tsix.apirest.dto.res.OpenQuestionScoreResponse;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

@Stateless
public class OpenQuestionScoringService {
    
    @Inject
    private GroqScoringService groqScoringService;
    
    /**
     * Score a single open question answer using Groq API
     */
    public OpenQuestionScoreResponse scoreSingleAnswer(int questionId, String studentAnswer, 
                                                        String modelAnswer, int maxPoints) {
        OpenQuestionScoreRequest request = new OpenQuestionScoreRequest(
            questionId, studentAnswer, modelAnswer, maxPoints
        );
        return groqScoringService.scoreOpenQuestion(request);
    }
}
