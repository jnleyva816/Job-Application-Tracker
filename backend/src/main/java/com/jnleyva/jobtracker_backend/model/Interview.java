package com.jnleyva.jobtracker_backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "interviews")
@EqualsAndHashCode(exclude = "application")
@ToString(exclude = "application")
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Interview type is required")
    private String type;

    @Column(name = "interview_date", nullable = false)
    @NotNull(message = "Interview date is required")
    private LocalDateTime interviewDate;

    @Column(name = "original_date")
    private LocalDateTime originalDate; // For tracking rescheduled interviews

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "status")
    private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED, NO_SHOW

    @Column(name = "interviewer_name")
    private String interviewerName;

    @Column(name = "interviewer_email")
    private String interviewerEmail;

    @Column(name = "location")
    private String location;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "cancellation_reason")
    private String cancellationReason; // Reason for cancellation

    @Column(name = "meeting_link")
    private String meetingLink; // For virtual interviews

    @Column(name = "interview_feedback")
    private String interviewFeedback; // Post-interview feedback

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonBackReference
    private Application application;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Interview() {
    }

    public Interview(String type, LocalDateTime interviewDate, String notes) {
        this.type = type;
        this.interviewDate = interviewDate;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to cancel interview
    public void cancel(String reason) {
        this.status = "CANCELLED";
        this.cancellationReason = reason;
    }

    // Helper method to reschedule interview
    public void reschedule(LocalDateTime newDate, String reason) {
        if (this.originalDate == null) {
            this.originalDate = this.interviewDate;
        }
        this.interviewDate = newDate;
        this.status = "RESCHEDULED";
        this.notes = (this.notes == null ? "" : this.notes + "\n") + "Rescheduled: " + reason;
    }

    // Helper method to mark as completed
    public void complete(String feedback) {
        this.status = "COMPLETED";
        this.interviewFeedback = feedback;
    }
} 