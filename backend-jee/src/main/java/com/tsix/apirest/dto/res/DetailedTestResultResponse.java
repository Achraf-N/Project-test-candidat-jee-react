package com.tsix.apirest.dto.res;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DetailedTestResultResponse {
    private Long testSessionId;
    private String testName;
    private double totalScore;
    private double totalPossiblePoints;
    private String totalScoreFraction; // e.g., "14/15"
    private double scorePercentage;
    private int totalQuestions;
    private int answeredQuestions;
    private String status;
    private List<QuestionResultResponse> questionResults;
}

