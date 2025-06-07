package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.model.UserProfile;
import com.jnleyva.jobtracker_backend.repository.UserProfileRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class UserProfileServiceImpl implements UserProfileService {
    private static final Logger logger = LoggerFactory.getLogger(UserProfileServiceImpl.class);

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserProfile createProfile(UserProfile profile, Long userId) {
        logger.debug("Creating profile for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Check if user already has a profile
        Optional<UserProfile> existingProfile = userProfileRepository.findByUserId(userId);
        if (existingProfile.isPresent()) {
            logger.warn("User {} already has a profile", userId);
            throw new RuntimeException("User already has a profile");
        }
        
        profile.setUser(user);
        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());
        
        UserProfile savedProfile = userProfileRepository.save(profile);
        logger.info("Profile created successfully for user ID: {}", userId);
        
        return savedProfile;
    }

    @Override
    public UserProfile getProfileByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "userId", userId));
    }

    @Override
    public UserProfile updateProfile(Long profileId, UserProfile profileDetails) {
        UserProfile profile = userProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "id", profileId));

        // Update fields if provided
        if (profileDetails.getFirstName() != null) {
            profile.setFirstName(profileDetails.getFirstName());
        }
        if (profileDetails.getLastName() != null) {
            profile.setLastName(profileDetails.getLastName());
        }
        if (profileDetails.getBio() != null) {
            profile.setBio(profileDetails.getBio());
        }
        if (profileDetails.getLocation() != null) {
            profile.setLocation(profileDetails.getLocation());
        }
        if (profileDetails.getSkills() != null) {
            profile.setSkills(profileDetails.getSkills());
        }
        if (profileDetails.getJobTypes() != null) {
            profile.setJobTypes(profileDetails.getJobTypes());
        }
        if (profileDetails.getPreferredLocations() != null) {
            profile.setPreferredLocations(profileDetails.getPreferredLocations());
        }
        if (profileDetails.getSalaryMin() != null) {
            profile.setSalaryMin(profileDetails.getSalaryMin());
        }
        if (profileDetails.getSalaryMax() != null) {
            profile.setSalaryMax(profileDetails.getSalaryMax());
        }
        if (profileDetails.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(profileDetails.getLinkedinUrl());
        }
        if (profileDetails.getGithubUrl() != null) {
            profile.setGithubUrl(profileDetails.getGithubUrl());
        }
        if (profileDetails.getPortfolioUrl() != null) {
            profile.setPortfolioUrl(profileDetails.getPortfolioUrl());
        }
        if (profileDetails.getPhoneNumber() != null) {
            profile.setPhoneNumber(profileDetails.getPhoneNumber());
        }
        if (profileDetails.getProfilePicture() != null) {
            profile.setProfilePicture(profileDetails.getProfilePicture());
        }

        profile.setUpdatedAt(LocalDateTime.now());

        UserProfile updatedProfile = userProfileRepository.save(profile);
        logger.info("Profile updated successfully: {}", profileId);
        return updatedProfile;
    }

    @Override
    public void deleteProfile(Long profileId) {
        UserProfile profile = userProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "id", profileId));
        
        userProfileRepository.delete(profile);
        logger.info("Profile deleted successfully: {}", profileId);
    }

    @Override
    public UserProfile createEmptyProfile(Long userId) {
        logger.debug("Creating empty profile for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Check if user already has a profile
        Optional<UserProfile> existingProfile = userProfileRepository.findByUserId(userId);
        if (existingProfile.isPresent()) {
            return existingProfile.get();
        }
        
        UserProfile profile = new UserProfile(user);
        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());
        
        UserProfile savedProfile = userProfileRepository.save(profile);
        logger.info("Empty profile created successfully for user ID: {}", userId);
        
        return savedProfile;
    }
} 