package com.tsix.apirest.exceptions.userExceptions;

import jakarta.ws.rs.core.Response;

public class AlreadyExistException extends UserException{

    public AlreadyExistException(String message) {
        super(message);
    }
    @Override
    public Response.Status getStatus() {
        return Response.Status.CONFLICT;
    }
}
