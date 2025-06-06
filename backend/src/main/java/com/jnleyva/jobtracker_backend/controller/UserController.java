package com.jnleyva.jobtracker_backend.controller;

import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.service.JwtService;
import com.jnleyva.jobtracker_backend.service.MyUserDetailsService;
import com.jnleyva.jobtracker_backend.service.TokenBlacklistService;
import com.jnleyva.jobtracker_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private MyUserDetailsService userDetailsService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        logger.info("=== Starting login process for user: {} ===", loginRequest.getUsername());
        try {
            // Validate input
            if (loginRequest.getUsername() == null || loginRequest.getUsername().isEmpty() ||
                loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
                logger.warn("Login failed: Missing username or password");
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Username and password are required"));
            }

            // Check if account exists
            User user = userService.getUserByUsername(loginRequest.getUsername());
            logger.debug("User state before login - ID: {}, Username: {}, Failed attempts: {}, Locked: {}, Last login: {}", 
                user.getId(), user.getUsername(), user.getFailedLoginAttempts(), 
                user.isAccountLocked(), user.getLastLogin());
            
            // Check if account is locked
            if (user.isAccountLocked()) {
                logger.warn("Login blocked: Account locked for user: {} until {}", 
                    loginRequest.getUsername(), user.getAccountLockedUntil());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Account is temporarily locked. Please try again later."));
            }

            // Attempt authentication
            try {
                logger.debug("Attempting authentication - Username: {}, Password length: {}", 
                    loginRequest.getUsername(), loginRequest.getPassword().length());
                
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
                );
                
                // Set authentication in context
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.debug("Authentication context set for user: {}", loginRequest.getUsername());
    
                // Reset failed login attempts and update last login
                user.resetFailedLoginAttempts();
                user.setLastLogin(LocalDateTime.now());
                userService.updateUserLoginInfo(user.getId(), user.getFailedLoginAttempts(), user.getLastLogin());
                logger.debug("User state updated - Failed attempts reset, Last login updated to: {}", user.getLastLogin());
    
                // Generate token
                UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
                String token = jwtService.generateToken(userDetails);
                logger.debug("JWT token generated for user: {} (first 10 chars): {}...", 
                    loginRequest.getUsername(), token.substring(0, Math.min(10, token.length())));
    
                logger.info("=== Login successful for user: {} ===", loginRequest.getUsername());
                return ResponseEntity.ok(new LoginResponse(token));
            } catch (AuthenticationException e) {
                logger.error("Authentication failed for user: {} - Reason: {}", 
                    loginRequest.getUsername(), e.getMessage());
                
                // Increment failed login attempts
                user.incrementFailedLoginAttempts();
                
                // Check if we should lock the account
                if (user.getFailedLoginAttempts() >= 5) {  // Maximum failed attempts
                    user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15));  // Lock for 15 minutes
                    logger.warn("Account locked for user: {} until {}", 
                        loginRequest.getUsername(), user.getAccountLockedUntil());
                }
                
                userService.updateUserLoginInfo(user.getId(), user.getFailedLoginAttempts(), user.getLastLogin());
                logger.debug("Updated failed login attempts: {}, Account locked: {}", 
                    user.getFailedLoginAttempts(), user.isAccountLocked());
                
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid credentials"));
            }
        } catch (UsernameNotFoundException e) {
            logger.error("Login failed: User not found - {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid credentials"));
        } catch (Exception e) {
            logger.error("Login failed with unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            logger.info("Registration attempt for user: {}", user.getUsername());
            logger.debug("Raw password length: {}", user.getPassword().length());
            
            User createdUser = userService.createUser(user);
            logger.info("User created successfully: {}", createdUser.getUsername());
            logger.debug("Stored password prefix: {}", 
                createdUser.getPassword().substring(0, Math.min(20, createdUser.getPassword().length())));
            
            // Create a simplified response with only id, username, and email
            UserResponse userResponse = new UserResponse(
                createdUser.getId(),
                createdUser.getUsername(),
                createdUser.getEmail()
            );
            return new ResponseEntity<>(userResponse, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid input data during registration: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid input data: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error during registration: {}", e.getMessage());
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("Username or email already exists"));
            }
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid input data"));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.hasUserId(authentication, #id)")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.hasUsername(authentication, #username)")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.hasEmail(authentication, #email)")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.hasUserId(authentication, #id)")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(id, userDetails);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.hasUserId(authentication, #id)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        logger.info("=== Starting logout process ===");
        
        try {
            // Get current authentication
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth != null ? auth.getName() : "unknown";
            logger.info("Current user attempting to logout: {}", username);
            
            // Extract token from Authorization header
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                logger.info("Token extracted from request (first 10 chars): {}...", 
                    token.substring(0, Math.min(10, token.length())));
                
                // Get token expiration
                Date expiration = jwtService.extractExpiration(token);
                if (expiration != null) {
                    logger.info("Token expiration time: {}", expiration);
                    logger.info("Current time: {}", new Date());
                    logger.info("Time until expiration: {} ms", expiration.getTime() - System.currentTimeMillis());
                    
                    // Blacklist the token
                    tokenBlacklistService.blacklistToken(token, expiration.getTime());
                    logger.info("Token blacklisted successfully");
                    
                    // Update user's last logout time if possible
                    try {
                        User user = userService.getUserByUsername(username);
                        user.setLastLogin(null);  // Clear last login on logout
                        userService.updateUserLoginInfo(user.getId(), user.getFailedLoginAttempts(), user.getLastLogin());
                        logger.info("User last login cleared for: {}", username);
                    } catch (Exception e) {
                        logger.warn("Could not update user last login time: {}", e.getMessage());
                    }
                } else {
                    logger.error("Could not extract token expiration");
                }
            } else {
                logger.warn("No Bearer token found in request");
            }
            
            // Clear the security context
            SecurityContextHolder.clearContext();
            logger.info("Security context cleared");
            
            logger.info("=== Logout successful for user: {} ===", username);
            return ResponseEntity.ok(new MessageResponse("Successfully logged out"));
            
        } catch (Exception e) {
            logger.error("Error during logout: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Logout failed"));
        } finally {
            logger.info("Final SecurityContext state - Authentication: {}", 
                SecurityContextHolder.getContext().getAuthentication());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Test endpoint is working!");
    }

    @GetMapping("/debug/password-check/{username}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> debugPasswordCheck(@PathVariable String username, @RequestParam String password) {
        try {
            logger.info("=== Starting password check for user: {} ===", username);
            
            // Get user
            User user = userService.getUserByUsername(username);
            if (user == null) {
                logger.error("User not found: {}", username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("User not found"));
            }

            logger.info("Found user: {}", username);
            logger.info("User details:");
            logger.info("- ID: {}", user.getId());
            logger.info("- Username: {}", user.getUsername());
            logger.info("- Email: {}", user.getEmail());
            logger.info("- Role: {}", user.getRole());
            logger.info("- Account locked: {}", user.isAccountLocked());
            logger.info("- Failed login attempts: {}", user.getFailedLoginAttempts());
            logger.info("- Last login: {}", user.getLastLogin());
            logger.info("- Created at: {}", user.getCreatedAt());
            logger.info("- Updated at: {}", user.getUpdatedAt());
            
            // Log password details
            logger.info("Password check details:");
            logger.info("- Provided password: {}", password);
            logger.info("- Provided password length: {}", password.length());
            logger.info("- Stored password hash: {}", user.getPassword());
            
            // Test password with BCrypt directly
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            boolean matches1 = encoder.matches(password, user.getPassword());
            logger.info("BCrypt direct match result: {}", matches1);
            
            // Test with a new hash
            String newHash = encoder.encode(password);
            boolean matches2 = encoder.matches(password, newHash);
            logger.info("BCrypt test with new hash result: {}", matches2);
            logger.info("New hash: {}", newHash);
            
            // Test with injected PasswordEncoder
            boolean matches3 = passwordEncoder.matches(password, user.getPassword());
            logger.info("Injected PasswordEncoder match result: {}", matches3);
            
            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("passwordMatches", matches3);
            response.put("bCryptDirectMatch", matches1);
            response.put("bCryptNewHashMatch", matches2);
            response.put("accountLocked", user.isAccountLocked());
            response.put("failedLoginAttempts", user.getFailedLoginAttempts());
            response.put("storedPasswordHash", user.getPassword());
            response.put("newHashForComparison", newHash);
            response.put("providedPassword", password);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error checking password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Error checking password: " + e.getMessage()));
        }
    }

    @PostMapping("/token")
    public ResponseEntity<?> getToken(@RequestBody LoginRequest loginRequest) {
        logger.info("=== Starting token generation for user: {} ===", loginRequest.getUsername());
        try {
            // Validate input
            if (loginRequest.getUsername() == null || loginRequest.getUsername().isEmpty() ||
                loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
                logger.warn("Token generation failed: Missing username or password");
                return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Username and password are required"));
            }

            // Check if account exists
            User user = userService.getUserByUsername(loginRequest.getUsername());
            
            // Check if account is locked
            if (user.isAccountLocked()) {
                logger.warn("Token generation blocked: Account locked for user: {} until {}", 
                    loginRequest.getUsername(), user.getAccountLockedUntil());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Account is temporarily locked. Please try again later."));
            }

            // Use authentication manager for consistent password validation
            try {
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
                );
                
                // Generate token
                UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
                String token = jwtService.generateToken(userDetails);
                logger.debug("JWT token generated for user: {} (first 10 chars): {}...", 
                    loginRequest.getUsername(), token.substring(0, Math.min(10, token.length())));

                logger.info("=== Token generation successful for user: {} ===", loginRequest.getUsername());
                return ResponseEntity.ok(new LoginResponse(token));
            } catch (AuthenticationException e) {
                logger.error("Token generation failed: Invalid credentials for user: {}", loginRequest.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid credentials"));
            }
        } catch (UsernameNotFoundException e) {
            logger.error("Token generation failed: User not found - {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid credentials"));
        } catch (Exception e) {
            logger.error("Token generation failed with unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred"));
        }
    }

    // Inner classes for request/response objects
    static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    static class LoginResponse {
        private String token;

        public LoginResponse(String token) {
            this.token = token;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }
    }

    static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    // Add this new inner class for the register response
    static class UserResponse {
        private Long id;
        private String username;
        private String email;

        public UserResponse(Long id, String username, String email) {
            this.id = id;
            this.username = username;
            this.email = email;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    // Add this new inner class for logout response
    static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
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