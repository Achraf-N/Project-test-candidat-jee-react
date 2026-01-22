package com.tsix.apirest.exceptions.userExceptions;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class UserExceptionMapper implements ExceptionMapper<UserException> {

    @Override
    public Response toResponse(UserException e) {
        return Response
                .status(e.getStatus())
                .entity(e.getMessage())
                .build();
    }
}
