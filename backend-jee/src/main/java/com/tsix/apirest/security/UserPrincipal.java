package com.tsix.apirest.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.Principal;
import java.util.UUID;

/**
 * Principal class to hold user information extracted from JWT token
 * Implements Principal to integrate with JAX-RS SecurityContext
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPrincipal implements Principal {
    private Long userId;
    private UUID enterpriseId;

    @Override
    public String getName() {
        return userId != null ? userId.toString() : null;
    }
}

