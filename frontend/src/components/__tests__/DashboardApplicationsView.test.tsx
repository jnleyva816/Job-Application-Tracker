import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DashboardApplicationsView from '../DashboardApplicationsView';
import { JobApplication } from '../../services/applicationService';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockApplications: JobApplication[] = [
  {
    id: '1',
    company: 'Tech Corp',
    jobTitle: 'Senior Software Engineer',
    status: 'Applied',
    applicationDate: '2024-01-15',
    location: 'San Francisco, CA',
    url: 'https://example.com/job1',
    description: 'Great opportunity',
    compensation: 150000
  },
  {
    id: '2',
    company: 'StartupXYZ',
    jobTitle: 'Frontend Developer',
    status: 'Interviewing',
    applicationDate: '2024-01-10',
    location: 'Remote',
    url: 'https://example.com/job2',
    description: 'Remote first company',
    compensation: 120000
  },
  {
    id: '3',
    company: 'BigTech Inc',
    jobTitle: 'Full Stack Engineer',
    status: 'Offered',
    applicationDate: '2024-01-20',
    location: 'New York, NY',
    url: 'https://example.com/job3',
    description: 'Exciting role',
    compensation: 180000
  },
  {
    id: '4',
    company: 'Smaller Company',
    jobTitle: 'Backend Developer',
    status: 'Rejected',
    applicationDate: '2024-01-05',
    location: 'Austin, TX',
    url: 'https://example.com/job4',
    description: 'Good experience',
    compensation: 100000
  },
  {
    id: '5',
    company: 'Another Corp',
    jobTitle: 'DevOps Engineer',
    status: 'Applied',
    applicationDate: '2024-01-25',
    location: 'Seattle, WA',
    url: 'https://example.com/job5',
    description: 'Cloud focused',
    compensation: 140000
  },
  {
    id: '6',
    company: 'Extra Company',
    jobTitle: 'Data Engineer',
    status: 'Applied',
    applicationDate: '2024-01-30',
    location: 'Boston, MA',
    url: 'https://example.com/job6',
    description: 'Data pipeline work',
    compensation: 160000
  }
];

const renderDashboardApplicationsView = (applications: JobApplication[] = mockApplications) => {
  return render(
    <BrowserRouter>
      <DashboardApplicationsView applications={applications} />
    </BrowserRouter>
  );
};

