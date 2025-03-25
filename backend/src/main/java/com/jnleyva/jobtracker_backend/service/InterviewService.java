package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.repository.InterviewRepository;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InterviewService {
    
    @Autowired
    private InterviewRepository interviewRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;

    public List<Interview> getAllInterviewsByApplicationId(Long applicationId) {
        return interviewRepository.findByApplicationId(applicationId);
    }

    public Optional<Interview> getInterviewById(Long applicationId, Long interviewId) {
        return interviewRepository.findById(interviewId)
                .filter(interview -> interview.getApplication().getId().equals(applicationId));
    }

    @Transactional
    public Interview createInterview(Long applicationId, Interview interview) {
        return applicationRepository.findById(applicationId)
                .map(application -> {
                    interview.setApplication(application);
                    return interviewRepository.save(interview);
                })
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));
    }

    @Transactional
    public Interview updateInterview(Long applicationId, Long interviewId, Interview interviewDetails) {
        return interviewRepository.findById(interviewId)
                .filter(interview -> interview.getApplication().getId().equals(applicationId))
                .map(interview -> {
                    interview.setType(interviewDetails.getType());
                    interview.setInterviewDate(interviewDetails.getInterviewDate());
                    interview.setNotes(interviewDetails.getNotes());
                    return interviewRepository.save(interview);
                })
                .orElseThrow(() -> new RuntimeException("Interview not found with id: " + interviewId));
    }

    @Transactional
    public void deleteInterview(Long applicationId, Long interviewId) {
        interviewRepository.findById(interviewId)
                .filter(interview -> interview.getApplication().getId().equals(applicationId))
                .ifPresent(interviewRepository::delete);
    }
} 