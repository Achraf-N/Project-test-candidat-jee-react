package com.tsix.apirest.dto.res;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
@AllArgsConstructor
@Getter
@Setter
public class QuestionResponse{
    private int id ;
    private String label ;
    private String hint ;
    private String types ;
    private double points ;
    private Set<AnswerResponse> answers ;
    private OpenAnswerResponse openAnswers ;
}
