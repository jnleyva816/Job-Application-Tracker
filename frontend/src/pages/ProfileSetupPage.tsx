import { useNavigate } from 'react-router-dom';
import ProfileSetup from '../components/ProfileSetup';

function ProfileSetupPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to dashboard after profile completion
    navigate('/dashboard');
  };

  const handleSkip = () => {
    // Navigate to dashboard even if user skips profile setup
    navigate('/dashboard');
  };

  return (
    <ProfileSetup 
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}

export default ProfileSetupPage; 