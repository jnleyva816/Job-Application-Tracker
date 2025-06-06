package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.exception.ResourceAlreadyExistsException;
import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private ApplicationService applicationService;

    @Override
    public User createUser(User user) {
        logger.debug("Creating new user with username: {}", user.getUsername());
        
        // Check if username already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            logger.warn("Username already exists: {}", user.getUsername());
            throw new ResourceAlreadyExistsException("User", "username", user.getUsername());
        }

        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.warn("Email already exists: {}", user.getEmail());
            throw new ResourceAlreadyExistsException("User", "email", user.getEmail());
        }

        // Validate password
        validatePassword(user.getPassword());
        logger.debug("Password validation passed for user: {}", user.getUsername());

        // Create a new user instance to avoid modifying the input
        User newUser = new User();
        newUser.setUsername(user.getUsername());
        newUser.setEmail(user.getEmail());
        
        // Encode password
        String rawPassword = user.getPassword();
        logger.debug("Raw password length for user {}: {}", user.getUsername(), rawPassword.length());
        
        String encodedPassword = passwordEncoder.encode(rawPassword);
        logger.debug("Password encoded for user: {}, encoded length: {}, encoded prefix: {}", 
            user.getUsername(), encodedPassword.length(),
            encodedPassword.substring(0, Math.min(20, encodedPassword.length())));
        
        // Test password match before saving
        boolean preMatchTest = passwordEncoder.matches(rawPassword, encodedPassword);
        logger.debug("Pre-save password match test for user {}: {}", user.getUsername(), preMatchTest);
        
        newUser.setPassword(encodedPassword);
        
        // Set default role if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            newUser.setRole("ROLE_USER");
        } else {
            newUser.setRole(user.getRole());
        }

        // Set timestamps
        LocalDateTime now = LocalDateTime.now();
        newUser.setCreatedAt(now);
        newUser.setUpdatedAt(now);

        User savedUser = userRepository.save(newUser);
        logger.info("User created successfully: {}", savedUser.getUsername());
        
        // Verify the saved password can be matched
        boolean postMatchTest = passwordEncoder.matches(rawPassword, savedUser.getPassword());
        logger.debug("Post-save password match test for user {}: {}", savedUser.getUsername(), postMatchTest);
        
        if (!postMatchTest) {
            logger.error("Password verification failed for user: {}", savedUser.getUsername());
            logger.error("Stored password prefix: {}", savedUser.getPassword().substring(0, Math.min(20, savedUser.getPassword().length())));
            throw new RuntimeException("Password verification failed after user creation");
        }
        
        // Create an empty profile for the new user
        try {
            userProfileService.createEmptyProfile(savedUser.getId());
            logger.info("Empty profile created for user: {}", savedUser.getUsername());
        } catch (Exception e) {
            logger.warn("Failed to create profile for user {}: {}", savedUser.getUsername(), e.getMessage());
            // Don't fail user creation if profile creation fails
        }
        
        return savedUser;
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        boolean isPasswordChanged = false;

        // Check if username is provided and being changed
        if (userDetails.getUsername() != null && !userDetails.getUsername().isEmpty()) {
            // Check if username is being changed and if it already exists
            if (!user.getUsername().equals(userDetails.getUsername()) &&
                    userRepository.findByUsername(userDetails.getUsername()).isPresent()) {
                throw new ResourceAlreadyExistsException("User", "username", userDetails.getUsername());
            }
            user.setUsername(userDetails.getUsername());
        }

        // Check if email is provided and being changed
        if (userDetails.getEmail() != null && !userDetails.getEmail().isEmpty()) {
            // Check if email is being changed and if it already exists
            if (!user.getEmail().equals(userDetails.getEmail()) &&
                    userRepository.findByEmail(userDetails.getEmail()).isPresent()) {
                throw new ResourceAlreadyExistsException("User", "email", userDetails.getEmail());
            }
            user.setEmail(userDetails.getEmail());
        }
        
        // Update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            validatePassword(userDetails.getPassword());
            String encodedPassword = passwordEncoder.encode(userDetails.getPassword());
            user.setPassword(encodedPassword);
            isPasswordChanged = true;
            logger.debug("Password updated for user: {}", user.getUsername());
        }
        
        // Update role if provided and not empty
        if (userDetails.getRole() != null && !userDetails.getRole().isEmpty()) {
            user.setRole(userDetails.getRole());
        }

        // Update timestamp
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        logger.info("User updated successfully: {} (password changed: {})", updatedUser.getUsername(), isPasswordChanged);
        return updatedUser;
    }

    @Override
    public void updateUserLoginInfo(Long id, int failedLoginAttempts, LocalDateTime lastLogin) {
        // Use native query to update only specific fields
        Query query = entityManager.createNativeQuery(
            "UPDATE users SET failed_login_attempts = :failedAttempts, " +
            "last_login = :lastLogin, updated_at = :updatedAt " +
            "WHERE user_id = :id");
        
        query.setParameter("failedAttempts", failedLoginAttempts);
        query.setParameter("lastLogin", lastLogin);
        query.setParameter("updatedAt", LocalDateTime.now());
        query.setParameter("id", id);
        
        int updatedRows = query.executeUpdate();
        if (updatedRows == 0) {
            throw new RuntimeException("Failed to update user login info");
        }
        
        logger.info("User login info updated successfully: {} (failed attempts: {}, last login: {})", 
            id, failedLoginAttempts, lastLogin);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        
        // Use bulk delete operations in the correct order to avoid ALL foreign key constraint violations
        
        // 1. Delete ApplicationStatusHistory records first (no dependencies)
        int statusHistoryDeleted = entityManager.createQuery(
            "DELETE FROM ApplicationStatusHistory ash WHERE ash.application.user.id = :userId")
            .setParameter("userId", id)
            .executeUpdate();
        
        // 2. Delete Interview records (no dependencies on ApplicationStatusHistory)
        int interviewsDeleted = entityManager.createQuery(
            "DELETE FROM Interview i WHERE i.application.user.id = :userId")
            .setParameter("userId", id)
            .executeUpdate();
        
        // 3. Delete Application records (depends on ApplicationStatusHistory and Interview being deleted)
        int applicationsDeleted = entityManager.createQuery(
            "DELETE FROM Application a WHERE a.user.id = :userId")
            .setParameter("userId", id)
            .executeUpdate();
        
        // 4. Delete UserProfile (depends only on User)
        int profileDeleted = entityManager.createQuery(
            "DELETE FROM UserProfile up WHERE up.user.id = :userId")
            .setParameter("userId", id)
            .executeUpdate();
        
        // 5. Finally delete the User
        entityManager.createQuery(
            "DELETE FROM User u WHERE u.id = :userId")
            .setParameter("userId", id)
            .executeUpdate();
        
        // Clear the session cache to ensure subsequent queries don't find the deleted entities
        entityManager.clear();
        
        logger.info("User deleted successfully: {} (deleted {} applications, {} interviews, {} status histories, {} profile)", 
                    user.getUsername(), applicationsDeleted, interviewsDeleted, statusHistoryDeleted, profileDeleted);
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("Password must contain at least one digit");
        }
        if (!password.matches(".*[!@#$%^&*()].*")) {
            throw new IllegalArgumentException("Password must contain at least one special character");
        }
    }
} 