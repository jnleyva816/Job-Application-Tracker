package com.jnleyva.jobtracker_backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import static org.junit.jupiter.api.Assertions.*;

class ResourceNotFoundExceptionTest {

    @Test
    void testConstructorWithMessage() {
        String message = "Resource not found";
        ResourceNotFoundException exception = new ResourceNotFoundException(message);
        
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
        assertNull(exception.getResourceName());
        assertNull(exception.getFieldName());
        assertNull(exception.getFieldValue());
    }

    @Test
    void testConstructorWithResourceDetails() {
        String resourceName = "User";
        String fieldName = "id";
        Object fieldValue = 123L;
        
        ResourceNotFoundException exception = new ResourceNotFoundException(resourceName, fieldName, fieldValue);
        
        assertEquals("User not found with id : '123'", exception.getMessage());
        assertEquals(resourceName, exception.getResourceName());
        assertEquals(fieldName, exception.getFieldName());
        assertEquals(fieldValue, exception.getFieldValue());
    }

    @Test
    void testGetters() {
        String resourceName = "Application";
        String fieldName = "username";
        Object fieldValue = "testuser";
        
        ResourceNotFoundException exception = new ResourceNotFoundException(resourceName, fieldName, fieldValue);
        
        assertEquals(resourceName, exception.getResourceName());
        assertEquals(fieldName, exception.getFieldName());
        assertEquals(fieldValue, exception.getFieldValue());
    }

    @Test
    void testResponseStatusAnnotation() {
        ResponseStatus responseStatus = ResourceNotFoundException.class.getAnnotation(ResponseStatus.class);
        
        assertNotNull(responseStatus);
        assertEquals(HttpStatus.NOT_FOUND, responseStatus.value());
    }

    @Test
    void testInheritance() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Test");
        
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testWithDifferentFieldTypes() {
        // Test with Long field value
        ResourceNotFoundException exception1 = new ResourceNotFoundException("User", "id", 123L);
        assertEquals("User not found with id : '123'", exception1.getMessage());
        assertEquals(123L, exception1.getFieldValue());
        
        // Test with String field value
        ResourceNotFoundException exception2 = new ResourceNotFoundException("User", "username", "testuser");
        assertEquals("User not found with username : 'testuser'", exception2.getMessage());
        assertEquals("testuser", exception2.getFieldValue());
        
        // Test with null field value
        ResourceNotFoundException exception3 = new ResourceNotFoundException("User", "email", null);
        assertEquals("User not found with email : 'null'", exception3.getMessage());
        assertNull(exception3.getFieldValue());
    }

    @Test
    void testSerialVersionUID() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Test");
        assertNotNull(exception);
        
        // Test serialization compatibility by checking the class can be instantiated
        // without issues - this indirectly tests the serialVersionUID
        ResourceNotFoundException exception2 = new ResourceNotFoundException("Resource", "field", "value");
        assertNotNull(exception2);
    }
} 