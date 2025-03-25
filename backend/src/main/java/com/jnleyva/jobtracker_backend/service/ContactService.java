package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.Contact;
import com.jnleyva.jobtracker_backend.repository.ContactRepository;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContactService {
    
    @Autowired
    private ContactRepository contactRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;

    public List<Contact> getAllContacts(Long applicationId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application", "id", applicationId);
        }
        return contactRepository.findByApplicationId(applicationId);
    }

    public Contact getContact(Long applicationId, Long contactId) {
        if (!contactRepository.existsByApplicationIdAndId(applicationId, contactId)) {
            throw new ResourceNotFoundException("Contact", "id", contactId);
        }
        return contactRepository.findById(contactId).orElseThrow();
    }

    @Transactional
    public Contact createContact(Long applicationId, Contact contact) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application", "id", applicationId);
        }
        contact.setApplication(applicationRepository.findById(applicationId).orElseThrow());
        return contactRepository.save(contact);
    }

    @Transactional
    public Contact updateContact(Long applicationId, Long contactId, Contact contactDetails) {
        if (!contactRepository.existsByApplicationIdAndId(applicationId, contactId)) {
            throw new ResourceNotFoundException("Contact", "id", contactId);
        }
        
        Contact contact = contactRepository.findById(contactId).orElseThrow();
        contact.setName(contactDetails.getName());
        contact.setEmail(contactDetails.getEmail());
        contact.setPhone(contactDetails.getPhone());
        contact.setPosition(contactDetails.getPosition());
        
        return contactRepository.save(contact);
    }

    @Transactional
    public void deleteContact(Long applicationId, Long contactId) {
        if (!contactRepository.existsByApplicationIdAndId(applicationId, contactId)) {
            throw new ResourceNotFoundException("Contact", "id", contactId);
        }
        contactRepository.deleteById(contactId);
    }
} 