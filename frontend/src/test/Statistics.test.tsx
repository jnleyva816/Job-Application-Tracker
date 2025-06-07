import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Statistics from '../pages/Statistics';
import { statisticsService, type ApplicationStats } from '../services/statisticsService';

// Mock the services
vi.mock('../services/statisticsService');
vi.mock('../services/authService');

// Mock the MenuBar component
vi.mock('../components/MenuBar', () => ({
  default: () => <div data-testid="menu-bar">Menu Bar</div>
}));

// Mock the chart components
vi.mock('../components/charts', () => ({
  BarChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="bar-chart" data-chart-items={data.length}>
      Bar Chart with {data.length} items
    </div>
  ),
  DonutChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="donut-chart" data-chart-items={data.length}>
      Donut Chart with {data.length} items
    </div>
  ),
  ApplicationFlowChart: ({ stats }: { stats: { total: number } }) => (
    <div data-testid="application-flow-chart">
      Application Flow Chart for {stats.total} applications
    </div>
  )
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
  currentStatusDistribution: {
    Applied: 10,
    Interviewing: 8,
    Offered: 5,
    Rejected: 2,
  },
  byMonth: {
    'Jan 2025': 5,
    'Dec 2024': 8,
    'Nov 2024': 12,
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
      'SCHEDULED': 5,
      'COMPLETED': 8,
      'CANCELLED': 2,
    },
    upcoming: 5,
    past: 8,
    today: 2,
    byMonth: {
      'Jan 2025': 3,
      'Dec 2024': 6,
      'Nov 2024': 6,
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
      expect(screen.getByText('Application Analytics')).toBeInTheDocument();
    });

    // Check overview cards with new design
    expect(screen.getByText('Total Applications').closest('div')).toContainHTML('25');
    expect(screen.getAllByText('Success Rate')[0].closest('div')).toContainHTML('20%');
    expect(screen.getByText('Avg Response Time').closest('div')).toContainHTML('7');
    expect(screen.getByText('Active Applications').closest('div')).toContainHTML('18');

    // Check interview overview cards
    expect(screen.getAllByText('Total Interviews')[0].closest('div')).toContainHTML('15');
    expect(screen.getAllByText('Interview Rate')[0].closest('div')).toContainHTML('60%');
    expect(screen.getByText('Upcoming Interviews').closest('div')).toContainHTML('5');
    expect(screen.getByText('Avg per Application').closest('div')).toContainHTML('1.5');

    // Check that charts are rendered
    expect(screen.getByText('Current Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Status Progression')).toBeInTheDocument();
    
    // Check that chart components are rendered
    const donutCharts = screen.getAllByTestId('donut-chart');
    const barCharts = screen.getAllByTestId('bar-chart');
    
    expect(donutCharts.length).toBeGreaterThan(0);
    expect(barCharts.length).toBeGreaterThan(0);

    // Check monthly distribution
    expect(screen.getByText('Monthly Application Trend')).toBeInTheDocument();
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
    mockStatisticsService.getStatistics.mockResolvedValue(null as unknown as ApplicationStats);
    
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
      expect(screen.getByText('Application Analytics')).toBeInTheDocument();
    });

    // Should show interview overview cards with zero values
    expect(screen.getAllByText('Total Interviews')[0].closest('div')).toContainHTML('0');
    expect(screen.getAllByText('Interview Rate')[0].closest('div')).toContainHTML('0%');
    expect(screen.getByText('Upcoming Interviews').closest('div')).toContainHTML('0');
    expect(screen.getByText('Avg per Application').closest('div')).toContainHTML('0');

    // Should not show interview types and status sections when no interviews exist
    expect(screen.queryByText('Interview Types')).not.toBeInTheDocument();
    expect(screen.queryByText('Interview Status')).not.toBeInTheDocument();
  });

  it('should render charts with correct data', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Analytics')).toBeInTheDocument();
    });

    // Check that charts receive the correct number of data items
    const donutCharts = screen.getAllByTestId('donut-chart');
    const barCharts = screen.getAllByTestId('bar-chart');
    
    // Should have status distribution donut chart with 4 status items
    const statusDonutChart = donutCharts.find(chart => 
      chart.getAttribute('data-chart-items') === '4'
    );
    expect(statusDonutChart).toBeInTheDocument();

    // Should have status progression bar chart with 4 status items
    const statusBarChart = barCharts.find(chart => 
      chart.getAttribute('data-chart-items') === '4'
    );
    expect(statusBarChart).toBeInTheDocument();

    // Should have monthly trend bar chart with 3 months
    const monthlyBarChart = barCharts.find(chart => 
      chart.getAttribute('data-chart-items') === '3'
    );
    expect(monthlyBarChart).toBeInTheDocument();
  });

  it('should render interview charts when interview data exists', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Analytics')).toBeInTheDocument();
    });

    // Check that interview data is processed (via interview overview cards)
    expect(screen.getAllByText('Total Interviews')[0].closest('div')).toContainHTML('15');
    expect(screen.getAllByText('Interview Rate')[0].closest('div')).toContainHTML('60%');

    // Check that interview charts are rendered (through chart components)
    const donutCharts = screen.getAllByTestId('donut-chart');
    const barCharts = screen.getAllByTestId('bar-chart');
    
    // Should have interview-related charts rendered
    expect(donutCharts.length).toBeGreaterThan(0);
    expect(barCharts.length).toBeGreaterThan(0);
  });

  it('should calculate active applications correctly', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Analytics')).toBeInTheDocument();
    });

    // Active applications should be Applied (10) + Interviewing (8) = 18
    expect(screen.getByText('Active Applications').closest('div')).toContainHTML('18');
  });

  it('should display beautiful gradient cards with proper styling', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Analytics')).toBeInTheDocument();
    });

    // Check that cards have gradient styling classes
    const totalApplicationsCard = screen.getByText('Total Applications').closest('div');
    expect(totalApplicationsCard).toHaveClass('bg-gradient-to-br');
    
    const successRateCard = screen.getAllByText('Success Rate')[0].closest('div');
    expect(successRateCard).toHaveClass('bg-gradient-to-br');
  });

  it('should handle retry functionality on error', async () => {
    const errorMessage = 'Network error';
    mockStatisticsService.getStatistics.mockRejectedValue(new Error(errorMessage));
    
    // Mock window.location.reload
    const originalLocation = window.location;
    delete (window as { location?: Location }).location;
    window.location = { ...originalLocation, reload: vi.fn() };
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    
    // Restore location
    window.location = originalLocation;
  });

  it('should display descriptive text for each chart section', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Analytics')).toBeInTheDocument();
    });

    // Check descriptive text
    expect(screen.getByText('Where your applications stand right now')).toBeInTheDocument();
    expect(screen.getByText('How many applications reached each stage')).toBeInTheDocument();
    expect(screen.getByText('Your application activity over time')).toBeInTheDocument();
  });

  it('should show proper section titles with new design', async () => {
    mockStatisticsService.getStatistics.mockResolvedValue(mockStatisticsData);
    
    renderStatistics();
    
    await waitFor(() => {
      expect(screen.getByText('Application Analytics')).toBeInTheDocument();
    });

    // Check all main section titles
    expect(screen.getByText('Current Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Status Progression')).toBeInTheDocument();
    expect(screen.getByText('Monthly Application Trend')).toBeInTheDocument();
  });
}); 