package com.jnleyva.jobtracker_backend.model;

public enum InterviewType {
    PHONE_SCREENING("Phone Screening"),
    HR_INTERVIEW("HR Interview"),
    TECHNICAL_INTERVIEW("Technical Interview"),
    CODING_CHALLENGE("Coding Challenge"),
    SYSTEM_DESIGN("System Design"),
    BEHAVIORAL_INTERVIEW("Behavioral Interview"),
    PANEL_INTERVIEW("Panel Interview"),
    FINAL_INTERVIEW("Final Interview"),
    ON_SITE("On-site Interview"),
    VIDEO_CALL("Video Call"),
    PRESENTATION("Presentation"),
    CULTURAL_FIT("Cultural Fit"),
    MANAGER_INTERVIEW("Manager Interview"),
    PEER_INTERVIEW("Peer Interview"),
    EXECUTIVE_INTERVIEW("Executive Interview"),
    OTHER("Other");

    private final String displayName;

    InterviewType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
} 