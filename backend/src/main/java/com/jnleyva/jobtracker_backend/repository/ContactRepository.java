package com.jnleyva.jobtracker_backend.repository;

import com.jnleyva.jobtracker_backend.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByApplicationId(Long applicationId);
    boolean existsByApplicationIdAndId(Long applicationId, Long contactId);
} 