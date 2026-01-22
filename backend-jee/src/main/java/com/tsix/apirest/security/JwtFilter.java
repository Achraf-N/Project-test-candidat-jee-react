package com.tsix.apirest.security;

import com.tsix.apirest.security.JwtUtils;
import com.tsix.apirest.security.Secured;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;

import java.io.IOException;
import java.security.Principal;
import java.util.Map;

@Secured
@Provider
@Priority(Priorities.AUTHENTICATION)
public class JwtFilter implements ContainerRequestFilter {
    @Inject
    JwtUtils jwtUtils ;

    @Override
    public void filter(ContainerRequestContext containerRequestContext) throws IOException {
        String jwt = extractToken(containerRequestContext) ;

        if (jwt == null || !jwtUtils.isValid(jwt)) {
            abort(containerRequestContext);
            return;
        }


        UserPrincipal userPrincipal = jwtUtils.extractUserData(jwt);
        if (userPrincipal != null) {
            final SecurityContext currentSecurityContext = containerRequestContext.getSecurityContext();
            containerRequestContext.setSecurityContext(new SecurityContext() {
                @Override
                public Principal getUserPrincipal() {
                    return userPrincipal;
                }

                @Override
                public boolean isUserInRole(String role) {
                    return true;
                }

                @Override
                public boolean isSecure() {
                    return currentSecurityContext.isSecure();
                }

                @Override
                public String getAuthenticationScheme() {
                    return "Bearer";
                }
            });
        }
    }

    private String extractToken(ContainerRequestContext ctx){
        Map<String , Cookie> cookies = ctx.getCookies();
        Cookie jwtCookie = cookies.get("test_token") ;
        return jwtCookie != null ?
                jwtCookie.getValue()
                : null ;
    }

    private void abort(ContainerRequestContext ctx){
        ctx.abortWith(
                Response
                        .status(Response.Status.FORBIDDEN)
                        .entity("Access denied")
                        .build()
        );
    }
}
