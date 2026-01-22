package com.tsix.apirest.dto.res;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OpenQuestionScoreResponse {
    private int questionId;
    private int score;
    private String feedback;
    private int maxPoints;
}
