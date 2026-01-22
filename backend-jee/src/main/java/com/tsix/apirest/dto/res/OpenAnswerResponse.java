package com.tsix.apirest.dto.res;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
@AllArgsConstructor
@Getter
@Setter
public class OpenAnswerResponse {
    private int id ;
    private String expectedAnswer ;
    private Set<KeywordResponse> keywords ;
}
