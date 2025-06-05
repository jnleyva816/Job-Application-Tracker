import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProfileSetupPage from '../ProfileSetupPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the ProfileSetup component
vi.mock('../../components/ProfileSetup', () => ({
  default: ({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) => (
    <div>
      <div>Mock ProfileSetup Component</div>
      <button onClick={onComplete}>Complete Profile</button>
      <button onClick={onSkip}>Skip for Now</button>
    </div>
  ),
}));

const renderProfileSetupPage = () => {
  return render(
    <BrowserRouter>
      <ProfileSetupPage />
    </BrowserRouter>
  );
};

describe('ProfileSetupPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ProfileSetup component', () => {
    renderProfileSetupPage();
    
    expect(screen.getByText('Mock ProfileSetup Component')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Complete Profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Skip for Now' })).toBeInTheDocument();
  });

  it('should navigate to dashboard when profile is completed', async () => {
    const user = userEvent.setup();
    renderProfileSetupPage();

    const completeButton = screen.getByRole('button', { name: 'Complete Profile' });
    await user.click(completeButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should navigate to dashboard when profile setup is skipped', async () => {
    const user = userEvent.setup();
    renderProfileSetupPage();

    const skipButton = screen.getByRole('button', { name: 'Skip for Now' });
    await user.click(skipButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
}); 