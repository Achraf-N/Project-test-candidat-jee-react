package com.tsix.apirest.exceptions.userExceptions;

import jakarta.ws.rs.core.Response;

public class BadRequestException extends UserException{
    public BadRequestException(String message) {
        super(message);
    }

    @Override
    public Response.Status getStatus() {
        return Response.Status.BAD_REQUEST;
    }
}
