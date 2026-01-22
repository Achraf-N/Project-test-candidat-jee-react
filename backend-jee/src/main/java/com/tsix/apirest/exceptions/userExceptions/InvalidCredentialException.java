package com.tsix.apirest.exceptions.userExceptions;

import jakarta.ws.rs.core.Response;

public class InvalidCredentialException extends UserException{
    public InvalidCredentialException() {
        super("invalid credentials or expired token");
    }

    @Override
    public Response.Status getStatus() {
        return Response.Status.UNAUTHORIZED;
    }
}
