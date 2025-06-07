import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ApplicationFlowChart from '../../../components/charts/ApplicationFlowChart';

// Create a more comprehensive D3 mock that supports the chaining pattern
const createChainableMock = () => ({
  attr: vi.fn(() => createChainableMock()),
  style: vi.fn(() => createChainableMock()),
  text: vi.fn(() => createChainableMock()),
  transition: vi.fn(() => createChainableMock()),
  delay: vi.fn(() => createChainableMock()),
  duration: vi.fn(() => createChainableMock()),
  ease: vi.fn(() => createChainableMock()),
  on: vi.fn(() => createChainableMock()),
  append: vi.fn(() => createChainableMock()),
  selectAll: vi.fn(() => createChainableMock()),
  data: vi.fn(() => createChainableMock()),
  enter: vi.fn(() => createChainableMock()),
  remove: vi.fn(() => createChainableMock()),
  node: vi.fn(() => ({ getBBox: () => ({ width: 100, height: 20 }) }))
});

// Mock D3 with proper chaining support and easing functions
vi.mock('d3', () => ({
  select: vi.fn(() => createChainableMock()),
  easeSinInOut: vi.fn(),
  easeLinear: vi.fn(),
  easeCubicInOut: vi.fn(),
  easeQuadInOut: vi.fn()
}));

const mockStats = {
  total: 100,
  byStatus: {
    Applied: 10,
    Interviewing: 15,
    Offered: 5,
    Rejected: 70
  },
  currentStatusDistribution: {
    Applied: 10,
    Interviewing: 15,
    Offered: 5,
    Rejected: 70
  },
  successRate: 20,
  averageResponseTime: 7,
  interviewStats: {
    totalInterviews: 25,
    upcoming: 5,
    past: 20,
    conversionRate: 60,
    averagePerApplication: 1.5
  }
};

describe('ApplicationFlowChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the chart title and description', () => {
    render(<ApplicationFlowChart stats={mockStats} />);
    
    expect(screen.getByText('Application Flow Analysis')).toBeInTheDocument();
    expect(screen.getByText('Visual representation of your job application journey from submission to outcome')).toBeInTheDocument();
  });

  it('should render summary metrics', () => {
    render(<ApplicationFlowChart stats={mockStats} />);
    
    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByText('Currently Interviewing')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
  });

  it('should display correct metric values', () => {
    render(<ApplicationFlowChart stats={mockStats} />);
    
    expect(screen.getByText('100')).toBeInTheDocument(); // Total applications
    expect(screen.getByText('20%')).toBeInTheDocument(); // Success rate 
    expect(screen.getByText('7d')).toBeInTheDocument(); // Response time
  });

  it('should render with custom dimensions', () => {
    render(<ApplicationFlowChart stats={mockStats} width={600} height={300} />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '600');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('should handle empty or minimal data gracefully', () => {
    const minimalStats = {
      total: 0,
      byStatus: {
        Applied: 0,
        Interviewing: 0,
        Offered: 0,
        Rejected: 0
      },
      successRate: 0,
      averageResponseTime: 0
    };

    render(<ApplicationFlowChart stats={minimalStats} />);
    
    expect(screen.getByText('Application Flow Analysis')).toBeInTheDocument();
    expect(screen.getAllByText('0')[0]).toBeInTheDocument(); // Total applications (first one)
  });

  it('should render with default dimensions when not specified', () => {
    render(<ApplicationFlowChart stats={mockStats} />);
    
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '450');
  });

  it('should use currentStatusDistribution when available', () => {
    const statsWithCurrent = {
      ...mockStats,
      currentStatusDistribution: {
        Applied: 5,
        Interviewing: 10,
        Offered: 3,
        Rejected: 82
      }
    };

    render(<ApplicationFlowChart stats={statsWithCurrent} />);
    
    expect(screen.getByText('Application Flow Analysis')).toBeInTheDocument();
  });

  it('should fallback to byStatus when currentStatusDistribution is not available', () => {
    const statsWithoutCurrent = {
      total: 50,
      byStatus: {
        Applied: 5,
        Interviewing: 10,
        Offered: 5,
        Rejected: 30
      },
      successRate: 10,
      averageResponseTime: 5
    };

    render(<ApplicationFlowChart stats={statsWithoutCurrent} />);
    
    expect(screen.getByText('Application Flow Analysis')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });
}); 