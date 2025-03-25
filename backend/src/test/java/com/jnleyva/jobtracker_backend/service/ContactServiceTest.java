package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.Contact;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.repository.ContactRepository;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private ContactService contactService;

    private Application application;
    private Contact contact;
    private Long applicationId;
    private Long contactId;

    @BeforeEach
    void setUp() {
        applicationId = 1L;
        contactId = 1L;

        application = new Application();
        application.setId(applicationId);

        contact = new Contact();
        contact.setId(contactId);
        contact.setName("John Doe");
        contact.setEmail("john@example.com");
        contact.setPhone("123-456-7890");
        contact.setPosition("HR Manager");
        contact.setApplication(application);
    }

    @Test
    void getAllContacts_WhenApplicationExists_ReturnsContacts() {
        List<Contact> expectedContacts = Arrays.asList(contact);
        when(applicationRepository.existsById(applicationId)).thenReturn(true);
        when(contactRepository.findByApplicationId(applicationId)).thenReturn(expectedContacts);

        List<Contact> actualContacts = contactService.getAllContacts(applicationId);

        assertEquals(expectedContacts, actualContacts);
        verify(applicationRepository).existsById(applicationId);
        verify(contactRepository).findByApplicationId(applicationId);
    }

    @Test
    void getAllContacts_WhenApplicationDoesNotExist_ThrowsException() {
        when(applicationRepository.existsById(applicationId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> contactService.getAllContacts(applicationId));
        verify(applicationRepository).existsById(applicationId);
        verify(contactRepository, never()).findByApplicationId(any());
    }

    @Test
    void getContact_WhenContactExists_ReturnsContact() {
        when(contactRepository.existsByApplicationIdAndId(applicationId, contactId)).thenReturn(true);
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(contact));

        Contact actualContact = contactService.getContact(applicationId, contactId);

        assertEquals(contact, actualContact);
        verify(contactRepository).existsByApplicationIdAndId(applicationId, contactId);
        verify(contactRepository).findById(contactId);
    }

    @Test
    void getContact_WhenContactDoesNotExist_ThrowsException() {
        when(contactRepository.existsByApplicationIdAndId(applicationId, contactId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> contactService.getContact(applicationId, contactId));
        verify(contactRepository).existsByApplicationIdAndId(applicationId, contactId);
        verify(contactRepository, never()).findById(any());
    }

    @Test
    void createContact_WhenApplicationExists_ReturnsCreatedContact() {
        when(applicationRepository.existsById(applicationId)).thenReturn(true);
        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);

        Contact actualContact = contactService.createContact(applicationId, contact);

        assertEquals(contact, actualContact);
        verify(applicationRepository).existsById(applicationId);
        verify(applicationRepository).findById(applicationId);
        verify(contactRepository).save(contact);
    }

    @Test
    void createContact_WhenApplicationDoesNotExist_ThrowsException() {
        when(applicationRepository.existsById(applicationId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> contactService.createContact(applicationId, contact));
        verify(applicationRepository).existsById(applicationId);
        verify(applicationRepository, never()).findById(any());
        verify(contactRepository, never()).save(any());
    }

    @Test
    void updateContact_WhenContactExists_ReturnsUpdatedContact() {
        Contact updatedContact = new Contact();
        updatedContact.setName("Jane Doe");
        updatedContact.setEmail("jane@example.com");
        updatedContact.setPhone("098-765-4321");
        updatedContact.setPosition("Recruiter");

        when(contactRepository.existsByApplicationIdAndId(applicationId, contactId)).thenReturn(true);
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);

        Contact actualContact = contactService.updateContact(applicationId, contactId, updatedContact);

        assertEquals(contact.getName(), actualContact.getName());
        assertEquals(contact.getEmail(), actualContact.getEmail());
        assertEquals(contact.getPhone(), actualContact.getPhone());
        assertEquals(contact.getPosition(), actualContact.getPosition());
        verify(contactRepository).existsByApplicationIdAndId(applicationId, contactId);
        verify(contactRepository).findById(contactId);
        verify(contactRepository).save(contact);
    }

    @Test
    void updateContact_WhenContactDoesNotExist_ThrowsException() {
        when(contactRepository.existsByApplicationIdAndId(applicationId, contactId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> contactService.updateContact(applicationId, contactId, contact));
        verify(contactRepository).existsByApplicationIdAndId(applicationId, contactId);
        verify(contactRepository, never()).findById(any());
        verify(contactRepository, never()).save(any());
    }

    @Test
    void deleteContact_WhenContactExists_DeletesContact() {
        when(contactRepository.existsByApplicationIdAndId(applicationId, contactId)).thenReturn(true);

        contactService.deleteContact(applicationId, contactId);

        verify(contactRepository).existsByApplicationIdAndId(applicationId, contactId);
        verify(contactRepository).deleteById(contactId);
    }

    @Test
    void deleteContact_WhenContactDoesNotExist_ThrowsException() {
        when(contactRepository.existsByApplicationIdAndId(applicationId, contactId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> contactService.deleteContact(applicationId, contactId));
        verify(contactRepository).existsByApplicationIdAndId(applicationId, contactId);
        verify(contactRepository, never()).deleteById(any());
    }
} 