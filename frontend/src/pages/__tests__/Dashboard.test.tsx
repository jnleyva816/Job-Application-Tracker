import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Dashboard from '../Dashboard';
import { authService } from '../../services/authService';
import { interviewService } from '../../services/interviewService';

// Mock dependencies
vi.mock('../components/MenuBar', () => ({
  default: () => <div data-testid="menu-bar">Menu Bar</div>
}));

// Add type definitions for mock components
interface CalendarMockProps {
  applications: Array<{
    id: string;
    company: string;
    jobTitle: string;
    status: string;
    applicationDate: string;
    location: string;
    url: string;
    description: string;
    compensation: number;
  }>;
  interviews: Array<{
    id: number;
    type: string;
    interviewDate: string;
    status: string;
    interviewerName: string;
    applicationId: string;
  }>;
  onDateClick: (date: Date, apps: CalendarMockProps['applications'], interviews: CalendarMockProps['interviews']) => void;
}

interface ApplicationsViewMockProps {
  applications: Array<{
    id: string;
    company: string;
    jobTitle: string;
    status: string;
    applicationDate: string;
    location: string;
    url: string;
    description: string;
    compensation: number;
  }>;
}

vi.mock('../components/Calendar', () => ({
  default: ({ applications, interviews, onDateClick }: CalendarMockProps) => (
    <div data-testid="calendar">
      <div>Calendar Component</div>
      <button onClick={() => onDateClick(new Date('2024-01-15'), applications.slice(0, 2), interviews.slice(0, 1))}>
        Mock Date Click
      </button>
    </div>
  )
}));

vi.mock('../components/DashboardApplicationsView', () => ({
  default: ({ applications }: ApplicationsViewMockProps) => (
    <div data-testid="dashboard-applications-view">
      <div>Applications View</div>
      <div>Count: {applications.length}</div>
    </div>
  )
}));

vi.mock('../../services/authService');
vi.mock('../../services/interviewService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockApplications = [
  {
    id: '1',
    company: 'Test Company 1',
    jobTitle: 'Software Engineer',
    status: 'Applied' as const,
    applicationDate: '2024-01-10',
    location: 'Remote',
    url: 'https://example.com',
    description: 'Test job',
    compensation: 100000
  },
  {
    id: '2',
    company: 'Test Company 2',
    jobTitle: 'Senior Developer',
    status: 'Interviewing' as const,
    applicationDate: '2024-01-15',
    location: 'New York',
    url: 'https://example2.com',
    description: 'Another test job',
    compensation: 120000
  },
  {
    id: '3',
    company: 'Test Company 3',
    jobTitle: 'Lead Engineer',
    status: 'Offered' as const,
    applicationDate: '2024-01-20',
    location: 'San Francisco',
    url: 'https://example3.com',
    description: 'Lead position',
    compensation: 150000
  },
  {
    id: '4',
    company: 'Test Company 4',
    jobTitle: 'Frontend Developer',
    status: 'Rejected' as const,
    applicationDate: '2024-01-25',
    location: 'Austin',
    url: 'https://example4.com',
    description: 'Frontend role',
    compensation: 90000
  }
];

