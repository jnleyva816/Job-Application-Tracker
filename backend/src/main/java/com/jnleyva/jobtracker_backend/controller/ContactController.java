package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.Contact;
import com.jnleyva.jobtracker_backend.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications/{applicationId}/contacts")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @GetMapping
    public ResponseEntity<List<Contact>> getAllContacts(@PathVariable Long applicationId) {
        List<Contact> contacts = contactService.getAllContacts(applicationId);
        return ResponseEntity.ok(contacts);
    }

    @GetMapping("/{contactId}")
    public ResponseEntity<Contact> getContact(@PathVariable Long applicationId, @PathVariable Long contactId) {
        Contact contact = contactService.getContact(applicationId, contactId);
        return ResponseEntity.ok(contact);
    }

    @PostMapping
    public ResponseEntity<Contact> createContact(@PathVariable Long applicationId, @RequestBody Contact contact) {
        Contact createdContact = contactService.createContact(applicationId, contact);
        return new ResponseEntity<>(createdContact, HttpStatus.CREATED);
    }

    @PutMapping("/{contactId}")
    public ResponseEntity<Contact> updateContact(
            @PathVariable Long applicationId,
            @PathVariable Long contactId,
            @RequestBody Contact contactDetails) {
        Contact updatedContact = contactService.updateContact(applicationId, contactId, contactDetails);
        return ResponseEntity.ok(updatedContact);
    }

    @DeleteMapping("/{contactId}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long applicationId, @PathVariable Long contactId) {
        contactService.deleteContact(applicationId, contactId);
        return ResponseEntity.noContent().build();
    }
} 