package com.jnleyva.jobtracker_backend.exception;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class ErrorResponseTest {

    @Test
    void testDefaultConstructor() {
        ErrorResponse errorResponse = new ErrorResponse();
        
        assertNull(errorResponse.getTimestamp());
        assertEquals(0, errorResponse.getStatus());
        assertNull(errorResponse.getError());
        assertNull(errorResponse.getMessage());
        assertNull(errorResponse.getPath());
    }

    @Test
    void testParameterizedConstructor() {
        LocalDateTime timestamp = LocalDateTime.now();
        int status = 404;
        String error = "Not Found";
        String message = "Resource not found";
        String path = "/api/users/123";
        
        ErrorResponse errorResponse = new ErrorResponse(timestamp, status, error, message, path);
        
        assertEquals(timestamp, errorResponse.getTimestamp());
        assertEquals(status, errorResponse.getStatus());
        assertEquals(error, errorResponse.getError());
        assertEquals(message, errorResponse.getMessage());
        assertEquals(path, errorResponse.getPath());
    }

    @Test
    void testGettersAndSetters() {
        ErrorResponse errorResponse = new ErrorResponse();
        
        // Test timestamp
        LocalDateTime timestamp = LocalDateTime.now();
        errorResponse.setTimestamp(timestamp);
        assertEquals(timestamp, errorResponse.getTimestamp());
        
        // Test status
        int status = 400;
        errorResponse.setStatus(status);
        assertEquals(status, errorResponse.getStatus());
        
        // Test error
        String error = "Bad Request";
        errorResponse.setError(error);
        assertEquals(error, errorResponse.getError());
        
        // Test message
        String message = "Invalid input";
        errorResponse.setMessage(message);
        assertEquals(message, errorResponse.getMessage());
        
        // Test path
        String path = "/api/applications";
        errorResponse.setPath(path);
        assertEquals(path, errorResponse.getPath());
    }

    @Test
    void testWithNullValues() {
        ErrorResponse errorResponse = new ErrorResponse();
        
        errorResponse.setTimestamp(null);
        errorResponse.setStatus(0);
        errorResponse.setError(null);
        errorResponse.setMessage(null);
        errorResponse.setPath(null);
        
        assertNull(errorResponse.getTimestamp());
        assertEquals(0, errorResponse.getStatus());
        assertNull(errorResponse.getError());
        assertNull(errorResponse.getMessage());
        assertNull(errorResponse.getPath());
    }

    @Test
    void testWithEmptyStrings() {
        ErrorResponse errorResponse = new ErrorResponse();
        
        errorResponse.setError("");
        errorResponse.setMessage("");
        errorResponse.setPath("");
        
        assertEquals("", errorResponse.getError());
        assertEquals("", errorResponse.getMessage());
        assertEquals("", errorResponse.getPath());
    }

    @Test
    void testCommonHttpStatuses() {
        ErrorResponse badRequest = new ErrorResponse(LocalDateTime.now(), 400, "Bad Request", "Invalid input", "/api/test");
        assertEquals(400, badRequest.getStatus());
        
        ErrorResponse unauthorized = new ErrorResponse(LocalDateTime.now(), 401, "Unauthorized", "Access denied", "/api/test");
        assertEquals(401, unauthorized.getStatus());
        
        ErrorResponse forbidden = new ErrorResponse(LocalDateTime.now(), 403, "Forbidden", "Insufficient permissions", "/api/test");
        assertEquals(403, forbidden.getStatus());
        
        ErrorResponse notFound = new ErrorResponse(LocalDateTime.now(), 404, "Not Found", "Resource not found", "/api/test");
        assertEquals(404, notFound.getStatus());
        
        ErrorResponse conflict = new ErrorResponse(LocalDateTime.now(), 409, "Conflict", "Resource already exists", "/api/test");
        assertEquals(409, conflict.getStatus());
        
        ErrorResponse serverError = new ErrorResponse(LocalDateTime.now(), 500, "Internal Server Error", "Unexpected error", "/api/test");
        assertEquals(500, serverError.getStatus());
    }

    @Test
    void testFieldIndependence() {
        ErrorResponse errorResponse = new ErrorResponse();
        
        // Test that setting one field doesn't affect others
        LocalDateTime timestamp = LocalDateTime.now();
        errorResponse.setTimestamp(timestamp);
        assertEquals(0, errorResponse.getStatus());
        assertNull(errorResponse.getError());
        
        errorResponse.setStatus(500);
        assertEquals(timestamp, errorResponse.getTimestamp());
        assertNull(errorResponse.getError());
        assertNull(errorResponse.getMessage());
        
        errorResponse.setError("Server Error");
        assertEquals(timestamp, errorResponse.getTimestamp());
        assertEquals(500, errorResponse.getStatus());
        assertNull(errorResponse.getMessage());
        assertNull(errorResponse.getPath());
    }
} 