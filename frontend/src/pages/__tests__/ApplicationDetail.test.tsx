import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ApplicationDetail from '../ApplicationDetail';
import { applicationService } from '../../services/applicationService';
import { interviewService } from '../../services/interviewService';

// Mock dependencies
vi.mock('../components/MenuBar', () => ({
  default: () => <div data-testid="menu-bar">Menu Bar</div>
}));

vi.mock('../../services/applicationService');
vi.mock('../../services/interviewService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockApplication = {
  id: '1',
  company: 'Test Company',
  jobTitle: 'Software Engineer',
  status: 'Applied' as const,
  applicationDate: '2024-01-15',
  location: 'San Francisco, CA',
  url: 'https://example.com/job',
  description: 'Great job opportunity',
  compensation: 150000
};

const mockInterviews = [
  {
    id: 1,
    type: 'TECHNICAL_INTERVIEW',
    interviewDate: '2024-01-20T10:00:00Z',
    status: 'SCHEDULED',
    interviewerName: 'John Doe',
    interviewerEmail: 'john@company.com',
    location: 'Office',
    durationMinutes: 60,
    meetingLink: 'https://zoom.us/meeting1',
    notes: 'Technical round'
  },
  {
    id: 2,
    type: 'HR_INTERVIEW',
    interviewDate: '2024-01-22T14:00:00Z',
    status: 'COMPLETED',
    interviewerName: 'Jane Smith',
    interviewerEmail: 'jane@company.com',
    location: 'Remote',
    durationMinutes: 45,
    meetingLink: 'https://zoom.us/meeting2',
    notes: 'Culture fit discussion'
  }
];

const mockInterviewTypes = [
  { value: 'TECHNICAL_INTERVIEW', label: 'Technical Interview' },
  { value: 'HR_INTERVIEW', label: 'HR Interview' },
  { value: 'BEHAVIORAL_INTERVIEW', label: 'Behavioral Interview' },
  { value: 'PHONE_SCREENING', label: 'Phone Screening' },
  { value: 'FINAL_INTERVIEW', label: 'Final Interview' },
  { value: 'OTHER', label: 'Other' }
];

const mockInterviewStatuses = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RESCHEDULED', label: 'Rescheduled' }
];

