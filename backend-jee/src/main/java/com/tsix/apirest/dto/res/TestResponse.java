package com.tsix.apirest.dto.res;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TestResponse {
    private int id;
    private String name;
    private int durationMinute;
    private Boolean isActive;
    private Boolean isPublic;
    private UUID enterpriseId;
    private Long adminAccountId;
}

