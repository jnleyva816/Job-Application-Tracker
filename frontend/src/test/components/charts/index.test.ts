import { describe, it, expect } from 'vitest';
import { BarChart, DonutChart } from '../../../components/charts';

describe('Chart Components Module', () => {
  it('should export BarChart component', () => {
    expect(BarChart).toBeDefined();
    expect(typeof BarChart).toBe('function');
  });

  it('should export DonutChart component', () => {
    expect(DonutChart).toBeDefined();
    expect(typeof DonutChart).toBe('function');
  });

  it('should have all required chart components available', () => {
    const exports = { BarChart, DonutChart };
    
    // Verify that all components are functions (React components)
    Object.values(exports).forEach(component => {
      expect(typeof component).toBe('function');
    });
    
    // Verify that we have the expected number of components
    expect(Object.keys(exports)).toHaveLength(2);
  });
}); 