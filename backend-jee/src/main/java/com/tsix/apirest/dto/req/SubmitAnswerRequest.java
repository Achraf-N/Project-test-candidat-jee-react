package com.tsix.apirest.dto.req;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SubmitAnswerRequest {
    private int questionId;
    private Integer selectedAnswerId;
    private String openAnswerText;
}
