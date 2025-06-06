import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BarChart from '../../../components/charts/BarChart';

// Mock d3 to avoid complex DOM manipulation in tests
vi.mock('d3', () => {
  const mockTransition = {
    duration: vi.fn().mockReturnThis(),
    ease: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    delay: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
  };

  const mockSelection = {
    selectAll: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    enter: vi.fn().mockReturnThis(),
    transition: vi.fn(() => mockTransition),
    on: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    node: vi.fn(() => ({ getBBox: () => ({ width: 50, height: 20, x: 0, y: 0 }) })),
  };

  return {
    select: vi.fn(() => mockSelection),
    scaleBand: vi.fn(() => ({
      domain: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      padding: vi.fn().mockReturnThis(),
      bandwidth: vi.fn().mockReturnValue(50),
    })),
    scaleLinear: vi.fn(() => ({
      domain: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    })),
    scaleOrdinal: vi.fn(() => ({
      domain: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    })),
    max: vi.fn(() => 100),
    axisBottom: vi.fn(() => ({
      tickSizeOuter: vi.fn().mockReturnThis(),
    })),
    axisLeft: vi.fn(() => ({
      tickSizeOuter: vi.fn().mockReturnThis(),
      ticks: vi.fn().mockReturnThis(),
    })),
    easeElasticOut: {
      amplitude: vi.fn(() => ({
        period: vi.fn().mockReturnThis(),
      })),
    },
  };
});

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

const mockData: BarChartData[] = [
  { label: 'Applied', value: 10, color: '#3b82f6' },
  { label: 'Interviewing', value: 5, color: '#f59e0b' },
  { label: 'Offered', value: 2, color: '#10b981' },
  { label: 'Rejected', value: 3, color: '#ef4444' },
];

const emptyData: BarChartData[] = [];

describe('BarChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing with valid data', () => {
    render(<BarChart data={mockData} />);
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('overflow-visible');
  });

  it('applies correct default dimensions', () => {
    render(<BarChart data={mockData} />);
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toHaveAttribute('width', '600');
    expect(svgElement).toHaveAttribute('height', '400');
  });

  it('applies custom dimensions when provided', () => {
    render(<BarChart data={mockData} width={800} height={500} />);
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toHaveAttribute('width', '800');
    expect(svgElement).toHaveAttribute('height', '500');
  });

  it('handles empty data gracefully', () => {
    render(<BarChart data={emptyData} />);
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('applies transparent background style', () => {
    render(<BarChart data={mockData} />);
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toHaveStyle({ background: 'transparent' });
  });

  it('renders with different color schemes', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
    render(<BarChart data={mockData} colorScheme={customColors} />);
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles showValues prop', () => {
    const { rerender } = render(<BarChart data={mockData} showValues={true} />);
    
    let svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
    
    rerender(<BarChart data={mockData} showValues={false} />);
    
    svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('applies custom margins', () => {
    const customMargin = { top: 30, right: 40, bottom: 50, left: 80 };
    render(<BarChart data={mockData} margin={customMargin} />);
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles data updates correctly', () => {
    const { rerender } = render(<BarChart data={mockData} />);
    
    let svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
    
    const updatedData = [...mockData, { label: 'New Status', value: 3, color: '#purple' }];
    rerender(<BarChart data={updatedData} />);
    
    svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('maintains responsive behavior with different widths', () => {
    const { rerender } = render(<BarChart data={mockData} width={400} />);
    
    let svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toHaveAttribute('width', '400');
    
    rerender(<BarChart data={mockData} width={1200} />);
    
    svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toHaveAttribute('width', '1200');
  });

  it('handles zero values in data', () => {
    const dataWithZeros = [
      { label: 'Zero', value: 0, color: '#667eea' },
      { label: 'Non-zero', value: 5, color: '#764ba2' }
    ];
    
    render(<BarChart data={dataWithZeros} />);
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles single data point', () => {
    const singleDataPoint = [{ label: 'Single', value: 42, color: '#667eea' }];
    
    render(<BarChart data={singleDataPoint} />);
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('applies custom animation duration', () => {
    render(<BarChart data={mockData} animationDuration={1000} />);
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders with all required props', () => {
    render(
      <BarChart 
        data={mockData}
        width={800}
        height={600}
        margin={{ top: 20, right: 30, bottom: 40, left: 50 }}
        colorScheme={['#red', '#green', '#blue']}
        showValues={true}
        animationDuration={500}
      />
    );
    
    const svgElement = screen.getByTestId('bar-chart-svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('width', '800');
    expect(svgElement).toHaveAttribute('height', '600');
  });
}); 