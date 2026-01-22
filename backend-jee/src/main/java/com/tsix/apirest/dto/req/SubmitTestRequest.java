package com.tsix.apirest.dto.req;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SubmitTestRequest {
    private Long testSessionId;
    private List<SubmitAnswerRequest> answers;
}

