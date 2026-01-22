package com.tsix.apirest.dto.res;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class QuestionResultResponse {
    private int questionId;
    private String questionLabel;
    private String questionType;
    private String candidateAnswer;
    private String correctAnswer;
    private Boolean isCorrect;
    private String scoreFraction; // e.g., "5/5" or "8/10"
    private double pointsEarned;
    private double maxPoints;
}
