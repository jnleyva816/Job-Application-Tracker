package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Application createApplication(Application application, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Set timestamps
        LocalDateTime now = LocalDateTime.now();
        application.setCreatedAt(now);
        application.setUpdatedAt(now);

        // Set the user and establish the bidirectional relationship
        application.setUser(user);
        user.addApplication(application);

        return applicationRepository.save(application);
    }

    @Override
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));
    }

    @Override
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    @Override
    public List<Application> getApplicationsByUserId(Long userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return applicationRepository.findByUserId(userId);
    }

    @Override
    public Application updateApplication(Long id, Application applicationDetails) {
        Application application = getApplicationById(id);

        // Update fields
        application.setCompany(applicationDetails.getCompany());
        application.setJobTitle(applicationDetails.getJobTitle());
        application.setLocation(applicationDetails.getLocation());
        application.setUrl(applicationDetails.getUrl());
        application.setDescription(applicationDetails.getDescription());
        application.setCompensation(applicationDetails.getCompensation());
        application.setCompensationType(applicationDetails.getCompensationType());
        application.setExperienceLevel(applicationDetails.getExperienceLevel());
        application.setStatus(applicationDetails.getStatus());
        application.setApplicationDate(applicationDetails.getApplicationDate());
        
        // Update timestamp
        application.setUpdatedAt(LocalDateTime.now());

        // Don't change the user association
        return applicationRepository.save(application);
    }

    @Override
    public void deleteApplication(Long id) {
        Application application = getApplicationById(id);
        applicationRepository.delete(application);
    }

    @Override
    @Transactional
    public void deleteApplicationsByUserId(Long userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        applicationRepository.deleteByUserId(userId);
        applicationRepository.flush(); // Ensures the delete is immediately persisted
    }
} 