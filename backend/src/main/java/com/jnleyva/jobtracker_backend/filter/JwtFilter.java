package com.jnleyva.jobtracker_backend.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jnleyva.jobtracker_backend.service.JwtService;
import com.jnleyva.jobtracker_backend.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private ObjectMapper objectMapper;

    private void sendErrorResponse(HttpServletResponse response, String message, HttpStatus status) throws IOException {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), error);
        logger.debug("Sending error response: {} with status: {}", message, status);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String username;
        final String jwtToken;

        logger.info("=== Processing request to: {} ===", request.getRequestURI());
        logger.debug("Authorization header present: {}", authHeader != null);
        logger.debug("Current SecurityContext authentication: {}", 
            SecurityContextHolder.getContext().getAuthentication());

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No Bearer token found, proceeding with filter chain");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            jwtToken = authHeader.substring(7);
            logger.info("Token extracted (first 10 chars): {}...", 
                jwtToken.substring(0, Math.min(10, jwtToken.length())));

            // Check if token is blacklisted
            logger.info("Checking if token is blacklisted...");
            boolean isBlacklisted = tokenBlacklistService.isBlacklisted(jwtToken);
            logger.info("Token blacklist check result: {}", isBlacklisted);
            
            if (isBlacklisted) {
                logger.warn("Blocked request with blacklisted token to: {}", request.getRequestURI());
                SecurityContextHolder.clearContext();
                logger.debug("Security context cleared due to blacklisted token");
                sendErrorResponse(response, "Token has been invalidated", HttpStatus.UNAUTHORIZED);
                return;
            }
            
            username = jwtService.extractUsername(jwtToken);
            logger.debug("Username extracted from token: {}", username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                logger.debug("Loading user details for username: {}", username);
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                logger.debug("User details loaded - Username: {}, Authorities: {}, Account non-locked: {}", 
                    userDetails.getUsername(), 
                    userDetails.getAuthorities(),
                    userDetails.isAccountNonLocked());
                
                boolean isTokenValid = jwtService.validateToken(jwtToken, userDetails);
                logger.debug("Token validation result: {}", isTokenValid);
                
                if (isTokenValid) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication set in SecurityContext - Username: {}, Authorities: {}", 
                        username, userDetails.getAuthorities());
                } else {
                    logger.warn("Token validation failed for user: {}", username);
                    SecurityContextHolder.clearContext();
                    logger.debug("Security context cleared due to invalid token");
                    sendErrorResponse(response, "Invalid token", HttpStatus.UNAUTHORIZED);
                    return;
                }
            } else {
                logger.debug("Skipping authentication - Username null: {}, Existing auth: {}", 
                    username == null,
                    SecurityContextHolder.getContext().getAuthentication() != null);
            }
        } catch (Exception e) {
            logger.error("Error processing JWT token: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
            logger.debug("Security context cleared due to error");
            sendErrorResponse(response, "Invalid token", HttpStatus.UNAUTHORIZED);
            return;
        }
        
        logger.debug("=== Completed JWT processing, proceeding with filter chain ===");
        filterChain.doFilter(request, response);
    }
}