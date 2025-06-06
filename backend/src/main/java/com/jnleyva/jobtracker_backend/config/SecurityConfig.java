package com.jnleyva.jobtracker_backend.config;

import com.jnleyva.jobtracker_backend.filter.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    // Use a fixed strength for all password encoding - very important!
    private static final int BCRYPT_STRENGTH = 10;

    @Autowired
    private JwtFilter jwtFilter;
    
    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    @Primary
    public PasswordEncoder passwordEncoder() {
        logger.info("Creating BCryptPasswordEncoder with strength: {}", BCRYPT_STRENGTH);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(BCRYPT_STRENGTH);
        // Test the encoder
        String testPassword = "test";
        String encoded = encoder.encode(testPassword);
        boolean matches = encoder.matches(testPassword, encoded);
        logger.debug("Password encoder test - encoded length: {}, matches: {}", encoded.length(), matches);
        return encoder;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(Arrays.asList("*")); // Allow all origins for debugging
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(Arrays.asList("*"));
                config.setExposedHeaders(Arrays.asList("Authorization"));
                config.setAllowCredentials(false); // Set to false when allowing all origins
                config.setMaxAge(3600L);
                return config;
            }))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/users/login", "/api/users/register", "/api/users/token").permitAll()
                // Debug endpoints (allow for testing)
                .requestMatchers("/api/debug/**").permitAll()
                // Job parsing endpoints (allow for testing)
                .requestMatchers("/api/job-parsing/**").permitAll()
                // Static resources (HTML, CSS, JS, images, etc.)
                .requestMatchers("/", "/index.html", "/url-tester.html", "/static/**", "/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll()
                // WebJars (if using any)
                .requestMatchers("/webjars/**").permitAll()
                // Actuator endpoints (if enabled)
                .requestMatchers("/actuator/**").permitAll()
                // Admin endpoints - require ADMIN role
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Protected endpoints
                .requestMatchers("/api/applications/**").authenticated()
                .requestMatchers("/api/users/**").authenticated()
                // Default: require authentication
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        logger.info("Security configuration initialized with debug and static resources access");
        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        // Don't hide user not found exception
        authProvider.setHideUserNotFoundExceptions(false);
        // Log every authentication attempt
        authProvider.setPreAuthenticationChecks(userDetails -> {
            logger.debug("Pre-authentication check for user: {}", userDetails.getUsername());
        });
        authProvider.setPostAuthenticationChecks(userDetails -> {
            logger.debug("Post-authentication check for user: {}", userDetails.getUsername());
        });
        logger.info("Authentication provider configured with BCrypt strength: {}", BCRYPT_STRENGTH);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        logger.info("Authentication manager initialized");
        return config.getAuthenticationManager();
    }
}
