package com.jnleyva.jobtracker.repository;

import com. jnleyva.jobtracker.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    // You can add custom query methods here if needed
}
