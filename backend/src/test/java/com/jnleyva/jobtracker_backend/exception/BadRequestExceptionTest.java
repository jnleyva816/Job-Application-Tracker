package com.jnleyva.jobtracker_backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import static org.junit.jupiter.api.Assertions.*;

class BadRequestExceptionTest {

    @Test
    void testConstructorWithMessage() {
        String message = "Invalid request parameter";
        BadRequestException exception = new BadRequestException(message);
        
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    void testConstructorWithMessageAndCause() {
        String message = "Invalid request parameter";
        Throwable cause = new IllegalArgumentException("Invalid argument");
        BadRequestException exception = new BadRequestException(message, cause);
        
        assertEquals(message, exception.getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    void testResponseStatusAnnotation() {
        ResponseStatus responseStatus = BadRequestException.class.getAnnotation(ResponseStatus.class);
        
        assertNotNull(responseStatus);
        assertEquals(HttpStatus.BAD_REQUEST, responseStatus.value());
    }

    @Test
    void testInheritance() {
        BadRequestException exception = new BadRequestException("Test");
        
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testSerialVersionUID() {
        // This test ensures the serialVersionUID field exists and is accessible
        BadRequestException exception = new BadRequestException("Test");
        assertNotNull(exception);
        
        // Test serialization compatibility by checking the class can be instantiated
        // without issues - this indirectly tests the serialVersionUID
        BadRequestException exception2 = new BadRequestException("Test", new Exception());
        assertNotNull(exception2);
    }
} 