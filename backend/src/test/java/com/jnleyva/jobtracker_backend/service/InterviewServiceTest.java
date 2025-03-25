package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.InterviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InterviewServiceTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private InterviewService interviewService;

    private Application application;
    private Interview interview;
    private Long applicationId;
    private Long interviewId;

    @BeforeEach
    void setUp() {
        applicationId = 1L;
        interviewId = 1L;

        application = new Application();
        application.setId(applicationId);

        interview = new Interview();
        interview.setId(interviewId);
        interview.setType("Technical");
        interview.setInterviewDate(LocalDateTime.now());
        interview.setNotes("Test interview notes");
        interview.setApplication(application);
    }

    @Test
    void getAllInterviewsByApplicationId_ShouldReturnListOfInterviews() {
        when(interviewRepository.findByApplicationId(applicationId))
                .thenReturn(Arrays.asList(interview));

        var result = interviewService.getAllInterviewsByApplicationId(applicationId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(interviewId, result.get(0).getId());
        assertEquals("Technical", result.get(0).getType());
        assertEquals("Test interview notes", result.get(0).getNotes());
    }

    @Test
    void getInterviewById_ShouldReturnInterview_WhenFound() {
        when(interviewRepository.findById(interviewId))
                .thenReturn(Optional.of(interview));

        var result = interviewService.getInterviewById(applicationId, interviewId);

        assertTrue(result.isPresent());
        assertEquals(interviewId, result.get().getId());
        assertEquals("Technical", result.get().getType());
        assertEquals("Test interview notes", result.get().getNotes());
    }

    @Test
    void getInterviewById_ShouldReturnEmpty_WhenNotFound() {
        when(interviewRepository.findById(interviewId))
                .thenReturn(Optional.empty());

        var result = interviewService.getInterviewById(applicationId, interviewId);

        assertFalse(result.isPresent());
    }

    @Test
    void createInterview_ShouldCreateAndReturnInterview() {
        when(applicationRepository.findById(applicationId))
                .thenReturn(Optional.of(application));
        when(interviewRepository.save(any(Interview.class)))
                .thenReturn(interview);

        var result = interviewService.createInterview(applicationId, interview);

        assertNotNull(result);
        assertEquals(interviewId, result.getId());
        assertEquals("Technical", result.getType());
        assertEquals("Test interview notes", result.getNotes());
        assertEquals(application, result.getApplication());
        verify(interviewRepository).save(interview);
    }

    @Test
    void createInterview_ShouldThrowException_WhenApplicationNotFound() {
        when(applicationRepository.findById(applicationId))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> 
            interviewService.createInterview(applicationId, interview)
        );
        verify(interviewRepository, never()).save(any(Interview.class));
    }

    @Test
    void updateInterview_ShouldUpdateAndReturnInterview() {
        when(interviewRepository.findById(interviewId))
                .thenReturn(Optional.of(interview));
        when(interviewRepository.save(any(Interview.class)))
                .thenReturn(interview);

        var result = interviewService.updateInterview(applicationId, interviewId, interview);

        assertNotNull(result);
        assertEquals(interviewId, result.getId());
        assertEquals("Technical", result.getType());
        assertEquals("Test interview notes", result.getNotes());
        verify(interviewRepository).save(interview);
    }

    @Test
    void updateInterview_ShouldThrowException_WhenInterviewNotFound() {
        when(interviewRepository.findById(interviewId))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
            interviewService.updateInterview(applicationId, interviewId, interview)
        );
        verify(interviewRepository, never()).save(any(Interview.class));
    }

    @Test
    void deleteInterview_ShouldDeleteInterview_WhenFound() {
        when(interviewRepository.findById(interviewId))
                .thenReturn(Optional.of(interview));

        interviewService.deleteInterview(applicationId, interviewId);

        verify(interviewRepository).delete(interview);
    }

    @Test
    void deleteInterview_ShouldNotDelete_WhenNotFound() {
        when(interviewRepository.findById(interviewId))
                .thenReturn(Optional.empty());

        interviewService.deleteInterview(applicationId, interviewId);

        verify(interviewRepository, never()).delete(any(Interview.class));
    }
} 