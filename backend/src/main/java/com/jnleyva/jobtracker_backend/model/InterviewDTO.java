package com.jnleyva.jobtracker_backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InterviewDTO {
    
    @NotBlank(message = "Interview type is required")
    private String type;

    @NotNull(message = "Interview date is required")
    private LocalDateTime interviewDate;

    private String notes;
    
    private String status = "SCHEDULED";
    
    private String interviewerName;
    
    private String interviewerEmail;
    
    private String location;
    
    private Integer durationMinutes;

    public InterviewDTO() {
    }

    public InterviewDTO(String type, LocalDateTime interviewDate, String notes) {
        this.type = type;
        this.interviewDate = interviewDate;
        this.notes = notes;
    }

    // Convert DTO to Entity
    public Interview toEntity() {
        Interview interview = new Interview();
        interview.setType(this.type);
        interview.setInterviewDate(this.interviewDate);
        interview.setNotes(this.notes);
        interview.setStatus(this.status);
        interview.setInterviewerName(this.interviewerName);
        interview.setInterviewerEmail(this.interviewerEmail);
        interview.setLocation(this.location);
        interview.setDurationMinutes(this.durationMinutes);
        return interview;
    }

    // Convert Entity to DTO
    public static InterviewDTO fromEntity(Interview interview) {
        InterviewDTO dto = new InterviewDTO();
        dto.setType(interview.getType());
        dto.setInterviewDate(interview.getInterviewDate());
        dto.setNotes(interview.getNotes());
        dto.setStatus(interview.getStatus());
        dto.setInterviewerName(interview.getInterviewerName());
        dto.setInterviewerEmail(interview.getInterviewerEmail());
        dto.setLocation(interview.getLocation());
        dto.setDurationMinutes(interview.getDurationMinutes());
        return dto;
    }
} 