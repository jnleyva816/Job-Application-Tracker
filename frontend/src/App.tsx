import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Statistics from './pages/Statistics';
import Profile from './pages/Profile';
import ProfileSetupPage from './pages/ProfileSetupPage';
import Login from './components/Login';
import Register from './components/Register';
import AddApplicationForm from './components/AddApplicationForm';
import { authService } from './services/authService';
import { ThemeProvider } from './theme/ThemeContext';
import { useTheme } from './theme/useTheme';
import './App.css';

// Theme Toggle Button component
const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 p-3 rounded-full bg-primary text-white shadow-lg hover:opacity-90 transition-all"
      aria-label="Toggle theme"
    >
      {isDarkMode ? '🌞' : '🌙'}
    </button>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

// Auth-aware root route component
const RootRoute = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text transition-colors duration-300">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <Applications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute>
                <ApplicationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-application"
            element={
              <ProtectedRoute>
                <AddApplicationForm />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<RootRoute />} />
          <Route path="*" element={<RootRoute />} />
        </Routes>
        <ThemeToggle />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
