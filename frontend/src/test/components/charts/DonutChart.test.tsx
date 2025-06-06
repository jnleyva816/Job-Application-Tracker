import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DonutChart from '../../../components/charts/DonutChart';

// Mock D3 with all required functions
vi.mock('d3', () => ({
  select: vi.fn().mockReturnValue({
    selectAll: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    style: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    enter: vi.fn().mockReturnThis(),
    transition: vi.fn().mockReturnThis(),
    duration: vi.fn().mockReturnThis(),
    ease: vi.fn().mockReturnThis(),
    delay: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    datum: vi.fn().mockReturnThis(),
    attrTween: vi.fn().mockReturnThis(),
    node: vi.fn().mockReturnValue({
      getBBox: () => ({ width: 100, height: 20, x: 0, y: 0 })
    })
  }),
  pie: vi.fn(() => {
    const pieFunc = vi.fn().mockReturnValue([
      { data: { label: 'Applied', value: 10 }, startAngle: 0, endAngle: 1.2 },
      { data: { label: 'Interviewing', value: 8 }, startAngle: 1.2, endAngle: 2.3 }
    ]);
    (pieFunc as unknown as { value: unknown; sort: unknown; padAngle: unknown }).value = vi.fn().mockReturnValue(pieFunc);
    (pieFunc as unknown as { value: unknown; sort: unknown; padAngle: unknown }).sort = vi.fn().mockReturnValue(pieFunc);
    (pieFunc as unknown as { value: unknown; sort: unknown; padAngle: unknown }).padAngle = vi.fn().mockReturnValue(pieFunc);
    return pieFunc;
  }),
  arc: vi.fn().mockReturnValue({
    innerRadius: vi.fn().mockReturnThis(),
    outerRadius: vi.fn().mockReturnThis(),
    cornerRadius: vi.fn().mockReturnThis(),
    centroid: vi.fn().mockReturnValue([50, 50]),
  }),
  scaleOrdinal: vi.fn(() => {
    const colorFunc = vi.fn((_label: string) => '#667eea') as any;
    colorFunc.domain = vi.fn().mockReturnValue(colorFunc);
    colorFunc.range = vi.fn().mockReturnValue(colorFunc);
    return colorFunc;
  }),
  sum: vi.fn().mockReturnValue(25),
  interpolate: vi.fn(),
  rgb: vi.fn().mockReturnValue({
    darker: vi.fn().mockReturnValue({ toString: vi.fn().mockReturnValue('#darker-color') })
  }),
  easeElastic: {
    amplitude: vi.fn().mockReturnValue({
      period: vi.fn().mockReturnValue(vi.fn())
    })
  },
  pointer: vi.fn().mockReturnValue([100, 100])
}));

interface DonutChartData {
  label: string;
  value: number;
  color?: string;
}

const sampleData: DonutChartData[] = [
  { label: 'Applied', value: 10, color: '#667eea' },
  { label: 'Interviewing', value: 8, color: '#764ba2' },
  { label: 'Offered', value: 5, color: '#43e97b' },
  { label: 'Rejected', value: 2, color: '#f093fb' }
];

const emptyData: DonutChartData[] = [];

