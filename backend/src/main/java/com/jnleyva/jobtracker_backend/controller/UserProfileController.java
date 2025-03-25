package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.service.UserService;
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

    @GetMapping
    public ResponseEntity<User> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        // We might want to hide sensitive data like password here
        user.setPassword(null);
        
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<User> updateCurrentUserProfile(@RequestBody User userDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.getUserByUsername(username);
        
        User updatedUser = userService.updateUser(currentUser.getId(), userDetails);
        
        // Hide sensitive data
        updatedUser.setPassword(null);
        
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/change-password")
    public ResponseEntity<PasswordChangeResponse> changePassword(@RequestBody PasswordChangeRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.getUserByUsername(username);
        
        // Create a user object with only the password updated
        User userWithNewPassword = new User();
        userWithNewPassword.setUsername(currentUser.getUsername());
        userWithNewPassword.setEmail(currentUser.getEmail());
        userWithNewPassword.setRole(currentUser.getRole());
        userWithNewPassword.setPassword(request.getNewPassword());
        
        userService.updateUser(currentUser.getId(), userWithNewPassword);
        
        return ResponseEntity.ok(new PasswordChangeResponse("Password changed successfully"));
    }
    
    // Inner classes for request/response objects
    static class PasswordChangeRequest {
        private String newPassword;

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
    
    static class PasswordChangeResponse {
        private String message;

        public PasswordChangeResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
} 