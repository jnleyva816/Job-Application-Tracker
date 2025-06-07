package com.jnleyva.jobtracker_backend.repository;

import com.jnleyva.jobtracker_backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserId(Long userId);
    
    Long countByUserId(Long userId);
    
    List<Application> findByCreatedAtBefore(LocalDateTime date);
    // You can add custom query methods here if needed
}
