package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.UserProfile;

public interface UserProfileService {
    UserProfile createProfile(UserProfile profile, Long userId);
    UserProfile getProfileByUserId(Long userId);
    UserProfile updateProfile(Long profileId, UserProfile profileDetails);
    void deleteProfile(Long profileId);
    UserProfile createEmptyProfile(Long userId);
} 