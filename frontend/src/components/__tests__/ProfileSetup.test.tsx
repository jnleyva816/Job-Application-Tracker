import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProfileSetup from '../ProfileSetup';
import { profileService } from '../../services/profileService';

// Mock the profile service
vi.mock('../../services/profileService', () => ({
  profileService: {
    completeProfile: vi.fn(),
    stringifySkills: vi.fn((skills) => JSON.stringify(skills)),
    stringifyJobTypes: vi.fn((jobTypes) => JSON.stringify(jobTypes)),
    stringifyPreferredLocations: vi.fn((locations) => JSON.stringify(locations)),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockOnComplete = vi.fn();
const mockOnSkip = vi.fn();

const renderProfileSetup = () => {
  return render(
    <BrowserRouter>
      <ProfileSetup onComplete={mockOnComplete} onSkip={mockOnSkip} />
    </BrowserRouter>
  );
};

describe('ProfileSetup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render profile setup form with all fields', () => {
    renderProfileSetup();

    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    expect(screen.getByText(/Help us personalize your job tracking experience/)).toBeInTheDocument();
    
    // Basic information
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    
    // Contact information
    expect(screen.getByLabelText('Current Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    
    // Skills section
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a skill (e.g., JavaScript, React, Python)')).toBeInTheDocument();
    
    // Job types section
    expect(screen.getByText('Preferred Job Types')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add job type (e.g., Full-time, Remote, Contract)')).toBeInTheDocument();
    
    // Preferred locations section
    expect(screen.getByText('Preferred Job Locations')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add preferred location (e.g., New York, Remote, Hybrid)')).toBeInTheDocument();
    
    // Salary range
    expect(screen.getByLabelText('Minimum Salary ($)')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum Salary ($)')).toBeInTheDocument();
    
    // Professional links
    expect(screen.getByText('Professional Links')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn URL')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Portfolio URL')).toBeInTheDocument();
    
    // Action buttons
    expect(screen.getByRole('button', { name: 'Complete Profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip for Now' })).toBeInTheDocument();
  });

  it('should update form fields when user types', async () => {
    const user = userEvent.setup();
    renderProfileSetup();

    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const bioTextarea = screen.getByLabelText('Bio');

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(bioTextarea, 'Software developer with 5 years experience');

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
    expect(bioTextarea).toHaveValue('Software developer with 5 years experience');
  });

  it('should add and remove skills', async () => {
    const user = userEvent.setup();
    renderProfileSetup();

    const skillInput = screen.getByPlaceholderText('Add a skill (e.g., JavaScript, React, Python)');
    const addButton = screen.getAllByRole('button', { name: 'Add' })[0];

    // Add a skill
    await user.type(skillInput, 'JavaScript');
    await user.click(addButton);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(skillInput).toHaveValue('');

    // Add another skill using Enter key
    await user.type(skillInput, 'React');
    await user.keyboard('{Enter}');

    expect(screen.getByText('React')).toBeInTheDocument();

    // Remove a skill
    const removeButtons = screen.getAllByText('×');
    await user.click(removeButtons[0]);

    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('should add and remove job types', async () => {
    const user = userEvent.setup();
    renderProfileSetup();

    const jobTypeInput = screen.getByPlaceholderText('Add job type (e.g., Full-time, Remote, Contract)');
    const addButton = screen.getAllByRole('button', { name: 'Add' })[1];

    // Add a job type
    await user.type(jobTypeInput, 'Full-time');
    await user.click(addButton);

    expect(screen.getByText('Full-time')).toBeInTheDocument();
    expect(jobTypeInput).toHaveValue('');
  });

  it('should add and remove preferred locations', async () => {
    const user = userEvent.setup();
    renderProfileSetup();

    const locationInput = screen.getByPlaceholderText('Add preferred location (e.g., New York, Remote, Hybrid)');
    const addButton = screen.getAllByRole('button', { name: 'Add' })[2];

    // Add a preferred location
    await user.type(locationInput, 'Remote');
    await user.click(addButton);

    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(locationInput).toHaveValue('');
  });

  it('should handle salary range inputs', async () => {
    const user = userEvent.setup();
    renderProfileSetup();

    const salaryMinInput = screen.getByLabelText('Minimum Salary ($)');
    const salaryMaxInput = screen.getByLabelText('Maximum Salary ($)');

    await user.type(salaryMinInput, '80000');
    await user.type(salaryMaxInput, '120000');

    expect(salaryMinInput).toHaveValue(80000);
    expect(salaryMaxInput).toHaveValue(120000);
  });

  it('should submit profile data successfully', async () => {
    const user = userEvent.setup();
    const mockCompleteProfile = vi.mocked(profileService.completeProfile);
    mockCompleteProfile.mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'ROLE_USER',
      profile: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
      },
    });

    renderProfileSetup();

    // Fill form
    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Bio'), 'Software developer');
    await user.type(screen.getByLabelText('Current Location'), 'San Francisco, CA');
    await user.type(screen.getByLabelText('Phone Number'), '(555) 123-4567');

    // Add skills
    const skillInput = screen.getByPlaceholderText('Add a skill (e.g., JavaScript, React, Python)');
    await user.type(skillInput, 'JavaScript');
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Complete Profile' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCompleteProfile).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Software developer',
        location: 'San Francisco, CA',
        phoneNumber: '(555) 123-4567',
        linkedinUrl: '',
        githubUrl: '',
        portfolioUrl: '',
        salaryMin: undefined,
        salaryMax: undefined,
        skills: '["JavaScript"]',
        jobTypes: undefined,
        preferredLocations: undefined,
      });
    });

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should handle form submission error', async () => {
    const user = userEvent.setup();
    const mockCompleteProfile = vi.mocked(profileService.completeProfile);
    mockCompleteProfile.mockRejectedValue(new Error('Server error'));

    renderProfileSetup();

    const submitButton = screen.getByRole('button', { name: 'Complete Profile' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('should call onSkip when skip button is clicked', async () => {
    const user = userEvent.setup();
    renderProfileSetup();

    const skipButton = screen.getByRole('button', { name: 'Skip for Now' });
    await user.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('should prevent duplicate skills, job types, and locations', async () => {
    const user = userEvent.setup();
    renderProfileSetup();

    const skillInput = screen.getByPlaceholderText('Add a skill (e.g., JavaScript, React, Python)');
    const addSkillButton = screen.getAllByRole('button', { name: 'Add' })[0];

    // Add the same skill twice
    await user.type(skillInput, 'JavaScript');
    await user.click(addSkillButton);
    
    await user.type(skillInput, 'JavaScript');
    await user.click(addSkillButton);

    // Should only appear once
    const skillElements = screen.getAllByText('JavaScript');
    expect(skillElements).toHaveLength(1);
  });

  it('should show loading state during form submission', async () => {
    const user = userEvent.setup();
    const mockCompleteProfile = vi.mocked(profileService.completeProfile);
    mockCompleteProfile.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderProfileSetup();

    const submitButton = screen.getByRole('button', { name: 'Complete Profile' });
    await user.click(submitButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should handle URL inputs correctly', async () => {
    const user = userEvent.setup();
    renderProfileSetup();

    const linkedinInput = screen.getByLabelText('LinkedIn URL');
    const githubInput = screen.getByLabelText('GitHub URL');
    const portfolioInput = screen.getByLabelText('Portfolio URL');

    await user.type(linkedinInput, 'https://linkedin.com/in/johndoe');
    await user.type(githubInput, 'https://github.com/johndoe');
    await user.type(portfolioInput, 'https://johndoe.dev');

    expect(linkedinInput).toHaveValue('https://linkedin.com/in/johndoe');
    expect(githubInput).toHaveValue('https://github.com/johndoe');
    expect(portfolioInput).toHaveValue('https://johndoe.dev');
  });
}); 