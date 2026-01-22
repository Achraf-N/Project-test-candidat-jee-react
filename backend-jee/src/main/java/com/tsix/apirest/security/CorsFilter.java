package com.tsix.apirest.security;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Provider
public class CorsFilter implements ContainerResponseFilter {

    private static final List<String> ALLOWED_ORIGINS = Arrays.asList(
        "http://localhost:8081",
        "http://localhost:8082",
        "http://localhost:3000",
        "http://localhost:5173"
    );

    @Override
    public void filter(ContainerRequestContext requestContext,
                      ContainerResponseContext responseContext) throws IOException {

        // Get the origin from the request
        String origin = requestContext.getHeaderString("Origin");

        // Allow specific origin if it's in the allowed list
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            responseContext.getHeaders().add("Access-Control-Allow-Origin", origin);
        }

        // Allow credentials (cookies)
        responseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");

        // Allow common HTTP methods
        responseContext.getHeaders().add("Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH");

        // Allow common headers
        responseContext.getHeaders().add("Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept, Authorization, X-Requested-With, Cookie");

        // Expose headers to the client
        responseContext.getHeaders().add("Access-Control-Expose-Headers",
            "Content-Type, Set-Cookie");

        // Cache preflight response for 1 hour
        responseContext.getHeaders().add("Access-Control-Max-Age", "3600");
    }
}

