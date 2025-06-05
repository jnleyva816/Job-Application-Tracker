import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../App'
import { ThemeProvider } from '../theme/ThemeContext'
import { authService } from '../services/authService'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the authService
vi.mock('../services/authService', () => ({
  authService: {
    isAuthenticated: vi.fn(),
  },
}))

// Mock all the page components to avoid complex dependencies
vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard Page</div>
}))

vi.mock('../pages/Applications', () => ({
  default: () => <div data-testid="applications">Applications Page</div>
}))

vi.mock('../pages/ApplicationDetail', () => ({
  default: () => <div data-testid="application-detail">Application Detail Page</div>
}))

vi.mock('../pages/Statistics', () => ({
  default: () => <div data-testid="statistics">Statistics Page</div>
}))

vi.mock('../pages/Profile', () => ({
  default: () => <div data-testid="profile">Profile Page</div>
}))

vi.mock('../pages/ProfileSetupPage', () => ({
  default: () => <div data-testid="profile-setup">Profile Setup Page</div>
}))

vi.mock('../components/Login', () => ({
  default: () => <div data-testid="login">Login Page</div>
}))

vi.mock('../components/Register', () => ({
  default: () => <div data-testid="register">Register Page</div>
}))

vi.mock('../components/AddApplicationForm', () => ({
  default: () => <div data-testid="add-application">Add Application Form</div>
}))

// Set up environment variable for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8080/api'
  },
  writable: true
})

const renderApp = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Routing for unauthenticated users', () => {
    beforeEach(() => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)
    })

    it('should redirect to login when accessing root path without authentication', () => {
      renderApp(['/'])
      expect(screen.getByTestId('login')).toBeInTheDocument()
    })

    it('should redirect to login when accessing dashboard without authentication', () => {
      renderApp(['/dashboard'])
      expect(screen.getByTestId('login')).toBeInTheDocument()
    })

    it('should redirect to login when accessing applications without authentication', () => {
      renderApp(['/applications'])
      expect(screen.getByTestId('login')).toBeInTheDocument()
    })

    it('should show login page when navigating to /login', () => {
      renderApp(['/login'])
      expect(screen.getByTestId('login')).toBeInTheDocument()
    })

    it('should show register page when navigating to /register', () => {
      renderApp(['/register'])
      expect(screen.getByTestId('register')).toBeInTheDocument()
    })

    it('should show profile setup page when navigating to /profile-setup', () => {
      renderApp(['/profile-setup'])
      expect(screen.getByTestId('profile-setup')).toBeInTheDocument()
    })
  })

  describe('Routing for authenticated users', () => {
    beforeEach(() => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
    })

    it('should redirect to dashboard when accessing root path with authentication', () => {
      renderApp(['/'])
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })

    it('should show dashboard when navigating to /dashboard', () => {
      renderApp(['/dashboard'])
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })

    it('should show applications page when navigating to /applications', () => {
      renderApp(['/applications'])
      expect(screen.getByTestId('applications')).toBeInTheDocument()
    })

    it('should show application detail page when navigating to /applications/:id', () => {
      renderApp(['/applications/123'])
      expect(screen.getByTestId('application-detail')).toBeInTheDocument()
    })

    it('should show statistics page when navigating to /statistics', () => {
      renderApp(['/statistics'])
      expect(screen.getByTestId('statistics')).toBeInTheDocument()
    })

    it('should show profile page when navigating to /profile', () => {
      renderApp(['/profile'])
      expect(screen.getByTestId('profile')).toBeInTheDocument()
    })

    it('should show add application form when navigating to /add-application', () => {
      renderApp(['/add-application'])
      expect(screen.getByTestId('add-application')).toBeInTheDocument()
    })
  })

  describe('Theme functionality', () => {
    beforeEach(() => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
    })

    it('should render theme toggle button', () => {
      renderApp(['/dashboard'])
      
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
      expect(themeToggle).toBeInTheDocument()
    })

    it('should toggle theme when theme button is clicked', () => {
      renderApp(['/dashboard'])
      
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
      
      // Initial state should show moon (indicating light mode)
      expect(themeToggle).toHaveTextContent('🌙')
      
      // Click to toggle to dark mode
      fireEvent.click(themeToggle)
      
      // Should now show sun (indicating dark mode)
      expect(themeToggle).toHaveTextContent('🌞')
      
      // Click again to toggle back to light mode
      fireEvent.click(themeToggle)
      
      // Should show moon again
      expect(themeToggle).toHaveTextContent('🌙')
    })
  })

  describe('Wildcard routes', () => {
    it('should redirect unknown routes to dashboard for authenticated users', () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(true)
      renderApp(['/unknown-route'])
      expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    })

    it('should redirect unknown routes to login for unauthenticated users', () => {
      vi.mocked(authService.isAuthenticated).mockReturnValue(false)
      renderApp(['/unknown-route'])
      expect(screen.getByTestId('login')).toBeInTheDocument()
    })
  })
}) 