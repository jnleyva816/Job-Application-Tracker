package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.Application;
import java.util.List;

public interface ApplicationService {
    // Create operation
    Application createApplication(Application application, Long userId);

    // Read operations
    Application getApplicationById(Long id);
    List<Application> getAllApplications();
    List<Application> getApplicationsByUserId(Long userId);

    // Update operation
    Application updateApplication(Long id, Application applicationDetails);

    // Delete operations
    void deleteApplication(Long id);
    void deleteApplicationsByUserId(Long userId);
} 