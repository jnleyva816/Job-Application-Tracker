package com.jnleyva.jobtracker_backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long id;

    @Column(name = "company", nullable = false, length = 500)
    private String company;

    @Column(name = "job_title", nullable = false, length = 500)
    private String jobTitle;

    @Column(name = "location", length = 1000)
    private String location;

    @Column(name = "url", length = 2000)
    private String url;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "compensation")
    private Double compensation;

    @Column(name = "compensation_type", length = 100)
    private String compensationType; // "ANNUAL", "HOURLY", "UNKNOWN"

    @Column(name = "experience_level", length = 100)
    private String experienceLevel;

    @Column(name = "status", nullable = false, length = 100)
    private String status;

    @Column(name = "offer_status", length = 50)
    private String offerStatus; // "ACCEPTED", "DECLINED", "PENDING", null for no offer

    @Column(name = "application_date", nullable = false)
    private LocalDate applicationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Interview> interviews = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ApplicationStatusHistory> statusHistory = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructors, getters, and setters...

    public Application() {
    }

    public Application(String company, String jobTitle, String location, String url, String description, Double compensation, String status, LocalDate applicationDate) {
        this.company = company;
        this.jobTitle = jobTitle;
        this.location = location;
        this.url = url;
        this.description = description;
        this.compensation = compensation;
        this.status = status;
        this.applicationDate = applicationDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getCompensation() {
        return compensation;
    }

    public void setCompensation(Double compensation) {
        this.compensation = compensation;
    }

    public String getCompensationType() {
        return compensationType;
    }

    public void setCompensationType(String compensationType) {
        this.compensationType = compensationType;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOfferStatus() {
        return offerStatus;
    }

    public void setOfferStatus(String offerStatus) {
        this.offerStatus = offerStatus;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Interview> getInterviews() {
        return interviews;
    }

    public void setInterviews(List<Interview> interviews) {
        this.interviews = interviews;
    }

    public void addInterview(Interview interview) {
        interviews.add(interview);
        interview.setApplication(this);
    }

    public void removeInterview(Interview interview) {
        interviews.remove(interview);
        interview.setApplication(null);
    }

    public List<ApplicationStatusHistory> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<ApplicationStatusHistory> statusHistory) {
        this.statusHistory = statusHistory;
    }

    public void addStatusHistory(ApplicationStatusHistory statusHistory) {
        this.statusHistory.add(statusHistory);
        statusHistory.setApplication(this);
    }

    public void removeStatusHistory(ApplicationStatusHistory statusHistory) {
        this.statusHistory.remove(statusHistory);
        statusHistory.setApplication(null);
    }

    /**
     * Gets the highest status reached based on the progression:
     * Applied -> Interviewing -> Offered (or Rejected can happen at any point)
     */
    public String getHighestStatusReached() {
        if (statusHistory.isEmpty()) {
            return status; // Return current status if no history
        }
        
        // Status hierarchy (higher number = higher in progression)
        java.util.Map<String, Integer> statusHierarchy = java.util.Map.of(
            "Applied", 1,
            "Interviewing", 2,
            "Offered", 3,
            "Rejected", 0 // Rejected can happen at any point, so we track it separately
        );
        
        int highestLevel = statusHierarchy.getOrDefault(status, 0);
        boolean hasBeenRejected = "Rejected".equals(status);
        
        for (ApplicationStatusHistory history : statusHistory) {
            int historyLevel = statusHierarchy.getOrDefault(history.getStatus(), 0);
            if (historyLevel > highestLevel) {
                highestLevel = historyLevel;
            }
            if ("Rejected".equals(history.getStatus())) {
                hasBeenRejected = true;
            }
        }
        
        // Return the status corresponding to the highest level reached
        for (java.util.Map.Entry<String, Integer> entry : statusHierarchy.entrySet()) {
            if (entry.getValue() == highestLevel && !entry.getKey().equals("Rejected")) {
                return entry.getKey();
            }
        }
        
        // If rejected is the current status and nothing higher was reached
        return hasBeenRejected ? "Rejected" : status;
    }

    /**
     * Checks if this application has ever reached a specific status
     */
    public boolean hasReachedStatus(String targetStatus) {
        if (targetStatus.equals(status)) {
            return true;
        }
        
        return statusHistory.stream()
                .anyMatch(history -> targetStatus.equals(history.getStatus()));
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
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
}
