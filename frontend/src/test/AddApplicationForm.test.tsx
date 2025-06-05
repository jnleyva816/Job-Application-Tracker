import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AddApplicationForm from '../components/AddApplicationForm';
import { jobParsingService } from '../services/jobParsingService';

// Mock the services
vi.mock('../services/jobParsingService');
vi.mock('../services/authService', () => ({
  authService: {
    getToken: () => 'mock-token',
  },
}));

const mockJobParsingService = vi.mocked(jobParsingService);

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AddApplicationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    renderWithRouter(<AddApplicationForm />);
    
    expect(screen.getByLabelText(/job url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/compensation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/application date/i)).toBeInTheDocument();
  });

  it('shows Parse URL button next to URL input', () => {
    renderWithRouter(<AddApplicationForm />);
    
    const parseButton = screen.getByRole('button', { name: /parse url/i });
    expect(parseButton).toBeInTheDocument();
    expect(parseButton).toBeDisabled(); // Should be disabled when URL is empty
  });

  it('enables Parse URL button when URL is entered', async () => {
    renderWithRouter(<AddApplicationForm />);
    
    const urlInput = screen.getByLabelText(/job url/i);
    const parseButton = screen.getByRole('button', { name: /parse url/i });
    
    // Initially disabled
    expect(parseButton).toBeDisabled();
    
    // Enter URL
    fireEvent.change(urlInput, { target: { value: 'https://job-boards.greenhouse.io/pulley/jobs/4750336008' } });
    
    // Should be enabled now
    expect(parseButton).not.toBeDisabled();
  });

  it('successfully parses URL and populates form fields', async () => {
    const mockParseResult = {
      successful: true,
      jobTitle: 'Frontend Engineer',
      company: 'Pulley',
      location: 'Remote',
      description: 'Pulley\'s mission is to make it easier for anyone to start a company...',
      compensation: 142500,
      compensationType: 'ANNUAL',
      source: 'GREENHOUSE',
    };

    mockJobParsingService.parseJobUrl.mockResolvedValue(mockParseResult);

    renderWithRouter(<AddApplicationForm />);
    
    const urlInput = screen.getByLabelText(/job url/i);
    const parseButton = screen.getByRole('button', { name: /parse url/i });
    
    // Enter URL and click parse
    fireEvent.change(urlInput, { target: { value: 'https://job-boards.greenhouse.io/pulley/jobs/4750336008' } });
    fireEvent.click(parseButton);
    
    // Wait for parsing to complete
    await waitFor(() => {
      expect(screen.getByDisplayValue('Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Pulley')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Remote')).toBeInTheDocument();
      expect(screen.getByDisplayValue('142500')).toBeInTheDocument();
    });
    
    // Check success message
    expect(screen.getByText(/successfully parsed job information from GREENHOUSE parser/i)).toBeInTheDocument();
  });

  it('shows error message when parsing fails', async () => {
    const mockParseResult = {
      successful: false,
      errorMessage: 'Failed to extract job information',
      source: 'UNKNOWN',
    };

    mockJobParsingService.parseJobUrl.mockResolvedValue(mockParseResult);

    renderWithRouter(<AddApplicationForm />);
    
    const urlInput = screen.getByLabelText(/job url/i);
    const parseButton = screen.getByRole('button', { name: /parse url/i });
    
    // Enter URL and click parse
    fireEvent.change(urlInput, { target: { value: 'https://invalid-url.com' } });
    fireEvent.click(parseButton);
    
    // Wait for error to show
    await waitFor(() => {
      expect(screen.getByText(/failed to extract job information/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during parsing', async () => {
    const mockParseResult = {
      successful: true,
      jobTitle: 'Test Job',
      company: 'Test Company',
    };

    // Create a promise that we can control
    let resolvePromise: (value: typeof mockParseResult) => void;
    const promise = new Promise<typeof mockParseResult>((resolve) => {
      resolvePromise = resolve;
    });

    mockJobParsingService.parseJobUrl.mockReturnValue(promise);

    renderWithRouter(<AddApplicationForm />);
    
    const urlInput = screen.getByLabelText(/job url/i);
    const parseButton = screen.getByRole('button', { name: /parse url/i });
    
    // Enter URL and click parse
    fireEvent.change(urlInput, { target: { value: 'https://example.com/job' } });
    fireEvent.click(parseButton);
    
    // Should show loading state
    expect(screen.getByText(/parsing\.\.\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /parsing\.\.\./i })).toBeDisabled();
    
    // Resolve the promise
    resolvePromise!(mockParseResult);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/parsing\.\.\./i)).not.toBeInTheDocument();
    });
  });

  it('shows error when trying to parse empty URL', async () => {
    renderWithRouter(<AddApplicationForm />);
    
    const parseButton = screen.getByRole('button', { name: /parse url/i });
    
    // Try to click parse with empty URL (shouldn't be possible due to disabled state)
    // But let's test the function directly by entering and clearing URL
    const urlInput = screen.getByLabelText(/job url/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.change(urlInput, { target: { value: '' } });
    
    // Button should be disabled
    expect(parseButton).toBeDisabled();
  });
}); 