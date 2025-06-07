package com.jnleyva.jobtracker_backend.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    private final String secret;
    private final long expiration = 86400000; // 1 day (in milliseconds)

    public JwtService() {
        // First try to get JWT_SECRET from system environment variables (Docker)
        String envSecret = System.getenv("JWT_SECRET");
        
        // If not found in system env, try to load from .env file (local development)
        if (envSecret == null || envSecret.isEmpty()) {
            try {
                Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
                envSecret = dotenv.get("JWT_SECRET");
                logger.info("Loaded JWT secret from .env file");
            } catch (Exception e) {
                logger.info("No .env file found, using system environment or default");
                envSecret = null;
            }
        } else {
            logger.info("Loaded JWT secret from system environment variables");
        }
        
        if (envSecret == null || envSecret.isEmpty()) {
            // Fallback for development only - remove in production
            this.secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
            logger.warn("WARNING: Using default JWT secret. Set JWT_SECRET in environment variables or .env file");
        } else {
            this.secret = envSecret;
            logger.info("JWT secret loaded successfully");
        }
    }

    /**
     * Extracts the username from the JWT token.
     * @param token The JWT token.
     * @return The username.
     */
    public String extractUsername(String token) {
        try {
            logger.info("Extracting username from token");
            String username = extractClaim(token, Claims::getSubject);
            logger.info("Username extracted: {}", username);
            return username;
        } catch (ExpiredJwtException e) {
            logger.warn("Attempted to extract username from expired token");
            return e.getClaims().getSubject();
        } catch (Exception e) {
            logger.error("Error extracting username from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extracts the expiration date from the JWT token.
     * @param token The JWT token.
     * @return The expiration date.
     */
    public Date extractExpiration(String token) {
        try {
            logger.info("Extracting expiration from token");
            Date expiration = extractClaim(token, Claims::getExpiration);
            logger.info("Expiration extracted: {}", expiration);
            return expiration;
        } catch (ExpiredJwtException e) {
            logger.warn("Attempted to extract expiration from expired token");
            return e.getClaims().getExpiration();
        } catch (Exception e) {
            logger.error("Error extracting expiration from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * A generic method to extract a specific claim from the token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from the JWT token.
     * @param token The JWT token.
     * @return The claims.
     */
    private Claims extractAllClaims(String token) {
        try {
            logger.debug("Extracting all claims from token");
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            logger.debug("Claims extracted successfully");
            return claims;
        } catch (ExpiredJwtException e) {
            logger.warn("Token has expired");
            throw e;
        } catch (JwtException e) {
            logger.error("Invalid JWT signature or malformed token: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error parsing JWT token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Checks if the token has expired.
     * @param token The JWT token.
     * @return True if the token has expired, false otherwise.
     */
    private Boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            if (expiration == null) {
                logger.warn("Token has no expiration date");
                return true;
            }
            boolean expired = expiration.before(new Date());
            logger.info("Token expiration check - Expired: {}, Expiration: {}, Current time: {}", 
                expired, expiration, new Date());
            return expired;
        } catch (ExpiredJwtException e) {
            logger.warn("Token has expired");
            return true;
        } catch (Exception e) {
            logger.error("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Validates the JWT token.
     * Checks if the token is valid and not expired
     * @param token The JWT token.
     * @param userDetails The user details.
     * @return True if the token is valid, false otherwise.
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            logger.info("Validating token for user: {}", userDetails.getUsername());
            final String username = extractUsername(token);
            boolean isValid = (username != null && 
                    username.equals(userDetails.getUsername()) && 
                    !isTokenExpired(token));
            logger.info("Token validation result: {}", isValid);
            return isValid;
        } catch (ExpiredJwtException e) {
            logger.warn("Attempted to validate expired token");
            return false;
        } catch (Exception e) {
            logger.error("Error validating token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Generates a JWT token for the given user.
     * @param userDetails The user details.
     * @return The JWT token.
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generates a JWT token with extra claims.
     * @param extraClaims Extra claims to include in the token.
     * @param userDetails The user details.
     * @return The JWT token.
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        try {
            logger.info("Generating token for user: {}", userDetails.getUsername());
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + expiration);
            
            String token = Jwts.builder()
                    .claims(extraClaims)
                    .subject(userDetails.getUsername())
                    .issuedAt(now)
                    .expiration(expiryDate)
                    .signWith(getSigningKey())
                    .compact();
            
            logger.info("Token generated successfully. Expires at: {}", expiryDate);
            return token;
        } catch (Exception e) {
            logger.error("Error generating token: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Gets the signing key from the secret.
     * @return The signing key.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
