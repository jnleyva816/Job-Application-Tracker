package com.jnleyva.jobtracker_backend.service;

import com.jnleyva.jobtracker_backend.model.Application;
import com.jnleyva.jobtracker_backend.model.Interview;
import com.jnleyva.jobtracker_backend.model.InterviewDTO;
import com.jnleyva.jobtracker_backend.model.User;
import com.jnleyva.jobtracker_backend.repository.ApplicationRepository;
import com.jnleyva.jobtracker_backend.repository.InterviewRepository;
import com.jnleyva.jobtracker_backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Interview Service TDD Tests")
public class InterviewServiceTDDTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @InjectMocks
    private InterviewService interviewService;

    private User testUser;
    private Application testApplication;
    private Interview testInterview;
    private InterviewDTO testInterviewDTO;
    private Long applicationId;
    private Long interviewId;

    @BeforeEach
    void setUp() {
        applicationId = 1L;
        interviewId = 1L;

        // Create test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        // Create test application
        testApplication = new Application();
        testApplication.setId(applicationId);
        testApplication.setCompany("Test Company");
        testApplication.setJobTitle("Software Engineer");
        testApplication.setStatus("APPLIED");
        testApplication.setApplicationDate(LocalDate.now());
        testApplication.setUser(testUser);

        // Create test interview
        testInterview = new Interview();
        testInterview.setId(interviewId);
        testInterview.setType("Technical");
        testInterview.setInterviewDate(LocalDateTime.now().plusDays(7));
        testInterview.setNotes("Initial technical screening");
        testInterview.setStatus("SCHEDULED");
        testInterview.setInterviewerName("John Doe");
        testInterview.setInterviewerEmail("john.doe@company.com");
        testInterview.setLocation("Virtual");
        testInterview.setDurationMinutes(60);
        testInterview.setApplication(testApplication);

        // Create test interview DTO
        testInterviewDTO = new InterviewDTO();
        testInterviewDTO.setType("Technical");
        testInterviewDTO.setInterviewDate(LocalDateTime.now().plusDays(7));
        testInterviewDTO.setNotes("Initial technical screening");
        testInterviewDTO.setStatus("SCHEDULED");
        testInterviewDTO.setInterviewerName("John Doe");
        testInterviewDTO.setInterviewerEmail("john.doe@company.com");
        testInterviewDTO.setLocation("Virtual");
        testInterviewDTO.setDurationMinutes(60);
    }

    @Nested
    @DisplayName("Create Interview Tests")
    class CreateInterviewTests {

        @Test
        @DisplayName("Should create interview successfully with DTO")
        void shouldCreateInterviewSuccessfullyWithDTO() {
            // Given
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewRepository.save(any(Interview.class))).thenReturn(testInterview);

            // When
            Interview result = interviewService.createInterview(applicationId, testInterviewDTO);

            // Then
            assertNotNull(result);
            assertEquals("Technical", result.getType());
            assertEquals("SCHEDULED", result.getStatus());
            assertEquals("John Doe", result.getInterviewerName());
            assertEquals(testApplication, result.getApplication());
            verify(applicationRepository).findById(applicationId);
            verify(interviewRepository).save(any(Interview.class));
        }

        @Test
        @DisplayName("Should create interview successfully with entity")
        void shouldCreateInterviewSuccessfullyWithEntity() {
            // Given
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(interviewRepository.save(any(Interview.class))).thenReturn(testInterview);

            // When
            Interview result = interviewService.createInterview(applicationId, testInterview);

            // Then
            assertNotNull(result);
            assertEquals("Technical", result.getType());
            assertEquals(testApplication, result.getApplication());
            verify(applicationRepository).findById(applicationId);
            verify(interviewRepository).save(testInterview);
        }

        @Test
        @DisplayName("Should throw exception when application not found during creation")
        void shouldThrowExceptionWhenApplicationNotFoundDuringCreation() {
            // Given
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.empty());

            // When & Then
            ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> interviewService.createInterview(applicationId, testInterviewDTO)
            );
            assertEquals("Application not found with id: " + applicationId, exception.getMessage());
            verify(applicationRepository).findById(applicationId);
            verify(interviewRepository, never()).save(any(Interview.class));
        }
    }

    @Nested
    @DisplayName("Retrieve Interview Tests")
    class RetrieveInterviewTests {

        @Test
        @DisplayName("Should retrieve all interviews for application")
        void shouldRetrieveAllInterviewsForApplication() {
            // Given
            Interview interview2 = new Interview();
            interview2.setId(2L);
            interview2.setType("HR");
            interview2.setApplication(testApplication);
            
            List<Interview> interviews = Arrays.asList(testInterview, interview2);
            when(applicationRepository.existsById(applicationId)).thenReturn(true);
            when(interviewRepository.findByApplicationId(applicationId)).thenReturn(interviews);

            // When
            List<Interview> result = interviewService.getAllInterviewsByApplicationId(applicationId);

            // Then
            assertNotNull(result);
            assertEquals(2, result.size());
            assertEquals("Technical", result.get(0).getType());
            assertEquals("HR", result.get(1).getType());
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository).findByApplicationId(applicationId);
        }

        @Test
        @DisplayName("Should throw exception when application not found during retrieval")
        void shouldThrowExceptionWhenApplicationNotFoundDuringRetrieval() {
            // Given
            when(applicationRepository.existsById(applicationId)).thenReturn(false);

            // When & Then
            ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> interviewService.getAllInterviewsByApplicationId(applicationId)
            );
            assertEquals("Application not found with id: " + applicationId, exception.getMessage());
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository, never()).findByApplicationId(anyLong());
        }

        @Test
        @DisplayName("Should retrieve interview by ID successfully")
        void shouldRetrieveInterviewByIdSuccessfully() {
            // Given
            when(applicationRepository.existsById(applicationId)).thenReturn(true);
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(testInterview));

            // When
            Optional<Interview> result = interviewService.getInterviewById(applicationId, interviewId);

            // Then
            assertTrue(result.isPresent());
            assertEquals("Technical", result.get().getType());
            assertEquals(interviewId, result.get().getId());
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository).findById(interviewId);
        }

        @Test
        @DisplayName("Should return empty when interview not found")
        void shouldReturnEmptyWhenInterviewNotFound() {
            // Given
            when(applicationRepository.existsById(applicationId)).thenReturn(true);
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.empty());

            // When
            Optional<Interview> result = interviewService.getInterviewById(applicationId, interviewId);

            // Then
            assertFalse(result.isPresent());
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository).findById(interviewId);
        }

        @Test
        @DisplayName("Should return empty when interview belongs to different application")
        void shouldReturnEmptyWhenInterviewBelongsToDifferentApplication() {
            // Given
            Application differentApplication = new Application();
            differentApplication.setId(999L);
            testInterview.setApplication(differentApplication);
            
            when(applicationRepository.existsById(applicationId)).thenReturn(true);
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(testInterview));

            // When
            Optional<Interview> result = interviewService.getInterviewById(applicationId, interviewId);

            // Then
            assertFalse(result.isPresent());
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository).findById(interviewId);
        }
    }

    @Nested
    @DisplayName("Update Interview Tests")
    class UpdateInterviewTests {

        @Test
        @DisplayName("Should update interview successfully with DTO")
        void shouldUpdateInterviewSuccessfullyWithDTO() {
            // Given
            InterviewDTO updateDTO = new InterviewDTO();
            updateDTO.setType("Final Round");
            updateDTO.setInterviewDate(LocalDateTime.now().plusDays(14));
            updateDTO.setNotes("Final interview with CEO");
            updateDTO.setStatus("SCHEDULED");
            updateDTO.setInterviewerName("Jane Smith");
            updateDTO.setInterviewerEmail("jane.smith@company.com");
            updateDTO.setLocation("On-site");
            updateDTO.setDurationMinutes(90);

            when(applicationRepository.existsById(applicationId)).thenReturn(true);
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(testInterview));
            when(interviewRepository.save(any(Interview.class))).thenReturn(testInterview);

            // When
            Interview result = interviewService.updateInterview(applicationId, interviewId, updateDTO);

            // Then
            assertNotNull(result);
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository).findById(interviewId);
            verify(interviewRepository).save(testInterview);
        }

        @Test
        @DisplayName("Should update interview successfully with entity")
        void shouldUpdateInterviewSuccessfullyWithEntity() {
            // Given
            Interview updateInterview = new Interview();
            updateInterview.setType("Final Round");
            updateInterview.setInterviewDate(LocalDateTime.now().plusDays(14));
            updateInterview.setNotes("Final interview with CEO");
            updateInterview.setStatus("COMPLETED");

            when(applicationRepository.existsById(applicationId)).thenReturn(true);
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(testInterview));
            when(interviewRepository.save(any(Interview.class))).thenReturn(testInterview);

            // When
            Interview result = interviewService.updateInterview(applicationId, interviewId, updateInterview);

            // Then
            assertNotNull(result);
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository).findById(interviewId);
            verify(interviewRepository).save(testInterview);
        }

        @Test
        @DisplayName("Should throw exception when application not found during update")
        void shouldThrowExceptionWhenApplicationNotFoundDuringUpdate() {
            // Given
            when(applicationRepository.existsById(applicationId)).thenReturn(false);

            // When & Then
            ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> interviewService.updateInterview(applicationId, interviewId, testInterviewDTO)
            );
            assertEquals("Application not found with id: " + applicationId, exception.getMessage());
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository, never()).findById(anyLong());
        }

        @Test
        @DisplayName("Should throw exception when interview not found during update")
        void shouldThrowExceptionWhenInterviewNotFoundDuringUpdate() {
            // Given
            when(applicationRepository.existsById(applicationId)).thenReturn(true);
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.empty());

            // When & Then
            ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> interviewService.updateInterview(applicationId, interviewId, testInterviewDTO)
            );
            assertEquals("Interview not found with id: " + interviewId + " for application: " + applicationId, exception.getMessage());
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository).findById(interviewId);
        }
    }

    @Nested
    @DisplayName("Delete Interview Tests")
    class DeleteInterviewTests {

        @Test
        @DisplayName("Should delete interview successfully")
        void shouldDeleteInterviewSuccessfully() {
            // Given
            when(applicationRepository.existsById(applicationId)).thenReturn(true);
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(testInterview));

            // When
            assertDoesNotThrow(() -> interviewService.deleteInterview(applicationId, interviewId));

            // Then
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository).findById(interviewId);
            verify(interviewRepository).delete(testInterview);
        }

        @Test
        @DisplayName("Should throw exception when application not found during deletion")
        void shouldThrowExceptionWhenApplicationNotFoundDuringDeletion() {
            // Given
            when(applicationRepository.existsById(applicationId)).thenReturn(false);

            // When & Then
            ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> interviewService.deleteInterview(applicationId, interviewId)
            );
            assertEquals("Application not found with id: " + applicationId, exception.getMessage());
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository, never()).findById(anyLong());
            verify(interviewRepository, never()).delete(any(Interview.class));
        }

        @Test
        @DisplayName("Should throw exception when interview not found during deletion")
        void shouldThrowExceptionWhenInterviewNotFoundDuringDeletion() {
            // Given
            when(applicationRepository.existsById(applicationId)).thenReturn(true);
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.empty());

            // When & Then
            ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> interviewService.deleteInterview(applicationId, interviewId)
            );
            assertEquals("Interview not found with id: " + interviewId + " for application: " + applicationId, exception.getMessage());
            verify(applicationRepository).existsById(applicationId);
            verify(interviewRepository).findById(interviewId);
            verify(interviewRepository, never()).delete(any(Interview.class));
        }
    }

    @Nested
    @DisplayName("Utility Method Tests")
    class UtilityMethodTests {

        @Test
        @DisplayName("Should return true when interview exists for application")
        void shouldReturnTrueWhenInterviewExistsForApplication() {
            // Given
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(testInterview));

            // When
            boolean result = interviewService.existsByApplicationIdAndInterviewId(applicationId, interviewId);

            // Then
            assertTrue(result);
            verify(interviewRepository).findById(interviewId);
        }

        @Test
        @DisplayName("Should return false when interview does not exist")
        void shouldReturnFalseWhenInterviewDoesNotExist() {
            // Given
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.empty());

            // When
            boolean result = interviewService.existsByApplicationIdAndInterviewId(applicationId, interviewId);

            // Then
            assertFalse(result);
            verify(interviewRepository).findById(interviewId);
        }

        @Test
        @DisplayName("Should return false when interview belongs to different application")
        void shouldReturnFalseWhenInterviewBelongsToDifferentApplication() {
            // Given
            Application differentApplication = new Application();
            differentApplication.setId(999L);
            testInterview.setApplication(differentApplication);
            
            when(interviewRepository.findById(interviewId)).thenReturn(Optional.of(testInterview));

            // When
            boolean result = interviewService.existsByApplicationIdAndInterviewId(applicationId, interviewId);

            // Then
            assertFalse(result);
            verify(interviewRepository).findById(interviewId);
        }
    }
} 