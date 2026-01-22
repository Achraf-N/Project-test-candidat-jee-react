package com.tsix.apirest.dto.res;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TestSessionResponse {
    private Long sessionId;
    private String candidateEmail;
    private String accessCode;
    private LocalDateTime startTime;
    private LocalDateTime expirationTime;
    private Boolean isUsed;
    private String status;
    private Double score;
    private String testName;
    private Integer testId;
    private Integer testDuration;
}

