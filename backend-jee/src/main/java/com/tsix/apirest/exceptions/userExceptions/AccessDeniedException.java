package com.tsix.apirest.exceptions.userExceptions;

import jakarta.ws.rs.core.Response;

public class AccessDeniedException extends UserException{

    public AccessDeniedException() {
        super("access denied");
    }

    @Override
    public Response.Status getStatus() {
        return Response.Status.FORBIDDEN;
    }
}
