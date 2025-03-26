import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function MenuBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log('Logout button clicked');
    
    try {
      const token = authService.getToken();
      if (!token) {
        console.error('No authentication token found');
        navigate('/login');
        return;
      }
      
      const logoutResponse = await fetch(`${import.meta.env.VITE_DEV_API_URL}/users/logout`, {
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
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Applications', href: '/applications', icon: '📝' },
    { label: 'Statistics', href: '/statistics', icon: '📈' },
    { label: 'Profile', href: '/profile', icon: '👤' },
    { label: 'Logout', onClick: handleLogout, icon: '🚪' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Menu */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">JAT</span>
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
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </a>
              ))}
              {/* Dedicated logout button */}
              <button
                onClick={handleLogout}
                type="button"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">JD</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {menuItems.filter(item => !item.onClick).map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href);
                  setIsMenuOpen(false);
                }}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </a>
            ))}
            {/* Dedicated mobile logout button */}
            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            >
              <span className="mr-2">🚪</span>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default MenuBar; 