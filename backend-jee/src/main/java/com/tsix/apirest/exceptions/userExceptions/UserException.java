package com.tsix.apirest.exceptions.userExceptions;

import jakarta.ejb.ApplicationException;
import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Response;
@ApplicationException(rollback = false)
public abstract class UserException extends RuntimeException {
    public UserException(String message) {
        super(message);
    }

    public abstract Response.Status getStatus();
}
