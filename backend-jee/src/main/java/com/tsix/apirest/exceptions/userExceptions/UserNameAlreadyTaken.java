package com.tsix.apirest.exceptions.userExceptions;

import jakarta.ws.rs.core.Response;

public class UserNameAlreadyTaken extends UserException{
    public UserNameAlreadyTaken() {
        super("username already taken");
    }

    @Override
    public Response.Status getStatus() {
        return Response.Status.CONFLICT;
    }
}
