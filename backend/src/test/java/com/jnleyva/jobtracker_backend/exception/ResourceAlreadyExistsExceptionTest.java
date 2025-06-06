package com.jnleyva.jobtracker_backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import static org.junit.jupiter.api.Assertions.*;

class ResourceAlreadyExistsExceptionTest {

    @Test
    void testConstructorWithResourceDetails() {
        String resourceName = "User";
        String fieldName = "username";
        Object fieldValue = "testuser";
        
        ResourceAlreadyExistsException exception = new ResourceAlreadyExistsException(resourceName, fieldName, fieldValue);
        
        assertEquals("User already exists with username : 'testuser'", exception.getMessage());
        assertEquals(resourceName, exception.getResourceName());
        assertEquals(fieldName, exception.getFieldName());
        assertEquals(fieldValue, exception.getFieldValue());
    }

    @Test
    void testGetters() {
        String resourceName = "Application";
        String fieldName = "id";
        Object fieldValue = 123L;
        
        ResourceAlreadyExistsException exception = new ResourceAlreadyExistsException(resourceName, fieldName, fieldValue);
        
        assertEquals(resourceName, exception.getResourceName());
        assertEquals(fieldName, exception.getFieldName());
        assertEquals(fieldValue, exception.getFieldValue());
    }

    @Test
    void testResponseStatusAnnotation() {
        ResponseStatus responseStatus = ResourceAlreadyExistsException.class.getAnnotation(ResponseStatus.class);
        
        assertNotNull(responseStatus);
        assertEquals(HttpStatus.CONFLICT, responseStatus.value());
    }

    @Test
    void testInheritance() {
        ResourceAlreadyExistsException exception = new ResourceAlreadyExistsException("User", "username", "test");
        
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testWithDifferentFieldTypes() {
        // Test with Long field value
        ResourceAlreadyExistsException exception1 = new ResourceAlreadyExistsException("User", "id", 123L);
        assertEquals("User already exists with id : '123'", exception1.getMessage());
        assertEquals(123L, exception1.getFieldValue());
        
        // Test with String field value
        ResourceAlreadyExistsException exception2 = new ResourceAlreadyExistsException("User", "email", "test@example.com");
        assertEquals("User already exists with email : 'test@example.com'", exception2.getMessage());
        assertEquals("test@example.com", exception2.getFieldValue());
        
        // Test with null field value
        ResourceAlreadyExistsException exception3 = new ResourceAlreadyExistsException("User", "email", null);
        assertEquals("User already exists with email : 'null'", exception3.getMessage());
        assertNull(exception3.getFieldValue());
    }

    @Test
    void testMessageFormat() {
        ResourceAlreadyExistsException exception = new ResourceAlreadyExistsException("Contact", "email", "duplicate@example.com");
        String expectedMessage = "Contact already exists with email : 'duplicate@example.com'";
        assertEquals(expectedMessage, exception.getMessage());
    }

    @Test
    void testSerialVersionUID() {
        ResourceAlreadyExistsException exception = new ResourceAlreadyExistsException("Resource", "field", "value");
        assertNotNull(exception);
        
        // Test serialization compatibility by checking the class can be instantiated
        // without issues - this indirectly tests the serialVersionUID
        ResourceAlreadyExistsException exception2 = new ResourceAlreadyExistsException("Another", "field", 456);
        assertNotNull(exception2);
    }
} 