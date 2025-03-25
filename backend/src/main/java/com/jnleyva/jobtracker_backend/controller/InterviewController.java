package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications/{applicationId}/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @GetMapping
    public ResponseEntity<List<Interview>> getAllInterviews(@PathVariable Long applicationId) {
        List<Interview> interviews = interviewService.getAllInterviewsByApplicationId(applicationId);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{interviewId}")
    public ResponseEntity<Interview> getInterviewById(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId) {
        return interviewService.getInterviewById(applicationId, interviewId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Interview> createInterview(
            @PathVariable Long applicationId,
            @RequestBody Interview interview) {
        Interview createdInterview = interviewService.createInterview(applicationId, interview);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdInterview);
    }

    @PutMapping("/{interviewId}")
    public ResponseEntity<Interview> updateInterview(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId,
            @RequestBody Interview interview) {
        Interview updatedInterview = interviewService.updateInterview(applicationId, interviewId, interview);
        return ResponseEntity.ok(updatedInterview);
    }

    @DeleteMapping("/{interviewId}")
    public ResponseEntity<Void> deleteInterview(
            @PathVariable Long applicationId,
            @PathVariable Long interviewId) {
        interviewService.deleteInterview(applicationId, interviewId);
        return ResponseEntity.noContent().build();
    }
} 