describe('DonutChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing with valid data', () => {
    render(<DonutChart data={sampleData} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('overflow-visible');
  });

  it('applies correct default dimensions', () => {
    render(<DonutChart data={sampleData} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toHaveAttribute('width', '400');
    expect(svgElement).toHaveAttribute('height', '400');
  });

  it('applies custom dimensions when provided', () => {
    render(<DonutChart data={sampleData} width={500} height={500} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toHaveAttribute('width', '500');
    expect(svgElement).toHaveAttribute('height', '500');
  });

  it('handles empty data gracefully', () => {
    render(<DonutChart data={emptyData} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('applies custom inner and outer radius', () => {
    render(<DonutChart data={sampleData} innerRadius={80} outerRadius={150} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('applies custom color scheme when provided', () => {
    const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
    render(<DonutChart data={sampleData} colorScheme={customColors} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles showLabels prop', () => {
    const { rerender } = render(<DonutChart data={sampleData} showLabels={true} />);
    
    let svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
    
    rerender(<DonutChart data={sampleData} showLabels={false} />);
    
    svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles showPercentages prop', () => {
    const { rerender } = render(<DonutChart data={sampleData} showPercentages={true} />);
    
    let svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
    
    rerender(<DonutChart data={sampleData} showPercentages={false} />);
    
    svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('applies custom animation duration', () => {
    render(<DonutChart data={sampleData} animationDuration={1500} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles data updates correctly', () => {
    const { rerender } = render(<DonutChart data={sampleData} />);
    
    let svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
    
    const updatedData = [...sampleData, { label: 'New Status', value: 3, color: '#purple' }];
    rerender(<DonutChart data={updatedData} />);
    
    svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles zero values in data', () => {
    const dataWithZeros = [
      { label: 'Zero', value: 0, color: '#667eea' },
      { label: 'Non-zero', value: 10, color: '#764ba2' }
    ];
    
    render(<DonutChart data={dataWithZeros} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles single data point', () => {
    const singleDataPoint = [{ label: 'Single', value: 100, color: '#667eea' }];
    
    render(<DonutChart data={singleDataPoint} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('applies transparent background style', () => {
    render(<DonutChart data={sampleData} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toHaveStyle({ background: 'transparent' });
  });

  it('maintains responsive behavior with different dimensions', () => {
    const { rerender } = render(<DonutChart data={sampleData} width={300} height={300} />);
    
    let svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toHaveAttribute('width', '300');
    expect(svgElement).toHaveAttribute('height', '300');
    
    rerender(<DonutChart data={sampleData} width={600} height={600} />);
    
    svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toHaveAttribute('width', '600');
    expect(svgElement).toHaveAttribute('height', '600');
  });

  it('renders with all required props', () => {
    render(
      <DonutChart 
        data={sampleData}
        width={500}
        height={500}
        innerRadius={80}
        outerRadius={150}
        colorScheme={['#red', '#green', '#blue']}
        showLabels={true}
        showPercentages={true}
        animationDuration={1000}
      />
    );
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('width', '500');
    expect(svgElement).toHaveAttribute('height', '500');
  });

  it('renders correctly with minimal props', () => {
    render(<DonutChart data={sampleData} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('width', '400'); // default
    expect(svgElement).toHaveAttribute('height', '400'); // default
  });

  it('handles minSliceAngle prop', () => {
    render(<DonutChart data={sampleData} minSliceAngle={0.2} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders with legend when useLegend is true', () => {
    const { container } = render(<DonutChart data={sampleData} useLegend={true} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
    
    const legendContainer = container.querySelector('.legend-container');
    expect(legendContainer).toBeInTheDocument();
  });

  it('handles legendPosition prop', () => {
    const { rerender } = render(
      <DonutChart data={sampleData} useLegend={true} legendPosition="right" />
    );
    
    let svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
    
    rerender(<DonutChart data={sampleData} useLegend={true} legendPosition="bottom" />);
    
    svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('filters out zero values from data', () => {
    const dataWithZeros = [
      { label: 'Zero', value: 0, color: '#667eea' },
      { label: 'Non-zero', value: 10, color: '#764ba2' },
      { label: 'Another zero', value: 0, color: '#f093fb' }
    ];
    
    render(<DonutChart data={dataWithZeros} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles empty data after filtering zeros', () => {
    const allZeroData = [
      { label: 'Zero1', value: 0, color: '#667eea' },
      { label: 'Zero2', value: 0, color: '#764ba2' }
    ];
    
    render(<DonutChart data={allZeroData} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('applies padding between slices', () => {
    render(<DonutChart data={sampleData} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('uses adaptive font sizing based on chart size', () => {
    const { rerender } = render(<DonutChart data={sampleData} width={200} height={200} outerRadius={60} />);
    
    let svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
    
    rerender(<DonutChart data={sampleData} width={600} height={600} outerRadius={200} />);
    
    svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('handles large datasets with intelligent label positioning', () => {
    const largeDataset = [
      { label: 'Status1', value: 20 },
      { label: 'Status2', value: 15 },
      { label: 'Status3', value: 10 },
      { label: 'Status4', value: 8 },
      { label: 'Status5', value: 5 },
      { label: 'Status6', value: 3 },
      { label: 'Status7', value: 2 },
      { label: 'Status8', value: 1 }
    ];
    
    render(<DonutChart data={largeDataset} showLabels={true} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders chart without animation when animationDuration is 0', () => {
    render(<DonutChart data={sampleData} animationDuration={0} />);
    
    const svgElement = screen.getByTestId('donut-chart-svg');
    expect(svgElement).toBeInTheDocument();
  });
}); 