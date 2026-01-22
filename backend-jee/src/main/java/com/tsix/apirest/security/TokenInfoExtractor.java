package com.tsix.apirest.security;

import jakarta.ws.rs.core.SecurityContext;

import java.util.UUID;

public class TokenInfoExtractor {
    public static Long getIdFromToken(SecurityContext securityContext){
        UserPrincipal userPrincipal = (UserPrincipal) securityContext.getUserPrincipal();
        if (userPrincipal == null){
            return null;
        }
        return userPrincipal.getUserId();
    }

    public static UUID getEnterpriseIdFromToken(SecurityContext securityContext){
        UserPrincipal userPrincipal = (UserPrincipal) securityContext.getUserPrincipal();
        if (userPrincipal == null){
            return null;
        }
        return userPrincipal.getEnterpriseId();
    }

    public static UserPrincipal getUserPrincipal(SecurityContext securityContext){
        return (UserPrincipal) securityContext.getUserPrincipal();
    }
}
