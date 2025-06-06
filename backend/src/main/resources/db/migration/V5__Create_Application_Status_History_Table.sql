-- Create application_status_history table
CREATE TABLE application_status_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    status VARCHAR(100) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(255),
    
    CONSTRAINT fk_status_history_application 
        FOREIGN KEY (application_id) 
        REFERENCES applications(application_id) 
        ON DELETE CASCADE,
    
    INDEX idx_application_status_history_app_id (application_id),
    INDEX idx_application_status_history_status (status),
    INDEX idx_application_status_history_changed_at (changed_at)
);

-- Add comment to table
ALTER TABLE application_status_history 
COMMENT = 'Tracks the history of status changes for job applications to support progression analytics'; 