-- Create user_profiles table
CREATE TABLE user_profiles (
    profile_id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    location VARCHAR(255),
    skills TEXT,
    job_types TEXT,
    preferred_locations TEXT,
    salary_min INT,
    salary_max INT,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    phone_number VARCHAR(20),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (profile_id),
    UNIQUE KEY uk_user_profiles_user_id (user_id),
    CONSTRAINT fk_user_profiles_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
); 