package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.InterviewRepository;
import com.jnleyva.jobtracker_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    private static final Logger logger = LoggerFactory.getLogger(StatisticsServiceImpl.class);

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Override
    public Map<String, Object> getStatistics(String username, boolean isAdmin) {
        logger.info("=== Getting statistics for user: {}, isAdmin: {} ===", username, isAdmin);
        try {
            List<Application> applications;
            List<Interview> interviews;
            
            if (isAdmin) {
                logger.info("Admin user - retrieving all applications and interviews");
                applications = applicationRepository.findAll();
                interviews = interviewRepository.findAll();
                logger.info("Found {} total applications and {} total interviews", applications.size(), interviews.size());
            } else {
                logger.info("Regular user - finding user by username: {}", username);
                Optional<User> user = userRepository.findByUsername(username);
                if (user.isEmpty()) {
                    logger.error("User not found: {}", username);
                    throw new RuntimeException("User not found");
                }
                logger.info("User found - ID: {}, Username: {}", user.get().getId(), user.get().getUsername());
                
                applications = applicationRepository.findByUserId(user.get().getId());
                logger.info("Found {} applications for user ID: {}", applications.size(), user.get().getId());
                
                // Get all interviews for user's applications
                interviews = new ArrayList<>();
                for (Application app : applications) {
                    List<Interview> appInterviews = interviewRepository.findByApplicationId(app.getId());
                    interviews.addAll(appInterviews);
                }
                logger.info("Found {} total interviews for user's applications", interviews.size());
            }

            logger.info("Calculating statistics for {} applications and {} interviews", applications.size(), interviews.size());
            Map<String, Object> result = calculateStatistics(applications, interviews);
            logger.info("Statistics calculated successfully: {}", result);
            return result;
        } catch (Exception e) {
            logger.error("Error in getStatistics: {}", e.getMessage(), e);
            throw e;
        }
    }

    private Map<String, Object> calculateStatistics(List<Application> applications, List<Interview> interviews) {
        logger.debug("Calculating statistics for {} applications and {} interviews", applications.size(), interviews.size());
        Map<String, Object> stats = new HashMap<>();
        
        // Total applications
        stats.put("total", applications.size());
        logger.debug("Total applications: {}", applications.size());
        
        // Status distribution based on progression (highest status reached)
        Map<String, Integer> byStatus = new HashMap<>();
        byStatus.put("Applied", 0);
        byStatus.put("Interviewing", 0);
        byStatus.put("Offered", 0);
        byStatus.put("Rejected", 0);
        
        // Track current status distribution separately for comparison
        Map<String, Integer> currentStatusDistribution = new HashMap<>();
        currentStatusDistribution.put("Applied", 0);
        currentStatusDistribution.put("Interviewing", 0);
        currentStatusDistribution.put("Offered", 0);
        currentStatusDistribution.put("Rejected", 0);
        
        for (Application app : applications) {
            // Count current status
            String currentStatus = app.getStatus();
            logger.trace("Processing application ID: {}, Current Status: {}", app.getId(), currentStatus);
            currentStatusDistribution.put(currentStatus, currentStatusDistribution.getOrDefault(currentStatus, 0) + 1);
            
            // Count based on status progression
            // Each application contributes to ALL statuses it has reached
            if (app.hasReachedStatus("Applied")) {
                byStatus.put("Applied", byStatus.get("Applied") + 1);
            }
            if (app.hasReachedStatus("Interviewing")) {
                byStatus.put("Interviewing", byStatus.get("Interviewing") + 1);
            }
            if (app.hasReachedStatus("Offered")) {
                byStatus.put("Offered", byStatus.get("Offered") + 1);
            }
            if (app.hasReachedStatus("Rejected")) {
                byStatus.put("Rejected", byStatus.get("Rejected") + 1);
            }
            
            logger.trace("Application {} has reached: Applied={}, Interviewing={}, Offered={}, Rejected={}", 
                app.getId(),
                app.hasReachedStatus("Applied"),
                app.hasReachedStatus("Interviewing"), 
                app.hasReachedStatus("Offered"),
                app.hasReachedStatus("Rejected"));
        }
        
        stats.put("byStatus", byStatus);
        stats.put("currentStatusDistribution", currentStatusDistribution);
        logger.debug("Status progression distribution: {}", byStatus);
        logger.debug("Current status distribution: {}", currentStatusDistribution);
        
        // Applications by month
        Map<String, Integer> byMonth = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        
        for (Application app : applications) {
            String monthYear = app.getApplicationDate().format(formatter);
            logger.trace("Processing application date: {} -> {}", app.getApplicationDate(), monthYear);
            byMonth.put(monthYear, byMonth.getOrDefault(monthYear, 0) + 1);
        }
        stats.put("byMonth", byMonth);
        logger.debug("Monthly distribution: {}", byMonth);
        
        // Calculate success rate (Offered / Total * 100)
        int offered = byStatus.get("Offered");
        double successRate = applications.isEmpty() ? 0.0 : (double) offered / applications.size() * 100;
        stats.put("successRate", Math.round(successRate * 100.0) / 100.0);
        logger.debug("Success rate: {}%", successRate);
        
        // Calculate average response time (simplified calculation)
        int avgResponseTime = calculateAverageResponseTime(applications);
        stats.put("averageResponseTime", avgResponseTime);
        logger.debug("Average response time: {} days", avgResponseTime);
        
        // Add interview statistics
        Map<String, Object> interviewStats = calculateInterviewStatistics(interviews, applications);
        stats.put("interviewStats", interviewStats);
        logger.debug("Interview statistics: {}", interviewStats);
        
        return stats;
    }
    
    private Map<String, Object> calculateInterviewStatistics(List<Interview> interviews, List<Application> applications) {
        logger.debug("=== Calculating interview statistics for {} interviews ===", interviews.size());
        Map<String, Object> interviewStats = new HashMap<>();
        
        // Total interviews
        interviewStats.put("totalInterviews", interviews.size());
        logger.debug("Total interviews: {}", interviews.size());
        
        // Interview types distribution
        Map<String, Integer> byType = new HashMap<>();
        
        // Interview status distribution
        Map<String, Integer> byInterviewStatus = new HashMap<>();
        
        // Upcoming vs past interviews
        LocalDateTime now = LocalDateTime.now();
        int upcomingInterviews = 0;
        int pastInterviews = 0;
        int todayInterviews = 0;
        
        // Interview months distribution
        Map<String, Integer> interviewsByMonth = new HashMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        
        for (Interview interview : interviews) {
            logger.trace("Processing interview ID: {}, Type: {}, Date: {}, Status: {}", 
                interview.getId(), interview.getType(), interview.getInterviewDate(), interview.getStatus());
            
            // Count by type
            String type = interview.getType();
            byType.put(type, byType.getOrDefault(type, 0) + 1);
            
            // Count by status
            String status = interview.getStatus() != null ? interview.getStatus() : "SCHEDULED";
            byInterviewStatus.put(status, byInterviewStatus.getOrDefault(status, 0) + 1);
            
            // Count by timing (upcoming vs past)
            LocalDateTime interviewDate = interview.getInterviewDate();
            if (interviewDate.toLocalDate().isEqual(now.toLocalDate())) {
                todayInterviews++;
            } else if (interviewDate.isAfter(now)) {
                upcomingInterviews++;
            } else {
                pastInterviews++;
            }
            
            // Count by month
            String monthYear = interviewDate.format(monthFormatter);
            interviewsByMonth.put(monthYear, interviewsByMonth.getOrDefault(monthYear, 0) + 1);
        }
        
        interviewStats.put("byType", byType);
        interviewStats.put("byStatus", byInterviewStatus);
        interviewStats.put("upcoming", upcomingInterviews);
        interviewStats.put("past", pastInterviews);
        interviewStats.put("today", todayInterviews);
        interviewStats.put("byMonth", interviewsByMonth);
        
        logger.debug("Interview types distribution: {}", byType);
        logger.debug("Interview status distribution: {}", byInterviewStatus);
        logger.debug("Interview timing - Upcoming: {}, Past: {}, Today: {}", upcomingInterviews, pastInterviews, todayInterviews);
        logger.debug("Interviews by month: {}", interviewsByMonth);
        
        // Calculate interview conversion rate (applications with interviews / total applications)
        long applicationsWithInterviews = applications.stream()
                .mapToLong(app -> app.getInterviews().size() > 0 ? 1 : 0)
                .sum();
        
        double interviewConversionRate = applications.isEmpty() ? 0.0 : 
            (double) applicationsWithInterviews / applications.size() * 100;
        interviewStats.put("conversionRate", Math.round(interviewConversionRate * 100.0) / 100.0);
        logger.debug("Interview conversion rate: {}% ({} applications with interviews out of {})", 
            interviewConversionRate, applicationsWithInterviews, applications.size());
        
        // Calculate average interviews per application (for applications that have interviews)
        double avgInterviewsPerApp = applicationsWithInterviews == 0 ? 0.0 : 
            (double) interviews.size() / applicationsWithInterviews;
        interviewStats.put("averagePerApplication", Math.round(avgInterviewsPerApp * 100.0) / 100.0);
        logger.debug("Average interviews per application (with interviews): {}", avgInterviewsPerApp);
        
        // Applications in interviewing status should have interview data
        int interviewingApplications = applications.stream()
                .mapToInt(app -> "Interviewing".equals(app.getStatus()) ? 1 : 0)
                .sum();
        
        logger.info("=== Interview Data Verification ===");
        logger.info("Applications with 'Interviewing' status: {}", interviewingApplications);
        logger.info("Applications that have interview records: {}", applicationsWithInterviews);
        logger.info("Total interview records: {}", interviews.size());
        
        if (interviewingApplications > 0) {
            logger.info("✓ Found applications in 'Interviewing' status - interview data is showing up in stats");
        } else {
            logger.warn("⚠ No applications found with 'Interviewing' status");
        }
        
        if (interviews.size() > 0) {
            logger.info("✓ Interview records found and included in statistics");
        } else {
            logger.warn("⚠ No interview records found in the system");
        }
        
        return interviewStats;
    }
    
    private int calculateAverageResponseTime(List<Application> applications) {
        logger.debug("Calculating average response time for {} applications", applications.size());
        // Simplified calculation - in reality, you'd need response dates
        // For now, return an average based on application dates and current status
        if (applications.isEmpty()) {
            return 0;
        }
        
        long totalDays = 0;
        int respondedApplications = 0;
        LocalDate today = LocalDate.now();
        
        for (Application app : applications) {
            if (!"Applied".equals(app.getStatus())) {
                // Assuming applications that moved past "Applied" got a response
                long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(app.getApplicationDate(), today);
                totalDays += daysBetween;
                respondedApplications++;
                logger.trace("Application {} responded in {} days", app.getId(), daysBetween);
            }
        }
        
        int result = respondedApplications == 0 ? 0 : (int) (totalDays / respondedApplications);
        logger.debug("Average response time calculated: {} days (from {} responded applications)", result, respondedApplications);
        return result;
    }
} 