import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Calendar from '../Calendar';

const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const mockApplications = [
  {
    id: '1',
    company: 'Test Company',
    jobTitle: 'Software Engineer',
    status: 'Applied' as const,
    applicationDate: new Date().toISOString().split('T')[0], // Today's date
    location: 'Remote',
    url: 'https://example.com',
    description: 'Test job',
    compensation: 100000
  }
];

const mockInterviews = [
  {
    id: 1,
    type: 'TECHNICAL_INTERVIEW',
    interviewDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    notes: 'Technical screening',
    status: 'SCHEDULED',
    applicationId: '1'
  }
];

describe('Calendar Component', () => {
  it('should render calendar with current month', () => {
    render(<Calendar applications={mockApplications} interviews={mockInterviews} />);
    
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  it('should display application indicators', () => {
    render(<Calendar applications={mockApplications} interviews={mockInterviews} />);
    
    // Should show application submitted legend
    expect(screen.getByText('Applications submitted')).toBeInTheDocument();
    
    // Should show interviews scheduled legend
    expect(screen.getByText('Interviews scheduled')).toBeInTheDocument();
  });

  it('should call onDateClick with correct parameters', () => {
    const mockOnDateClick = vi.fn();
    const today = new Date();
    render(
      <Calendar 
        applications={mockApplications} 
        interviews={mockInterviews}
        onDateClick={mockOnDateClick}
      />
    );
    
    // Click on today's date
    const todayButton = screen.getByText(today.getDate().toString());
    fireEvent.click(todayButton);
    
    expect(mockOnDateClick).toHaveBeenCalledWith(
      expect.any(Date),
      [mockApplications[0]], // Should have the application for today
      [] // No interviews for today
    );
  });

  it('should handle empty applications and interviews', () => {
    render(<Calendar applications={[]} interviews={[]} />);
    
    expect(screen.getByText('Applications submitted')).toBeInTheDocument();
    expect(screen.getByText('Interviews scheduled')).toBeInTheDocument();
  });

  it('should navigate between months', () => {
    render(<Calendar applications={mockApplications} interviews={mockInterviews} />);
    
    // Get the navigation buttons
    const buttons = screen.getAllByRole('button');
    const prevButton = buttons[0]; // First button is previous
    const nextButton = buttons[1]; // Second button is next
    
    fireEvent.click(nextButton);
    
    // Should show next month
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const nextMonth = nextMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    expect(screen.getByText(nextMonth)).toBeInTheDocument();
    
    fireEvent.click(prevButton);
    
    // Should go back to current month
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });
}); 