describe('DashboardApplicationsView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Structure', () => {
    it('should render the component with correct title', () => {
      renderDashboardApplicationsView();

      expect(screen.getByText('Recent Applications')).toBeInTheDocument();
      expect(screen.getByText('View All →')).toBeInTheDocument();
    });

    it('should navigate to applications page when "View All" is clicked', () => {
      renderDashboardApplicationsView();

      fireEvent.click(screen.getByText('View All →'));
      expect(mockNavigate).toHaveBeenCalledWith('/applications');
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no applications exist', () => {
      renderDashboardApplicationsView([]);

      expect(screen.getByText('No applications yet. Get started by adding your first application!')).toBeInTheDocument();
      expect(screen.getByText('Add Your First Application')).toBeInTheDocument();
    });

    it('should navigate to add application page when empty state button is clicked', () => {
      renderDashboardApplicationsView([]);

      fireEvent.click(screen.getByText('Add Your First Application'));
      expect(mockNavigate).toHaveBeenCalledWith('/add-application');
    });
  });

  describe('Applications List', () => {
    it('should display only the 5 most recent applications', () => {
      renderDashboardApplicationsView();

      // Should show 5 applications based on sorting by date (most recent first)
      expect(screen.getByText('Data Engineer')).toBeInTheDocument(); // Jan 30 - most recent
      expect(screen.getByText('DevOps Engineer')).toBeInTheDocument(); // Jan 25
      expect(screen.getByText('Full Stack Engineer')).toBeInTheDocument(); // Jan 20
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument(); // Jan 15
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument(); // Jan 10

      // Should not show the oldest application (Jan 5)
      expect(screen.queryByText('Backend Developer')).not.toBeInTheDocument();
    });

    it('should display application details correctly', () => {
      renderDashboardApplicationsView();

      // Check first application details
      expect(screen.getByText('Data Engineer')).toBeInTheDocument();
      expect(screen.getByText('Extra Company • Boston, MA')).toBeInTheDocument();
      expect(screen.getByText('$160,000')).toBeInTheDocument();

      // Check date formatting
      expect(screen.getByText('1/30/2024')).toBeInTheDocument();
    });

    it('should display all application statuses with correct styling', () => {
      renderDashboardApplicationsView();

      // Use getAllByText since there are multiple "Applied" statuses
      const appliedStatuses = screen.getAllByText('Applied');
      expect(appliedStatuses.length).toBeGreaterThan(0);
      
      expect(screen.getByText('Interviewing')).toBeInTheDocument();
      expect(screen.getByText('Offered')).toBeInTheDocument();
    });

    it('should navigate to application detail when application is clicked', () => {
      renderDashboardApplicationsView();

      // Click on the first application
      fireEvent.click(screen.getByText('Data Engineer'));
      expect(mockNavigate).toHaveBeenCalledWith('/applications/6');
    });

    it('should navigate to application detail when clicking on any part of the application item', () => {
      renderDashboardApplicationsView();

      // Click on company name
      fireEvent.click(screen.getByText('Extra Company • Boston, MA'));
      expect(mockNavigate).toHaveBeenCalledWith('/applications/6');
    });
  });

  describe('Status Color Mapping', () => {
    it('should apply correct styling for different application statuses', () => {
      const applicationsWithAllStatuses: JobApplication[] = [
        {
          id: '1',
          company: 'Company 1',
          jobTitle: 'Job 1',
          status: 'Applied',
          applicationDate: '2024-01-15',
          location: 'Location 1',
          url: 'https://example.com',
          description: 'Description',
          compensation: 100000
        },
        {
          id: '2',
          company: 'Company 2',
          jobTitle: 'Job 2',
          status: 'Interviewing',
          applicationDate: '2024-01-14',
          location: 'Location 2',
          url: 'https://example.com',
          description: 'Description',
          compensation: 100000
        },
        {
          id: '3',
          company: 'Company 3',
          jobTitle: 'Job 3',
          status: 'Offered',
          applicationDate: '2024-01-13',
          location: 'Location 3',
          url: 'https://example.com',
          description: 'Description',
          compensation: 100000
        },
        {
          id: '4',
          company: 'Company 4',
          jobTitle: 'Job 4',
          status: 'Rejected',
          applicationDate: '2024-01-12',
          location: 'Location 4',
          url: 'https://example.com',
          description: 'Description',
          compensation: 100000
        }
      ];

      renderDashboardApplicationsView(applicationsWithAllStatuses);

      // Check that all status types are displayed
      const appliedStatus = screen.getByText('Applied');
      const interviewingStatus = screen.getByText('Interviewing');
      const offeredStatus = screen.getByText('Offered');
      const rejectedStatus = screen.getByText('Rejected');

      expect(appliedStatus).toBeInTheDocument();
      expect(interviewingStatus).toBeInTheDocument();
      expect(offeredStatus).toBeInTheDocument();
      expect(rejectedStatus).toBeInTheDocument();

      // Verify they have the expected CSS classes
      expect(appliedStatus).toHaveClass('bg-primary/10', 'text-primary');
      expect(interviewingStatus).toHaveClass('bg-accent/10', 'text-accent');
      expect(offeredStatus).toHaveClass('bg-success/10', 'text-success');
      expect(rejectedStatus).toHaveClass('bg-red-100', 'text-red-800');
    });
  });

  describe('Date Sorting', () => {
    it('should sort applications by date in descending order (most recent first)', () => {
      const applications: JobApplication[] = [
        {
          id: '1',
          company: 'Old Company',
          jobTitle: 'Old Job',
          status: 'Applied',
          applicationDate: '2024-01-01',
          location: 'Location',
          url: 'https://example.com',
          description: 'Description',
          compensation: 100000
        },
        {
          id: '2',
          company: 'New Company',
          jobTitle: 'New Job',
          status: 'Applied',
          applicationDate: '2024-01-15',
          location: 'Location',
          url: 'https://example.com',
          description: 'Description',
          compensation: 100000
        },
        {
          id: '3',
          company: 'Middle Company',
          jobTitle: 'Middle Job',
          status: 'Applied',
          applicationDate: '2024-01-10',
          location: 'Location',
          url: 'https://example.com',
          description: 'Description',
          compensation: 100000
        }
      ];

      renderDashboardApplicationsView(applications);

      const jobTitles = screen.getAllByRole('heading', { level: 3 });
      
      // Should be sorted with newest first
      expect(jobTitles[0]).toHaveTextContent('New Job'); // 2024-01-15
      expect(jobTitles[1]).toHaveTextContent('Middle Job'); // 2024-01-10
      expect(jobTitles[2]).toHaveTextContent('Old Job'); // 2024-01-01
    });
  });

  describe('Compensation Formatting', () => {
    it('should format compensation with proper number formatting', () => {
      const applications: JobApplication[] = [
        {
          id: '1',
          company: 'Company 1',
          jobTitle: 'Job 1',
          status: 'Applied',
          applicationDate: '2024-01-15',
          location: 'Location',
          url: 'https://example.com',
          description: 'Description',
          compensation: 150000
        },
        {
          id: '2',
          company: 'Company 2',
          jobTitle: 'Job 2',
          status: 'Applied',
          applicationDate: '2024-01-14',
          location: 'Location',
          url: 'https://example.com',
          description: 'Description',
          compensation: 75000
        }
      ];

      renderDashboardApplicationsView(applications);

      expect(screen.getByText('$150,000')).toBeInTheDocument();
      expect(screen.getByText('$75,000')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle applications with different field lengths', () => {
      const applications: JobApplication[] = [
        {
          id: '1',
          company: 'Very Long Company Name That Should Still Display Properly',
          jobTitle: 'Senior Principal Staff Software Engineering Manager',
          status: 'Applied',
          applicationDate: '2024-01-15',
          location: 'San Francisco, CA (Remote Available)',
          url: 'https://example.com',
          description: 'Description',
          compensation: 250000
        }
      ];

      renderDashboardApplicationsView(applications);

      expect(screen.getByText('Senior Principal Staff Software Engineering Manager')).toBeInTheDocument();
      expect(screen.getByText('Very Long Company Name That Should Still Display Properly • San Francisco, CA (Remote Available)')).toBeInTheDocument();
      expect(screen.getByText('$250,000')).toBeInTheDocument();
    });
  });
}); 