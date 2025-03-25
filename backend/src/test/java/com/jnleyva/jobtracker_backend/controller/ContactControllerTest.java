package com.jnleyva.jobtracker_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jnleyva.jobtracker_backend.config.TestSecurityConfig;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.Contact;
import com.jnleyva.jobtracker_backend.service.ContactService;
import com.jnleyva.jobtracker_backend.service.JwtService;
import com.jnleyva.jobtracker_backend.service.MyUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = ContactController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@Import(TestSecurityConfig.class)
public class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ContactService contactService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private MyUserDetailsService userDetailsService;

    private Application application;
    private Contact contact;
    private List<Contact> contacts;

    @BeforeEach
    void setUp() {
        application = new Application();
        application.setId(1L);
        application.setCompany("Test Company");

        contact = new Contact();
        contact.setId(1L);
        contact.setName("John Doe");
        contact.setEmail("john@example.com");
        contact.setPhone("123-456-7890");
        contact.setPosition("HR Manager");
        contact.setApplication(application);

        contacts = Arrays.asList(contact);
    }

    @Test
    @WithMockUser
    void getAllContacts_ReturnsContacts() throws Exception {
        when(contactService.getAllContacts(1L)).thenReturn(contacts);

        mockMvc.perform(get("/api/applications/1/contacts"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("John Doe"))
                .andExpect(jsonPath("$[0].email").value("john@example.com"))
                .andExpect(jsonPath("$[0].phone").value("123-456-7890"))
                .andExpect(jsonPath("$[0].position").value("HR Manager"));
    }

    @Test
    @WithMockUser
    void getContact_ReturnsContact() throws Exception {
        when(contactService.getContact(1L, 1L)).thenReturn(contact);

        mockMvc.perform(get("/api/applications/1/contacts/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.phone").value("123-456-7890"))
                .andExpect(jsonPath("$.position").value("HR Manager"));
    }

    @Test
    @WithMockUser
    void createContact_ReturnsCreatedContact() throws Exception {
        when(contactService.createContact(eq(1L), any(Contact.class))).thenReturn(contact);

        mockMvc.perform(post("/api/applications/1/contacts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(contact)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.phone").value("123-456-7890"))
                .andExpect(jsonPath("$.position").value("HR Manager"));
    }

    @Test
    @WithMockUser
    void updateContact_ReturnsUpdatedContact() throws Exception {
        when(contactService.updateContact(eq(1L), eq(1L), any(Contact.class))).thenReturn(contact);

        mockMvc.perform(put("/api/applications/1/contacts/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(contact)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.phone").value("123-456-7890"))
                .andExpect(jsonPath("$.position").value("HR Manager"));
    }

    @Test
    @WithMockUser
    void deleteContact_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/applications/1/contacts/1"))
                .andExpect(status().isNoContent());
    }
} 