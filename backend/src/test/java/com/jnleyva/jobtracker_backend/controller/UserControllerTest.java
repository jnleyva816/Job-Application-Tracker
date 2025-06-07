package com.jnleyva.jobtracker_backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jnleyva.jobtracker_backend.config.TestSecurityConfig;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.service.JwtService;
import com.jnleyva.jobtracker_backend.service.MyUserDetailsService;
import com.jnleyva.jobtracker_backend.service.TokenBlacklistService;
import com.jnleyva.jobtracker_backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = UserController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@Import(TestSecurityConfig.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private MyUserDetailsService userDetailsService;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    private User testUser;
    private UserDetails userDetails;
    private String testToken;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword("Password123!");
        testUser.setEmail("test@example.com");
        testUser.setRole("ROLE_USER");

        userDetails = org.springframework.security.core.userdetails.User
                .withUsername(testUser.getUsername())
                .password(testUser.getPassword())
                .roles("USER")
                .build();

        testToken = "test.jwt.token";
    }

    @Test
    void registerUser_Success() throws Exception {
        when(userService.createUser(any(User.class))).thenReturn(testUser);

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.username").value(testUser.getUsername()))
                .andExpect(jsonPath("$.email").value(testUser.getEmail()));
    }

    @Test
    void registerUser_InvalidInput() throws Exception {
        User invalidUser = new User();
        invalidUser.setUsername(""); // Empty username
        invalidUser.setEmail("invalid-email"); // Invalid email format
        invalidUser.setPassword(""); // Empty password

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void registerUser_DuplicateUsername() throws Exception {
        when(userService.createUser(any(User.class)))
                .thenThrow(new RuntimeException("Username already exists"));

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Username or email already exists"));
    }

    @Test
    void login_Success() throws Exception {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                testUser.getUsername(), testUser.getPassword());
        
        when(userService.getUserByUsername(testUser.getUsername())).thenReturn(testUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userDetailsService.loadUserByUsername(testUser.getUsername()))
                .thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn(testToken);

        mockMvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UserController.LoginRequest() {{
                    setUsername(testUser.getUsername());
                    setPassword(testUser.getPassword());
                }})))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value(testToken));
    }

    @Test
    void login_InvalidCredentials() throws Exception {
        String wrongUsername = "wronguser";
        when(userService.getUserByUsername(wrongUsername))
                .thenThrow(new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));

        mockMvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UserController.LoginRequest() {{
                    setUsername(wrongUsername);
                    setPassword("wrongpass");
                }})))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    @WithMockUser
    public void testLogout() throws Exception {
        mockMvc.perform(post("/api/users/logout")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Successfully logged out"));
    }

    @Test
    void userLifecycle_RegisterLoginLogoutLoginAgain() throws Exception {
        // Setup test user
        User newUser = new User();
        newUser.setUsername("lifecycleuser");
        newUser.setPassword("Password123!");
        newUser.setEmail("lifecycle@example.com");
        newUser.setRole("ROLE_USER");

        // 1. Register User
        when(userService.createUser(any(User.class))).thenReturn(newUser);
        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value(newUser.getUsername()));

        // 2. First Login
        Authentication firstAuth = new UsernamePasswordAuthenticationToken(
                newUser.getUsername(), newUser.getPassword());
        String firstToken = "first.jwt.token";
        
        when(userService.getUserByUsername(newUser.getUsername())).thenReturn(newUser);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(firstAuth);
        when(userDetailsService.loadUserByUsername(newUser.getUsername()))
                .thenReturn(org.springframework.security.core.userdetails.User
                        .withUsername(newUser.getUsername())
                        .password(newUser.getPassword())
                        .roles("USER")
                        .build());
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn(firstToken);

        mockMvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UserController.LoginRequest() {{
                    setUsername(newUser.getUsername());
                    setPassword(newUser.getPassword());
                }})))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(firstToken));

        // 3. Logout
        mockMvc.perform(post("/api/users/logout")
                .with(user(newUser.getUsername()).roles("USER"))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Successfully logged out"));

        // 4. Second Login
        Authentication secondAuth = new UsernamePasswordAuthenticationToken(
                newUser.getUsername(), newUser.getPassword());
        String secondToken = "second.jwt.token";
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(secondAuth);
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn(secondToken);

        mockMvc.perform(post("/api/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UserController.LoginRequest() {{
                    setUsername(newUser.getUsername());
                    setPassword(newUser.getPassword());
                }})))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(secondToken));
    }
} 