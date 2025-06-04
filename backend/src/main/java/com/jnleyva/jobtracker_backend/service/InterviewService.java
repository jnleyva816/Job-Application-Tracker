package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.model.InterviewDTO;
import com.jnleyva.jobtracker_backend.repository.InterviewRepository;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
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
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application not found with id: " + applicationId);
        }
        return interviewRepository.findByApplicationId(applicationId);
    }

    public Optional<Interview> getInterviewById(Long applicationId, Long interviewId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application not found with id: " + applicationId);
        }
        
        return interviewRepository.findById(interviewId)
                .filter(interview -> interview.getApplication().getId().equals(applicationId));
    }

    @Transactional
    public Interview createInterview(Long applicationId, InterviewDTO interviewDTO) {
        return applicationRepository.findById(applicationId)
                .map(application -> {
                    Interview interview = interviewDTO.toEntity();
                    interview.setApplication(application);
                    return interviewRepository.save(interview);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));
    }

    @Transactional
    public Interview createInterview(Long applicationId, Interview interview) {
        return applicationRepository.findById(applicationId)
                .map(application -> {
                    interview.setApplication(application);
                    return interviewRepository.save(interview);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));
    }

    @Transactional
    public Interview updateInterview(Long applicationId, Long interviewId, InterviewDTO interviewDTO) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application not found with id: " + applicationId);
        }
        
        return interviewRepository.findById(interviewId)
                .filter(interview -> interview.getApplication().getId().equals(applicationId))
                .map(interview -> {
                    interview.setType(interviewDTO.getType());
                    interview.setInterviewDate(interviewDTO.getInterviewDate());
                    interview.setNotes(interviewDTO.getNotes());
                    interview.setStatus(interviewDTO.getStatus());
                    interview.setInterviewerName(interviewDTO.getInterviewerName());
                    interview.setInterviewerEmail(interviewDTO.getInterviewerEmail());
                    interview.setLocation(interviewDTO.getLocation());
                    interview.setDurationMinutes(interviewDTO.getDurationMinutes());
                    return interviewRepository.save(interview);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId + " for application: " + applicationId));
    }

    @Transactional
    public Interview updateInterview(Long applicationId, Long interviewId, Interview interviewDetails) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application not found with id: " + applicationId);
        }
        
        return interviewRepository.findById(interviewId)
                .filter(interview -> interview.getApplication().getId().equals(applicationId))
                .map(interview -> {
                    interview.setType(interviewDetails.getType());
                    interview.setInterviewDate(interviewDetails.getInterviewDate());
                    interview.setNotes(interviewDetails.getNotes());
                    if (interviewDetails.getStatus() != null) {
                        interview.setStatus(interviewDetails.getStatus());
                    }
                    if (interviewDetails.getInterviewerName() != null) {
                        interview.setInterviewerName(interviewDetails.getInterviewerName());
                    }
                    if (interviewDetails.getInterviewerEmail() != null) {
                        interview.setInterviewerEmail(interviewDetails.getInterviewerEmail());
                    }
                    if (interviewDetails.getLocation() != null) {
                        interview.setLocation(interviewDetails.getLocation());
                    }
                    if (interviewDetails.getDurationMinutes() != null) {
                        interview.setDurationMinutes(interviewDetails.getDurationMinutes());
                    }
                    return interviewRepository.save(interview);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId + " for application: " + applicationId));
    }

    @Transactional
    public void deleteInterview(Long applicationId, Long interviewId) {
        if (!applicationRepository.existsById(applicationId)) {
            throw new ResourceNotFoundException("Application not found with id: " + applicationId);
        }
        
        Interview interview = interviewRepository.findById(interviewId)
                .filter(i -> i.getApplication().getId().equals(applicationId))
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + interviewId + " for application: " + applicationId));
        
        interviewRepository.delete(interview);
    }

    public boolean existsByApplicationIdAndInterviewId(Long applicationId, Long interviewId) {
        return interviewRepository.findById(interviewId)
                .map(interview -> interview.getApplication().getId().equals(applicationId))
                .orElse(false);
    }
} 