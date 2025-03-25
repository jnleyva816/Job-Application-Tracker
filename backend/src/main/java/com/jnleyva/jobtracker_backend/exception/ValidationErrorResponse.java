package com.jnleyva.jobtracker_backend.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ValidationErrorResponse extends ErrorResponse {
    private Map<String, String> errors;

    public ValidationErrorResponse() {
    }

    public ValidationErrorResponse(LocalDateTime timestamp, int status, String error, String message, String path, Map<String, String> errors) {
        super(timestamp, status, error, message, path);
        this.errors = errors;
    }

    public Map<String, String> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }
} 