const renderApplicationDetail = (applicationId: string = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/applications/${applicationId}`]}>
      <ApplicationDetail />
    </MemoryRouter>
  );
};

describe('ApplicationDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default successful mocks
    vi.mocked(applicationService.getApplicationById).mockResolvedValue(mockApplication);
    vi.mocked(interviewService.getInterviewsByApplicationId).mockResolvedValue(mockInterviews);
    vi.mocked(interviewService.getInterviewTypes).mockResolvedValue(mockInterviewTypes);
    vi.mocked(interviewService.getInterviewStatuses).mockResolvedValue(mockInterviewStatuses);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading state while fetching data', async () => {
      // Mock delayed responses
      vi.mocked(applicationService.getApplicationById).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApplication), 100))
      );

      renderApplicationDetail();

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when no application ID is provided', async () => {
      render(
        <MemoryRouter initialEntries={['/applications/']}>
          <ApplicationDetail />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No application ID provided')).toBeInTheDocument();
      });
    });

    it('should display error when application fetch fails', async () => {
      vi.mocked(applicationService.getApplicationById).mockRejectedValue(new Error('Application not found'));

      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Application not found')).toBeInTheDocument();
      });
    });

    it('should continue loading even if interviews fetch fails', async () => {
      vi.mocked(interviewService.getInterviewsByApplicationId).mockRejectedValue(new Error('Interview fetch failed'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch interviews:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should use default interview types/statuses when API fails', async () => {
      vi.mocked(interviewService.getInterviewTypes).mockRejectedValue(new Error('API failed'));
      vi.mocked(interviewService.getInterviewStatuses).mockRejectedValue(new Error('API failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      // Should still render successfully with default values
      expect(screen.getByText('Test Company')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Application Details Display', () => {
    it('should display application information correctly', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      expect(screen.getByText('Test Company')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('$150,000')).toBeInTheDocument();
      expect(screen.getByText('Applied')).toBeInTheDocument();
      expect(screen.getByText('Great job opportunity')).toBeInTheDocument();
    });

    it('should display job URL as a clickable link', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      const jobLink = screen.getByRole('link', { name: /view job posting/i });
      expect(jobLink).toHaveAttribute('href', 'https://example.com/job');
      expect(jobLink).toHaveAttribute('target', '_blank');
    });

    it('should display application date in correct format', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    });
  });

  describe('Edit Application', () => {
    it('should enable edit mode when edit button is clicked', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should save application changes when save button is clicked', async () => {
      const updatedApplication = { ...mockApplication, jobTitle: 'Senior Software Engineer' };
      vi.mocked(applicationService.updateApplication).mockResolvedValue(updatedApplication);

      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      const titleInput = screen.getByDisplayValue('Software Engineer');
      fireEvent.change(titleInput, { target: { value: 'Senior Software Engineer' } });

      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(vi.mocked(applicationService.updateApplication)).toHaveBeenCalledWith('1', expect.objectContaining({
          jobTitle: 'Senior Software Engineer'
        }));
      });

      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    });

    it('should handle save errors gracefully', async () => {
      vi.mocked(applicationService.updateApplication).mockRejectedValue(new Error('Save failed'));

      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    });

    it('should cancel edit mode when cancel button is clicked', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Edit'));

      const titleInput = screen.getByDisplayValue('Software Engineer');
      fireEvent.change(titleInput, { target: { value: 'Changed Title' } });

      fireEvent.click(screen.getByText('Cancel'));

      // Should revert to original value
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Changed Title')).not.toBeInTheDocument();
    });
  });

  describe('Delete Application', () => {
    it('should show delete confirmation modal when delete button is clicked', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete'));

      expect(screen.getByText('Are you sure you want to delete this application?')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });

    it('should delete application and navigate to applications list when confirmed', async () => {
      vi.mocked(applicationService.deleteApplication).mockResolvedValue(undefined);

      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete'));
      fireEvent.click(screen.getByText('Delete Application'));

      await waitFor(() => {
        expect(vi.mocked(applicationService.deleteApplication)).toHaveBeenCalledWith('1');
        expect(mockNavigate).toHaveBeenCalledWith('/applications');
      });
    });

    it('should handle delete errors gracefully', async () => {
      vi.mocked(applicationService.deleteApplication).mockRejectedValue(new Error('Delete failed'));

      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete'));
      fireEvent.click(screen.getByText('Delete Application'));

      await waitFor(() => {
        expect(screen.getByText('Delete failed')).toBeInTheDocument();
      });
    });

    it('should close delete confirmation modal when cancelled', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Delete'));
      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.queryByText('Are you sure you want to delete this application?')).not.toBeInTheDocument();
    });
  });

  describe('Interviews Section', () => {
    it('should display interviews list correctly', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Interviews')).toBeInTheDocument();
      });

      expect(screen.getByText('Technical Interview')).toBeInTheDocument();
      expect(screen.getByText('HR Interview')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should show add interview modal when add interview button is clicked', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Interview'));

      expect(screen.getByText('Schedule New Interview')).toBeInTheDocument();
    });

    it('should create new interview when form is submitted', async () => {
      const newInterview = {
        id: 3,
        type: 'FINAL_INTERVIEW',
        interviewDate: '2024-01-25T15:00:00Z',
        status: 'SCHEDULED',
        interviewerName: 'Bob Johnson',
        interviewerEmail: 'bob@company.com',
        location: 'Office',
        durationMinutes: 90,
        meetingLink: '',
        notes: 'Final round'
      };

      vi.mocked(interviewService.createInterview).mockResolvedValue(newInterview);

      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Interview'));

      // Fill form
      fireEvent.change(screen.getByLabelText('Interview Type'), { target: { value: 'FINAL_INTERVIEW' } });
      fireEvent.change(screen.getByLabelText('Date & Time'), { target: { value: '2024-01-25T15:00' } });
      fireEvent.change(screen.getByLabelText('Interviewer Name'), { target: { value: 'Bob Johnson' } });

      fireEvent.click(screen.getByText('Schedule Interview'));

      await waitFor(() => {
        expect(vi.mocked(interviewService.createInterview)).toHaveBeenCalledWith('1', expect.objectContaining({
          type: 'FINAL_INTERVIEW',
          interviewerName: 'Bob Johnson'
        }));
      });
    });

    it('should validate required fields when creating interview', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Interview'));
      fireEvent.click(screen.getByText('Schedule Interview'));

      await waitFor(() => {
        expect(screen.getByText('Interview type is required')).toBeInTheDocument();
      });
    });

    it('should handle interview creation errors', async () => {
      vi.mocked(interviewService.createInterview).mockRejectedValue(new Error('Create failed'));

      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Interview'));

      fireEvent.change(screen.getByLabelText('Interview Type'), { target: { value: 'TECHNICAL_INTERVIEW' } });
      fireEvent.change(screen.getByLabelText('Date & Time'), { target: { value: '2024-01-25T15:00' } });

      fireEvent.click(screen.getByText('Schedule Interview'));

      await waitFor(() => {
        expect(screen.getByText('Create failed')).toBeInTheDocument();
      });
    });
  });

  describe('Interview Management', () => {
    it('should allow editing existing interviews', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Technical Interview')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[1]); // Click edit for first interview

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    it('should delete interview when confirmed', async () => {
      vi.mocked(interviewService.deleteInterview).mockResolvedValue(undefined);

      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('Technical Interview')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[1]); // Click delete for first interview

      await waitFor(() => {
        expect(vi.mocked(interviewService.deleteInterview)).toHaveBeenCalledWith('1', '1');
      });
    });
  });

  describe('Status Badge Colors', () => {
    it('should display correct status colors for different interview statuses', async () => {
      renderApplicationDetail();

      await waitFor(() => {
        expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
      });

      const scheduledBadge = screen.getByText('SCHEDULED');
      const completedBadge = screen.getByText('COMPLETED');

      expect(scheduledBadge).toHaveClass('bg-blue-100', 'text-blue-800');
      expect(completedBadge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });
}); 