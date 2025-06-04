package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.InterviewType;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interview-options")
public class InterviewTypeController {

    @GetMapping(value = "/types", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, String>>> getInterviewTypes() {
        List<Map<String, String>> types = Arrays.stream(InterviewType.values())
                .map(type -> Map.of(
                        "value", type.name(),
                        "label", type.getDisplayName()
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(types);
    }

    @GetMapping(value = "/statuses", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String, String>>> getInterviewStatuses() {
        List<Map<String, String>> statuses = List.of(
                Map.of("value", "SCHEDULED", "label", "Scheduled"),
                Map.of("value", "COMPLETED", "label", "Completed"),
                Map.of("value", "CANCELLED", "label", "Cancelled"),
                Map.of("value", "RESCHEDULED", "label", "Rescheduled"),
                Map.of("value", "NO_SHOW", "label", "No Show")
        );
        
        return ResponseEntity.ok(statuses);
    }
} 