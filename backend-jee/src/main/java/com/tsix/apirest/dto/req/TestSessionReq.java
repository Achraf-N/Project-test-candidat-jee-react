package com.tsix.apirest.dto.req;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
@NoArgsConstructor
@Getter
@Setter
public class TestSessionReq {
    private List<String> emailCandidate;
    private LocalDateTime dateExpiration ;
    private int testId ;
}
