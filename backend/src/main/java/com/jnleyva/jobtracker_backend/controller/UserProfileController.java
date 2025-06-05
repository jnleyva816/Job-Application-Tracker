package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.model.UserProfile;
import com.jnleyva.jobtracker_backend.service.UserService;
import com.jnleyva.jobtracker_backend.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // Hide sensitive data
        user.setPassword(null);
        
        // Get or create profile
        UserProfile profile;
        try {
            profile = userProfileService.getProfileByUserId(user.getId());
        } catch (Exception e) {
            // If profile doesn't exist, create an empty one
            profile = userProfileService.createEmptyProfile(user.getId());
        }
        
        UserProfileResponse response = new UserProfileResponse(user, profile);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateCurrentUserProfile(@RequestBody UserProfileUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.getUserByUsername(username);
        
        // Update basic user info if provided
        if (request.getUsername() != null || request.getEmail() != null) {
            User userUpdate = new User();
            if (request.getUsername() != null) {
                userUpdate.setUsername(request.getUsername());
            }
            if (request.getEmail() != null) {
                userUpdate.setEmail(request.getEmail());
            }
            currentUser = userService.updateUser(currentUser.getId(), userUpdate);
        }
        
        // Update profile info
        UserProfile profile;
        try {
            profile = userProfileService.getProfileByUserId(currentUser.getId());
            profile = userProfileService.updateProfile(profile.getId(), request.toUserProfile());
        } catch (Exception e) {
            // If profile doesn't exist, create one with the provided data
            profile = userProfileService.createProfile(request.toUserProfile(), currentUser.getId());
        }
        
        // Hide sensitive data
        currentUser.setPassword(null);
        
        UserProfileResponse response = new UserProfileResponse(currentUser, profile);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete")
    public ResponseEntity<UserProfileResponse> completeProfile(@RequestBody UserProfileUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.getUserByUsername(username);
        
        // Get or create profile
        UserProfile profile;
        try {
            profile = userProfileService.getProfileByUserId(currentUser.getId());
            profile = userProfileService.updateProfile(profile.getId(), request.toUserProfile());
        } catch (Exception e) {
            profile = userProfileService.createProfile(request.toUserProfile(), currentUser.getId());
        }
        
        // Hide sensitive data
        currentUser.setPassword(null);
        
        UserProfileResponse response = new UserProfileResponse(currentUser, profile);
        return ResponseEntity.ok(response);
    }

    // Request/Response DTOs
    public static class UserProfileUpdateRequest {
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String bio;
        private String location;
        private String skills;
        private String jobTypes;
        private String preferredLocations;
        private Integer salaryMin;
        private Integer salaryMax;
        private String linkedinUrl;
        private String githubUrl;
        private String portfolioUrl;
        private String phoneNumber;

        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        
        public String getSkills() { return skills; }
        public void setSkills(String skills) { this.skills = skills; }
        
        public String getJobTypes() { return jobTypes; }
        public void setJobTypes(String jobTypes) { this.jobTypes = jobTypes; }
        
        public String getPreferredLocations() { return preferredLocations; }
        public void setPreferredLocations(String preferredLocations) { this.preferredLocations = preferredLocations; }
        
        public Integer getSalaryMin() { return salaryMin; }
        public void setSalaryMin(Integer salaryMin) { this.salaryMin = salaryMin; }
        
        public Integer getSalaryMax() { return salaryMax; }
        public void setSalaryMax(Integer salaryMax) { this.salaryMax = salaryMax; }
        
        public String getLinkedinUrl() { return linkedinUrl; }
        public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
        
        public String getGithubUrl() { return githubUrl; }
        public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
        
        public String getPortfolioUrl() { return portfolioUrl; }
        public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
        
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public UserProfile toUserProfile() {
            UserProfile profile = new UserProfile();
            profile.setFirstName(this.firstName);
            profile.setLastName(this.lastName);
            profile.setBio(this.bio);
            profile.setLocation(this.location);
            profile.setSkills(this.skills);
            profile.setJobTypes(this.jobTypes);
            profile.setPreferredLocations(this.preferredLocations);
            profile.setSalaryMin(this.salaryMin);
            profile.setSalaryMax(this.salaryMax);
            profile.setLinkedinUrl(this.linkedinUrl);
            profile.setGithubUrl(this.githubUrl);
            profile.setPortfolioUrl(this.portfolioUrl);
            profile.setPhoneNumber(this.phoneNumber);
            return profile;
        }
    }

    public static class UserProfileResponse {
        private Long id;
        private String username;
        private String email;
        private String role;
        private UserProfile profile;

        public UserProfileResponse(User user, UserProfile profile) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.role = user.getRole();
            this.profile = profile;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        
        public UserProfile getProfile() { return profile; }
        public void setProfile(UserProfile profile) { this.profile = profile; }
    }
} 