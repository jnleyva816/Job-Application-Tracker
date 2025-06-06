package com.jnleyva.jobtracker_backend.repository;

import com.jnleyva.jobtracker_backend.model.ApplicationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistory, Long> {
    
    List<ApplicationStatusHistory> findByApplicationIdOrderByChangedAtAsc(Long applicationId);
    
    List<ApplicationStatusHistory> findByApplicationIdAndStatus(Long applicationId, String status);
    
    @Query("SELECT ash FROM ApplicationStatusHistory ash WHERE ash.application.user.username = :username ORDER BY ash.changedAt DESC")
    List<ApplicationStatusHistory> findByUsernameOrderByChangedAtDesc(@Param("username") String username);
    
    @Query("SELECT ash FROM ApplicationStatusHistory ash WHERE ash.application.user.username = :username AND ash.status = :status")
    List<ApplicationStatusHistory> findByUsernameAndStatus(@Param("username") String username, @Param("status") String status);
} 