package com.tsix.apirest.dto.res;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CandidateQuestionResponse {
    private int id;
    private String label;
    private String hint;
    private String questionType;
    private double points;
    private Set<CandidateAnswerResponse> answers;
}
