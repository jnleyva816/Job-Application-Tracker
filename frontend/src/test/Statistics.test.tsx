import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Statistics from '../pages/Statistics';
import { statisticsService } from '../services/statisticsService';

// Mock the services
vi.mock('../services/statisticsService');
vi.mock('../services/authService');

// Mock the MenuBar component
vi.mock('../components/MenuBar', () => ({
  default: () => <div data-testid="menu-bar">Menu Bar</div>
}));

const mockStatisticsService = vi.mocked(statisticsService);

const mockStatisticsData = {
  total: 25,
  byStatus: {
    Applied: 10,
    Interviewing: 8,
    Offered: 5,
    Rejected: 2,
  },
  byMonth: {
    'Jan 2024': 5,
    'Feb 2024': 8,
    'Mar 2024': 12,
  },
  averageResponseTime: 7,
  successRate: 20,
  interviewStats: {
    totalInterviews: 15,
    byType: {
      'Technical': 6,
      'HR': 4,
      'Final': 3,
      'Behavioral': 2,
    },
    byStatus: {
      'SCHEDULED': 3,
      'COMPLETED': 10,
      'CANCELLED': 2,
    },
    upcoming: 3,
    past: 10,
    today: 2,
    byMonth: {
      'Jan 2024': 3,
      'Feb 2024': 6,
      'Mar 2024': 6,
    },
    conversionRate: 60.0,
    averagePerApplication: 1.5,
  },
};

const renderStatistics = () => {
  return render(
    <BrowserRouter>
      <Statistics />
    </BrowserRouter>
  );
};

describe('Statistics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockStatisticsService.getStatistics.mockImplementation(() => new Promise(() => {}));
    
    renderStatistics();
    
    expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('should display statistics data when loaded successfully', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Statistics')).toBeInTheDocument();
    });

    // Check overview cards
    expect(screen.getByText('Total Applications').nextElementSibling).toHaveTextContent('25');
    expect(screen.getByText('Success Rate').nextElementSibling).toHaveTextContent('20%');
    expect(screen.getByText('Avg Response Time').nextElementSibling).toHaveTextContent('7 days');
    expect(screen.getByText('Active Applications').nextElementSibling).toHaveTextContent('18');

    // Check interview overview cards
    expect(screen.getByText('Total Interviews').nextElementSibling).toHaveTextContent('15');
    expect(screen.getByText('Interview Rate').nextElementSibling).toHaveTextContent('60%');
    expect(screen.getByText('Upcoming Interviews').nextElementSibling).toHaveTextContent('3');
    expect(screen.getByText('Avg per Application').nextElementSibling).toHaveTextContent('1.5');

    // Check status distribution
    expect(screen.getByText('Status Distribution')).toBeInTheDocument();
    // Verify status distribution contains the expected statuses
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Interviewing')).toBeInTheDocument();
    expect(screen.getByText('Offered')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();

    // Check interview statistics sections
    expect(screen.getByText('Interview Types')).toBeInTheDocument();
    expect(screen.getByText('Interview Status')).toBeInTheDocument();

    // Check monthly distribution
    expect(screen.getByText('Applications by Month')).toBeInTheDocument();
    expect(screen.getByText('Jan 2024')).toBeInTheDocument();
    expect(screen.getByText('Feb 2024')).toBeInTheDocument();
    expect(screen.getByText('Mar 2024')).toBeInTheDocument();
  });

  it('should display error message when statistics fail to load', async () => {
    const errorMessage = 'Failed to fetch statistics: 500';
    mockStatisticsService.getStatistics.mockRejectedValue(new Error(errorMessage));
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should display no statistics message when stats is null', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(null as any);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('No statistics available')).toBeInTheDocument();
    });
  });

  it('should handle interview statistics when no interviews exist', async () => {
    const dataWithNoInterviews = {
      ...mockStatisticsData,
      interviewStats: {
        totalInterviews: 0,
        byType: {},
        byStatus: {},
        upcoming: 0,
        past: 0,
        today: 0,
        byMonth: {},
        conversionRate: 0.0,
        averagePerApplication: 0.0,
      },
    };
    
    mockStatisticsService.getStatistics.mockResolvedValue(dataWithNoInterviews);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Statistics')).toBeInTheDocument();
    });

    // Should show interview overview cards with zero values
    expect(screen.getByText('Total Interviews').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Interview Rate').nextElementSibling).toHaveTextContent('0%');
    expect(screen.getByText('Upcoming Interviews').nextElementSibling).toHaveTextContent('0');
    expect(screen.getByText('Avg per Application').nextElementSibling).toHaveTextContent('0');

    // Should not show interview types and status sections when no interviews exist
    expect(screen.queryByText('Interview Types')).not.toBeInTheDocument();
    expect(screen.queryByText('Interview Status')).not.toBeInTheDocument();
  });

  it('should display correct status bar colors', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Statistics')).toBeInTheDocument();
    });

    // Check that status bars are rendered
    const statusBars = screen.getAllByRole('progressbar');
    expect(statusBars.length).toBeGreaterThan(0);
  });

  it('should calculate active applications correctly', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Statistics')).toBeInTheDocument();
    });

    // Active applications should be Applied + Interviewing = 10 + 8 = 18
    expect(screen.getByText('Active Applications').nextElementSibling).toHaveTextContent('18');
  });

  it('should prevent division by zero in progress bars', async () => {
    const dataWithZeroTotal = {
      total: 0,
      byStatus: {
        Applied: 0,
        Interviewing: 0,
        Offered: 0,
        Rejected: 0,
      },
      byMonth: {
        'Jan 2024': 0,
      },
      averageResponseTime: 0,
      successRate: 0,
      interviewStats: {
        totalInterviews: 0,
        byType: {},
        byStatus: {},
        upcoming: 0,
        past: 0,
        today: 0,
        byMonth: {},
        conversionRate: 0.0,
        averagePerApplication: 0.0,
      },
    };
    
    mockStatisticsService.getStatistics.mockResolvedValue(dataWithZeroTotal);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Statistics')).toBeInTheDocument();
    });

    // Should not crash and should handle zero division gracefully
    expect(screen.getByText('Total Applications').nextElementSibling).toHaveTextContent('0');
  });

  it('should call statistics service on component mount', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(mockStatisticsService.getStatistics).toHaveBeenCalledTimes(1);
    });
  });

  it('should display interview types when interviews exist', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Statistics')).toBeInTheDocument();
    });

    // Check interview types are displayed
    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
    expect(screen.getByText('Behavioral')).toBeInTheDocument();
  });

  it('should display interview statuses when interviews exist', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Statistics')).toBeInTheDocument();
    });

    // Check interview statuses are displayed
    expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
  });
}); 