package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        List<Application> applications = applicationRepository.findAll();
        return new ResponseEntity<>(applications, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Application>> getApplicationById(@PathVariable Long id) {
        Optional<Application> application = applicationRepository.findById(id);
        if (application.isPresent()) {
            return new ResponseEntity<>(application, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<Application> createApplication(@RequestBody Application application) {
        Application savedApplication = applicationRepository.save(application);
        return new ResponseEntity<>(savedApplication, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(@PathVariable Long id, @RequestBody Application application) {
        Optional<Application> existingApplication = applicationRepository.findById(id);
        if (existingApplication.isPresent()) {
            Application updatedApplication = existingApplication.get();
            updatedApplication.setCompany(application.getCompany());
            updatedApplication.setJobTitle(application.getJobTitle());
            updatedApplication.setLocation(application.getLocation());
            updatedApplication.setUrl(application.getUrl());
            updatedApplication.setDescription(application.getDescription());
            updatedApplication.setCompensation(application.getCompensation());
            updatedApplication.setStatus(application.getStatus());
            updatedApplication.setApplicationDate(application.getApplicationDate());
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
            applicationRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}