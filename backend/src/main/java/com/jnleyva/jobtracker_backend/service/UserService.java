package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.User;
import java.time.LocalDateTime;
import java.util.List;

public interface UserService {
    User createUser(User user);
    User getUserById(Long id);
    User getUserByUsername(String username);
    User getUserByEmail(String email);
    List<User> getAllUsers();
    User updateUser(Long id, User userDetails);
    void updateUserLoginInfo(Long id, int failedLoginAttempts, LocalDateTime lastLogin);
    void deleteUser(Long id);
} 