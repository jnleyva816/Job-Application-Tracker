package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        // Get the current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userRepository.findByUsername(username);
        
        if (currentUser.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        List<Application> applications;
        // If admin, show all applications, otherwise filter by user
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            applications = applicationRepository.findAll();
        } else {
            applications = applicationRepository.findByUserId(currentUser.get().getId());
        }
        
        return new ResponseEntity<>(applications, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Application>> getApplicationById(@PathVariable Long id) {
        Optional<Application> application = applicationRepository.findById(id);
        if (application.isPresent()) {
            // Get the current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            Optional<User> currentUser = userRepository.findByUsername(username);
            
            if (currentUser.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            // Verify the application belongs to the current user or user is admin
            if (!application.get().getUser().getId().equals(currentUser.get().getId()) && 
                !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            
            return new ResponseEntity<>(application, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<?> createApplication(@RequestBody Application application) {
        // Get the current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userRepository.findByUsername(username);
        
        if (currentUser.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        
        // Set the user for this application
        application.setUser(currentUser.get());
        
        Application savedApplication = applicationRepository.save(application);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedApplication);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(@PathVariable Long id, @RequestBody Application application) {
        Optional<Application> existingApplication = applicationRepository.findById(id);
        if (existingApplication.isPresent()) {
            // Get the current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            Optional<User> currentUser = userRepository.findByUsername(username);
            
            if (currentUser.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            Application updatedApplication = existingApplication.get();
            
            // Verify the application belongs to the current user or user is admin
            if (!updatedApplication.getUser().getId().equals(currentUser.get().getId()) && 
                !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            
            updatedApplication.setCompany(application.getCompany());
            updatedApplication.setJobTitle(application.getJobTitle());
            updatedApplication.setLocation(application.getLocation());
            updatedApplication.setUrl(application.getUrl());
            updatedApplication.setDescription(application.getDescription());
            updatedApplication.setCompensation(application.getCompensation());
            updatedApplication.setStatus(application.getStatus());
            updatedApplication.setApplicationDate(application.getApplicationDate());
            // Keep the original user
            // updatedApplication.setUser(application.getUser());
            Application savedApplication = applicationRepository.save(updatedApplication);
            return new ResponseEntity<>(savedApplication, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        Optional<Application> application = applicationRepository.findById(id);
        if (application.isPresent()) {
            // Get the current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            Optional<User> currentUser = userRepository.findByUsername(username);
            
            if (currentUser.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            
            // Verify the application belongs to the current user or user is admin
            if (!application.get().getUser().getId().equals(currentUser.get().getId()) && 
                !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            
            applicationRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}