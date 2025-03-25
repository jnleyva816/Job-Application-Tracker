package com.jnleyva.jobtracker_backend.repository;

import com.jnleyva.jobtracker_backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByUserId(Long userId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Application a WHERE a.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    
    Long countByUserId(Long userId);
    // You can add custom query methods here if needed
}
