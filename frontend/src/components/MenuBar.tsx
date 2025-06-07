import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { profileService, ProfileResponse } from '../services/profileService';

function MenuBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load profile data to get user initials
    const loadProfile = async () => {
      try {
        const data = await profileService.getProfile();
        setProfileData(data);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };
    loadProfile();
  }, []);

  const getUserInitials = () => {
    if (!profileData) return 'U'; // Default fallback
    
    const firstName = profileData.profile?.firstName;
    const lastName = profileData.profile?.lastName;
    const username = profileData.username;
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (username) {
      return username.charAt(0).toUpperCase();
    }
    
    return 'U'; // Final fallback
  };

  const getProfilePicture = () => {
    return profileData?.profile?.profilePicture || null;
  };

  const handleLogout = async () => {
    console.log('Logout button clicked');
    
    try {
      const token = authService.getToken();
      if (!token) {
        console.error('No authentication token found');
        navigate('/login');
        return;
      }
      
      const logoutResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (logoutResponse.ok) {
        console.log('Logged out successfully');
        authService.logout(); // Use authService to clear the token
        navigate('/login');
      } else {
        console.error('Logout failed');
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during logout process:', error);
      alert('An error occurred during logout');
    }
  };

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Applications', href: '/applications' },
    { label: 'Statistics', href: '/statistics' },
    { label: 'Profile', href: '/profile' },
    { label: 'Logout', onClick: handleLogout },
  ];

  return (
    <nav className="bg-light-surface dark:bg-dark-surface shadow-sm border-b border-light-border dark:border-dark-border">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Menu */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary">JAT</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menuItems.filter(item => !item.onClick).map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.href);
                  }}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-light-text dark:text-dark-text hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
              {/* Dedicated logout button */}
              <button
                onClick={handleLogout}
                type="button"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-light-text dark:text-dark-text hover:text-primary transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-background dark:hover:bg-dark-background focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* User Profile */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative">
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center overflow-hidden">
                  {getProfilePicture() ? (
                    <img 
                      src={getProfilePicture()!} 
                      alt="Profile" 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-medium">{getUserInitials()}</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border">
            {menuItems.filter(item => !item.onClick).map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href);
                  setIsMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 text-base font-medium text-light-text dark:text-dark-text hover:text-primary hover:bg-light-background dark:hover:bg-dark-background"
              >
                {item.label}
              </a>
            ))}
            {/* Dedicated mobile logout button */}
            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-light-text dark:text-dark-text hover:text-primary hover:bg-light-background dark:hover:bg-dark-background"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default MenuBar; 