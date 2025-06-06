package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.ApplicationStatusHistory;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.ApplicationStatusHistoryRepository;
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

    @Autowired
    private ApplicationStatusHistoryRepository statusHistoryRepository;

    @Override
    @Transactional
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

        // Save the application first to get the ID
        Application savedApplication = applicationRepository.save(application);

        // Create initial status history entry
        ApplicationStatusHistory initialStatus = new ApplicationStatusHistory(
            savedApplication, 
            savedApplication.getStatus(), 
            user.getUsername()
        );
        statusHistoryRepository.save(initialStatus);

        return savedApplication;
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
    @Transactional
    public Application updateApplication(Long id, Application applicationDetails) {
        Application application = getApplicationById(id);
        
        // Check if status is changing
        String oldStatus = application.getStatus();
        String newStatus = applicationDetails.getStatus();
        boolean statusChanged = !oldStatus.equals(newStatus);

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

        // Save the application
        Application savedApplication = applicationRepository.save(application);

        // If status changed, create a new status history entry
        if (statusChanged) {
            ApplicationStatusHistory statusChange = new ApplicationStatusHistory(
                savedApplication, 
                newStatus, 
                savedApplication.getUser().getUsername()
            );
            statusHistoryRepository.save(statusChange);
        }

        return savedApplication;
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