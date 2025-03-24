package com.jnleyva.jobtracker.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import io.github.cdimascio.dotenv.Dotenv;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private final String secret;
    private final long expiration = 86400000; // 1 day (in milliseconds)

    @Autowired
    private MyUserDetailsService userDetailsService;

    public JwtService() {
        Dotenv dotenv = Dotenv.load();
        String envSecret = dotenv.get("JWT_SECRET");
        if (envSecret == null || envSecret.isEmpty()) {
            // Fallback for development only - remove in production
            this.secret = "MjFiMTYyYTViYmZiYjNhODZmMjY4YTgxZmMxZmQyOGE0Yjk5MWQzODAyOGQzYzRlMGVjNmVjYmEwNDNkMTBjMA==";
            System.out.println("WARNING: Using default JWT secret. Set JWT_SECRET in .env file");
        } else {
            this.secret = envSecret;
        }
    }

    /**
     * Extracts the username from the JWT token.
     * @param token The JWT token.
     * @return The username.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the expiration date from the JWT token.
     * @param token The JWT token.
     * @return The expiration date.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
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
        return Jwts
                .parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Checks if the token has expired.
     * @param token The JWT token.
     * @return True if the token has expired, false otherwise.
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validates the JWT token.
     * Checks if the token is valid and not expired
     * @param token The JWT token.
     * @param userDetails The user details.
     * @return True if the token is valid, false otherwise.
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
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
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Gets the signing key from the secret.
     * @return The signing key.
     */
    private Key getSigningKey() {
        System.out.println("JWT Secret from .env: " + secret); // Add this line
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
