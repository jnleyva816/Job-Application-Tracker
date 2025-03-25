package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.User;
import java.util.List;

public interface UserService {
    User createUser(User user);
    User getUserById(Long id);
    User getUserByUsername(String username);
    User getUserByEmail(String email);
    List<User> getAllUsers();
    User updateUser(Long id, User userDetails);
    void deleteUser(Long id);
} 