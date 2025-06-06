package com.jnleyva.jobtracker_backend.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class ContactTest {

    private Application testApplication;
    private Contact contact;

    @BeforeEach
    void setUp() {
        testApplication = new Application();
        testApplication.setId(1L);
        testApplication.setCompany("Test Company");
        testApplication.setJobTitle("Software Developer");
    }

    @Test
    void testDefaultConstructor() {
        Contact contact = new Contact();
        
        assertNull(contact.getId());
        assertNull(contact.getName());
        assertNull(contact.getEmail());
        assertNull(contact.getPhone());
        assertNull(contact.getPosition());
        assertNull(contact.getApplication());
    }

    @Test
    void testParameterizedConstructor() {
        Long id = 1L;
        String name = "John Doe";
        String email = "john@example.com";
        String phone = "123-456-7890";
        String position = "HR Manager";
        
        Contact contact = new Contact(id, name, email, phone, position, testApplication);
        
        assertEquals(id, contact.getId());
        assertEquals(name, contact.getName());
        assertEquals(email, contact.getEmail());
        assertEquals(phone, contact.getPhone());
        assertEquals(position, contact.getPosition());
        assertEquals(testApplication, contact.getApplication());
    }

    @Test
    void testGettersAndSetters() {
        Contact contact = new Contact();
        
        // Test ID
        contact.setId(1L);
        assertEquals(1L, contact.getId());
        
        // Test Name
        String name = "Jane Smith";
        contact.setName(name);
        assertEquals(name, contact.getName());
        
        // Test Email
        String email = "jane@example.com";
        contact.setEmail(email);
        assertEquals(email, contact.getEmail());
        
        // Test Phone
        String phone = "098-765-4321";
        contact.setPhone(phone);
        assertEquals(phone, contact.getPhone());
        
        // Test Position
        String position = "Recruiter";
        contact.setPosition(position);
        assertEquals(position, contact.getPosition());
        
        // Test Application
        contact.setApplication(testApplication);
        assertEquals(testApplication, contact.getApplication());
    }

    @Test
    void testContactWithValidData() {
        Contact contact = new Contact();
        contact.setId(1L);
        contact.setName("Alice Johnson");
        contact.setEmail("alice@company.com");
        contact.setPhone("+1-555-123-4567");
        contact.setPosition("Technical Recruiter");
        contact.setApplication(testApplication);
        
        assertEquals(1L, contact.getId());
        assertEquals("Alice Johnson", contact.getName());
        assertEquals("alice@company.com", contact.getEmail());
        assertEquals("+1-555-123-4567", contact.getPhone());
        assertEquals("Technical Recruiter", contact.getPosition());
        assertEquals(testApplication, contact.getApplication());
    }

    @Test
    void testContactWithNullValues() {
        Contact contact = new Contact();
        
        // Test setting null values (should be allowed except for name and application)
        contact.setId(null);
        contact.setName(null);
        contact.setEmail(null);
        contact.setPhone(null);
        contact.setPosition(null);
        contact.setApplication(null);
        
        assertNull(contact.getId());
        assertNull(contact.getName());
        assertNull(contact.getEmail());
        assertNull(contact.getPhone());
        assertNull(contact.getPosition());
        assertNull(contact.getApplication());
    }

    @Test
    void testContactWithEmptyStrings() {
        Contact contact = new Contact();
        
        contact.setName("");
        contact.setEmail("");
        contact.setPhone("");
        contact.setPosition("");
        
        assertEquals("", contact.getName());
        assertEquals("", contact.getEmail());
        assertEquals("", contact.getPhone());
        assertEquals("", contact.getPosition());
    }

    @Test
    void testContactWithLongStrings() {
        Contact contact = new Contact();
        
        String longName = "A".repeat(100);
        String longEmail = "test@" + "a".repeat(100) + ".com";
        String longPhone = "1".repeat(20);
        String longPosition = "Senior Staff Principal Architect Engineer Manager Director";
        
        contact.setName(longName);
        contact.setEmail(longEmail);
        contact.setPhone(longPhone);
        contact.setPosition(longPosition);
        
        assertEquals(longName, contact.getName());
        assertEquals(longEmail, contact.getEmail());
        assertEquals(longPhone, contact.getPhone());
        assertEquals(longPosition, contact.getPosition());
    }

    @Test
    void testEqualsAndHashCodeFromLombok() {
        Contact contact1 = new Contact(1L, "John Doe", "john@example.com", "123-456-7890", "HR Manager", testApplication);
        Contact contact2 = new Contact(1L, "John Doe", "john@example.com", "123-456-7890", "HR Manager", testApplication);
        
        // Test equals (provided by Lombok @Data)
        assertEquals(contact1, contact2);
        assertEquals(contact1.hashCode(), contact2.hashCode());
    }

    @Test
    void testNotEqualsWithDifferentValues() {
        Contact contact1 = new Contact(1L, "John Doe", "john@example.com", "123-456-7890", "HR Manager", testApplication);
        Contact contact2 = new Contact(2L, "Jane Smith", "jane@example.com", "098-765-4321", "Recruiter", testApplication);
        
        // Test not equals
        assertNotEquals(contact1, contact2);
    }

    @Test
    void testToStringFromLombok() {
        Contact contact = new Contact(1L, "John Doe", "john@example.com", "123-456-7890", "HR Manager", testApplication);
        
        String toString = contact.toString();
        
        // Should contain class name and field values (provided by Lombok @Data)
        assertNotNull(toString);
        assertTrue(toString.contains("Contact"));
        assertTrue(toString.contains("John Doe"));
        assertTrue(toString.contains("john@example.com"));
        assertTrue(toString.contains("123-456-7890"));
        assertTrue(toString.contains("HR Manager"));
    }

    @Test
    void testContactWithDifferentApplications() {
        Application app1 = new Application();
        app1.setId(1L);
        app1.setCompany("Company A");
        
        Application app2 = new Application();
        app2.setId(2L);
        app2.setCompany("Company B");
        
        Contact contact = new Contact();
        
        // Test switching applications
        contact.setApplication(app1);
        assertEquals(app1, contact.getApplication());
        
        contact.setApplication(app2);
        assertEquals(app2, contact.getApplication());
    }

    @Test
    void testContactFieldsIndependence() {
        Contact contact = new Contact();
        
        // Test that setting one field doesn't affect others
        contact.setName("Test Name");
        assertNull(contact.getEmail());
        assertNull(contact.getPhone());
        assertNull(contact.getPosition());
        
        contact.setEmail("test@example.com");
        assertEquals("Test Name", contact.getName());
        assertNull(contact.getPhone());
        assertNull(contact.getPosition());
        
        contact.setPhone("123-456-7890");
        assertEquals("Test Name", contact.getName());
        assertEquals("test@example.com", contact.getEmail());
        assertNull(contact.getPosition());
        
        contact.setPosition("Manager");
        assertEquals("Test Name", contact.getName());
        assertEquals("test@example.com", contact.getEmail());
        assertEquals("123-456-7890", contact.getPhone());
    }
} 