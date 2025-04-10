package com.jnleyva.jobtracker_backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseMigration {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    @Transactional
    public void migrate() {
        try {
            // Check if user_id column exists in applications table
            if (!columnExists("applications", "user_id")) {
                System.out.println("Starting database migration to add user_id column to applications table...");
                
                // Check if the foreign key constraint already exists, and drop it if it does
                try {
                    jdbcTemplate.execute("ALTER TABLE applications DROP CONSTRAINT IF EXISTS fk_applications_user CASCADE");
                } catch (Exception e) {
                    System.out.println("No constraint to drop: " + e.getMessage());
                }
                
                // Check if column exists, add if it doesn't
                if (!columnExists("applications", "user_id")) {
                    // Add the user_id column
                    jdbcTemplate.execute("ALTER TABLE applications ADD COLUMN user_id BIGINT");
                }
                
                // Create a user if none exists
                Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
                Long userId = null;
                
                if (userCount == null || userCount == 0) {
                    // Create a temporary admin user
                    jdbcTemplate.execute("INSERT INTO users (username, password, email, role, created_at, updated_at) " +
                            "VALUES ('admin_migration', '$2a$10$migrationpasswordhashedvalue', 'admin_migration@example.com', " +
                            "'ROLE_ADMIN', NOW(), NOW())");
                    
                    userId = jdbcTemplate.queryForObject("SELECT user_id FROM users ORDER BY user_id LIMIT 1", Long.class);
                } else {
                    // Get the first user ID
                    userId = jdbcTemplate.queryForObject("SELECT user_id FROM users ORDER BY user_id LIMIT 1", Long.class);
                }
                
                // Update existing applications to use this user ID
                if (userId != null) {
                    // Update only where user_id is null
                    jdbcTemplate.update("UPDATE applications SET user_id = ? WHERE user_id IS NULL", userId);
                }
                
                // Make the column not nullable
                jdbcTemplate.execute("ALTER TABLE applications ALTER COLUMN user_id SET NOT NULL");
                
                // Add foreign key constraint
                jdbcTemplate.execute("ALTER TABLE applications ADD CONSTRAINT fk_applications_user " +
                        "FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE");
                
                System.out.println("Database migration completed successfully!");
            } else {
                System.out.println("Database schema is already up to date!");
            }
        } catch (DataAccessException e) {
            System.err.println("Data access error during database migration: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Error during database migration: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private boolean columnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns " +
                        "WHERE table_name = ? AND column_name = ?",
                Integer.class,
                tableName, columnName);
        return count != null && count > 0;
    }
} 