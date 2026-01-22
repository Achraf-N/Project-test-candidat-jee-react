package com.tsix.apirest.dto.req;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OpenQuestionScoreRequest {
    private int questionId;
    private String studentAnswer;
    private String modelAnswer;
    private int maxPoints;
}
