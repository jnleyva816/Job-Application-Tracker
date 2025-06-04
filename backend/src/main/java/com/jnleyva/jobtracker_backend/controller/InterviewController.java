package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.model.InterviewDTO;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import com.jnleyva.jobtracker_backend.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications/{applicationId}/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    private ResponseEntity<String> checkApplicationOwnership(Long applicationId) {
        // Get the current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Optional<User> currentUser = userRepository.findByUsername(username);
        
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        
        // Check if application exists
        Optional<Application> application = applicationRepository.findById(applicationId);
        if (application.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Application not found");
        }
        
        // Verify the application belongs to the current user or user is admin
        if (!application.get().getUser().getId().equals(currentUser.get().getId()) && 
            !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
        }
        
        return null; // No error, user has access
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllInterviews(@PathVariable Long applicationId) {
        ResponseEntity<String> authCheck = checkApplicationOwnership(applicationId);
        if (authCheck != null) {
            return authCheck;
        }
        
        List<Interview> interviews = interviewService.getAllInterviewsByApplicationId(applicationId);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping(value = "/{interviewId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getInterviewById(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId) {
        ResponseEntity<String> authCheck = checkApplicationOwnership(applicationId);
        if (authCheck != null) {
            return authCheck;
        }
        
        return interviewService.getInterviewById(applicationId, interviewId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createInterview(
            @PathVariable Long applicationId,
            @Valid @RequestBody InterviewDTO interviewDTO) {
        ResponseEntity<String> authCheck = checkApplicationOwnership(applicationId);
        if (authCheck != null) {
            return authCheck;
        }
        
        Interview createdInterview = interviewService.createInterview(applicationId, interviewDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdInterview);
    }

    @PostMapping(value = "/legacy", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createInterviewLegacy(
            @PathVariable Long applicationId,
            @RequestBody Interview interview) {
        ResponseEntity<String> authCheck = checkApplicationOwnership(applicationId);
        if (authCheck != null) {
            return authCheck;
        }
        
        Interview createdInterview = interviewService.createInterview(applicationId, interview);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdInterview);
    }

    @PutMapping(value = "/{interviewId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateInterview(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId,
            @Valid @RequestBody InterviewDTO interviewDTO) {
        ResponseEntity<String> authCheck = checkApplicationOwnership(applicationId);
        if (authCheck != null) {
            return authCheck;
        }
        
        Interview updatedInterview = interviewService.updateInterview(applicationId, interviewId, interviewDTO);
        return ResponseEntity.ok(updatedInterview);
    }

    @PutMapping(value = "/{interviewId}/legacy", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateInterviewLegacy(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId,
            @RequestBody Interview interview) {
        ResponseEntity<String> authCheck = checkApplicationOwnership(applicationId);
        if (authCheck != null) {
            return authCheck;
        }
        
        Interview updatedInterview = interviewService.updateInterview(applicationId, interviewId, interview);
        return ResponseEntity.ok(updatedInterview);
    }

    @PutMapping(value = "/{interviewId}/cancel", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> cancelInterview(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId,
            @RequestBody(required = false) String reason) {
        ResponseEntity<String> authCheck = checkApplicationOwnership(applicationId);
        if (authCheck != null) {
            return authCheck;
        }
        
        Interview cancelledInterview = interviewService.cancelInterview(applicationId, interviewId, reason);
        return ResponseEntity.ok(cancelledInterview);
    }

    @PutMapping(value = "/{interviewId}/reschedule", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> rescheduleInterview(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId,
            @RequestBody RescheduleRequest request) {
        ResponseEntity<String> authCheck = checkApplicationOwnership(applicationId);
        if (authCheck != null) {
            return authCheck;
        }
        
        Interview rescheduledInterview = interviewService.rescheduleInterview(
                applicationId, interviewId, request.getNewDate(), request.getReason());
        return ResponseEntity.ok(rescheduledInterview);
    }

    @PutMapping(value = "/{interviewId}/complete", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> completeInterview(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId,
            @RequestBody(required = false) String feedback) {
        ResponseEntity<String> authCheck = checkApplicationOwnership(applicationId);
        if (authCheck != null) {
            return authCheck;
        }
        
        Interview completedInterview = interviewService.completeInterview(applicationId, interviewId, feedback);
        return ResponseEntity.ok(completedInterview);
    }

    @DeleteMapping("/{interviewId}")
    public ResponseEntity<?> deleteInterview(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId) {
        ResponseEntity<String> authCheck = checkApplicationOwnership(applicationId);
        if (authCheck != null) {
            return authCheck;
        }
        
        interviewService.deleteInterview(applicationId, interviewId);
        return ResponseEntity.noContent().build();
    }

    // Inner class for reschedule request
    public static class RescheduleRequest {
        private LocalDateTime newDate;
        private String reason;
        
        public LocalDateTime getNewDate() {
            return newDate;
        }
        
        public void setNewDate(LocalDateTime newDate) {
            this.newDate = newDate;
        }
        
        public String getReason() {
            return reason;
        }
        
        public void setReason(String reason) {
            this.reason = reason;
        }
    }
} 