const mockInterviews = [
  {
    id: 1,
    type: 'Technical Interview',
    interviewDate: '2024-01-15T10:00:00Z',
    status: 'SCHEDULED',
    interviewerName: 'John Doe',
    applicationId: '2'
  },
  {
    id: 2,
    type: 'Final Interview',
    interviewDate: '2024-01-20T14:00:00Z',
    status: 'COMPLETED',
    interviewerName: 'Jane Smith',
    applicationId: '3'
  }
];

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mocks
    vi.mocked(authService.getToken).mockReturnValue('mock-token');
    global.fetch = vi.fn();
    // Mock environment variable
    import.meta.env.VITE_API_URL = 'http://localhost:8080/api';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching data', async () => {
      // Mock a delayed response
      global.fetch = vi.fn(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve([])
          } as Response), 100)
        )
      ) as ReturnType<typeof vi.fn>;
      vi.mocked(interviewService.getAllUserInterviews).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderDashboard();

      expect(screen.getByText('Loading applications...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // loading spinner
    });
  });

  describe('Error State', () => {
    it('should display error message when token is missing', async () => {
      vi.mocked(authService.getToken).mockReturnValue(null);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('No authentication token found')).toBeInTheDocument();
      });
    });

    it('should display error message when API request fails', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should display error message when API returns non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch applications')).toBeInTheDocument();
      });
    });
  });

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApplications)
      });
      vi.mocked(interviewService.getAllUserInterviews).mockResolvedValue(mockInterviews);
    });

    it('should render dashboard with all components when data loads successfully', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByTestId('menu-bar')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard-applications-view')).toBeInTheDocument();
      expect(screen.getByTestId('calendar')).toBeInTheDocument();
      expect(screen.getByText('Add Application')).toBeInTheDocument();
    });

    it('should display correct statistics cards', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Total Applications')).toBeInTheDocument();
      });

      expect(screen.getByText('4')).toBeInTheDocument(); // Total applications
      expect(screen.getByText('Applied')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Applied count
      expect(screen.getByText('Interviewing')).toBeInTheDocument();
      expect(screen.getByText('Offered')).toBeInTheDocument();
    });

    it('should navigate to add application page when button is clicked', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Add Application')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Application'));
      expect(mockNavigate).toHaveBeenCalledWith('/add-application');
    });

    it('should pass correct data to Calendar component', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('calendar')).toBeInTheDocument();
      });

      expect(screen.getByText('Application Calendar')).toBeInTheDocument();
    });

    it('should pass correct data to DashboardApplicationsView component', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-applications-view')).toBeInTheDocument();
      });

      expect(screen.getByText('Count: 4')).toBeInTheDocument();
    });
  });

  describe('Date Selection and Application Details', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApplications)
      });
      vi.mocked(interviewService.getAllUserInterviews).mockResolvedValue(mockInterviews);
    });

    it('should display selected date applications when date is clicked', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('calendar')).toBeInTheDocument();
      });

      // Simulate clicking on a date
      fireEvent.click(screen.getByText('Mock Date Click'));

      await waitFor(() => {
        expect(screen.getByText('1/15/2024')).toBeInTheDocument();
      });

      expect(screen.getByText('Applications (2)')).toBeInTheDocument();
      expect(screen.getByText('Interviews (1)')).toBeInTheDocument();
    });

    it('should navigate to application detail when application is clicked', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('calendar')).toBeInTheDocument();
      });

      // Simulate clicking on a date to show applications
      fireEvent.click(screen.getByText('Mock Date Click'));

      await waitFor(() => {
        expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      });

      // Click on the first application
      fireEvent.click(screen.getByText('Software Engineer'));
      expect(mockNavigate).toHaveBeenCalledWith('/applications/1');
    });

    it('should handle interview clicks with application navigation', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('calendar')).toBeInTheDocument();
      });

      // Simulate clicking on a date to show interviews
      fireEvent.click(screen.getByText('Mock Date Click'));

      await waitFor(() => {
        expect(screen.getByText('Technical Interview')).toBeInTheDocument();
      });

      // Click on the interview
      fireEvent.click(screen.getByText('Technical Interview'));
      expect(mockNavigate).toHaveBeenCalledWith('/applications/2');
    });
  });

  describe('Status Color Mapping', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApplications)
      });
      vi.mocked(interviewService.getAllUserInterviews).mockResolvedValue(mockInterviews);
    });

    it('should display correct status colors for applications', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('calendar')).toBeInTheDocument();
      });

      // Simulate clicking on a date to show applications with different statuses
      fireEvent.click(screen.getByText('Mock Date Click'));

      await waitFor(() => {
        expect(screen.getByText('Applied')).toBeInTheDocument();
      });

      // Check that status badges are rendered (the actual styling would be tested in integration tests)
      expect(screen.getByText('Applied')).toBeInTheDocument();
    });
  });

  describe('Interview Service Error Handling', () => {
    it('should continue loading even if interview service fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApplications)
      });
      vi.mocked(interviewService.getAllUserInterviews).mockRejectedValue(new Error('Interview service error'));

      // Spy on console.error to verify error logging
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Should still render dashboard successfully
      expect(screen.getByTestId('dashboard-applications-view')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch interviews:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Interview Status Display', () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApplications)
      });
      vi.mocked(interviewService.getAllUserInterviews).mockResolvedValue([
        ...mockInterviews,
        {
          id: 3,
          type: 'Cancelled Interview',
          interviewDate: '2024-01-25T10:00:00Z',
          status: 'CANCELLED',
          applicationId: '4'
        }
      ]);
    });

    it('should display different interview statuses correctly', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('calendar')).toBeInTheDocument();
      });

      // Simulate clicking on a date
      fireEvent.click(screen.getByText('Mock Date Click'));

      await waitFor(() => {
        expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
      });
    });
  });
}); 