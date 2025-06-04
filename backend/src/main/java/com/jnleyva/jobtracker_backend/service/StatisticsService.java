package com.jnleyva.jobtracker_backend.service;

import java.util.Map;

public interface StatisticsService {
    Map<String, Object> getStatistics(String username, boolean isAdmin);
} 