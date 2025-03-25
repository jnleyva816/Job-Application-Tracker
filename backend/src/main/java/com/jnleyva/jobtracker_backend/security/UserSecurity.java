package com.jnleyva.jobtracker_backend.security;

import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class UserSecurity {

    @Autowired
    private UserRepository userRepository;

    public boolean hasUserId(Authentication authentication, Long userId) {
        String username = authentication.getName();
        Optional<User> user = userRepository.findByUsername(username);
        return user.isPresent() && user.get().getId().equals(userId);
    }

    public boolean hasUsername(Authentication authentication, String username) {
        return authentication.getName().equals(username);
    }

    public boolean hasEmail(Authentication authentication, String email) {
        String username = authentication.getName();
        Optional<User> user = userRepository.findByUsername(username);
        return user.isPresent() && user.get().getEmail().equals(email);
    }
} 