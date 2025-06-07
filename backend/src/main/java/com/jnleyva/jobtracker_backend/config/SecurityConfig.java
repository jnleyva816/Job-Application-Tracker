package com.jnleyva.jobtracker_backend.config;

import com.jnleyva.jobtracker_backend.filter.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
                config.setAllowedOriginPatterns(Arrays.asList("*")); // Use patterns for server deployment
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(Arrays.asList("*"));
                config.setExposedHeaders(Arrays.asList("Authorization"));
                config.setAllowCredentials(true); // Enable credentials for server deployment
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
        // Using the new approach recommended for Spring Boot 3.5+
        // Create a ProviderManager with custom authentication logic
        return new AuthenticationProvider() {
            @Override
            public Authentication authenticate(Authentication authentication) throws AuthenticationException {
                
                String username = authentication.getName();
                String password = authentication.getCredentials().toString();
                
                logger.debug("Authentication attempt for user: {}", username);
                
                try {
                    // Load user details
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    
                    // Check password
                    if (passwordEncoder().matches(password, userDetails.getPassword())) {
                        logger.debug("Authentication successful for user: {}", username);
                        return new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    } else {
                        logger.debug("Authentication failed for user: {} - invalid password", username);
                        throw new BadCredentialsException("Invalid credentials");
                    }
                } catch (UsernameNotFoundException e) {
                    logger.debug("Authentication failed for user: {} - user not found", username);
                    throw new BadCredentialsException("Invalid credentials");
                }
            }

            @Override
            public boolean supports(Class<?> authentication) {
                return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        logger.info("Authentication manager initialized");
        return config.getAuthenticationManager();
    }
}
