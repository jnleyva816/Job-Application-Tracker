import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Register from '../Register'
import { mockUsers, createMockUser } from '../../test/mocks/handlers'

// Mock the navigate function
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Set up environment variable
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8080/api'
  },
  writable: true
})

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  )
}

describe('Register Component', () => {
  beforeEach(() => {
    mockUsers.clear()
    mockNavigate.mockClear()
    localStorage.clear()
  })

  it('should render registration form', () => {
    renderRegister()

    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
  })

  it('should update form fields when user types', async () => {
    const user = userEvent.setup()
    renderRegister()

    const usernameInput = screen.getByLabelText('Username')
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const confirmPasswordInput = screen.getByLabelText('Confirm Password')

    await user.type(usernameInput, 'testuser')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    expect(usernameInput).toHaveValue('testuser')
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
    expect(confirmPasswordInput).toHaveValue('password123')
  })

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByLabelText('Username'), 'testuser')
    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'differentpassword')

    const submitButton = screen.getByRole('button', { name: 'Create account' })
    await user.click(submitButton)

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('should register user successfully and navigate to dashboard', async () => {
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByLabelText('Username'), 'testuser')
    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'correctpassword')
    await user.type(screen.getByLabelText('Confirm Password'), 'correctpassword')

    const submitButton = screen.getByRole('button', { name: 'Create account' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })

    // Check that user was created
    expect(mockUsers.size).toBe(1)
    // Check that token was stored
    expect(localStorage.getItem('token')).toBeTruthy()
  })

  it('should show error when registration fails with duplicate username', async () => {
    const user = userEvent.setup()
    
    // Create existing user
    const existingUser = createMockUser({
      username: 'testuser',
      email: 'existing@example.com'
    })
    mockUsers.set(existingUser.id, existingUser)

    renderRegister()

    await user.type(screen.getByLabelText('Username'), 'testuser')
    await user.type(screen.getByLabelText('Email address'), 'new@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Create account' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Username or email already exists')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should show error when registration fails with duplicate email', async () => {
    const user = userEvent.setup()
    
    // Create existing user
    const existingUser = createMockUser({
      username: 'existinguser',
      email: 'test@example.com'
    })
    mockUsers.set(existingUser.id, existingUser)

    renderRegister()

    await user.type(screen.getByLabelText('Username'), 'newuser')
    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm Password'), 'password123')

    const submitButton = screen.getByRole('button', { name: 'Create account' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Username or email already exists')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('should handle auto-login failure gracefully', async () => {
    const user = userEvent.setup()
    renderRegister()

    // Fill form with user that will register but fail auto-login (wrong password in mock)
    await user.type(screen.getByLabelText('Username'), 'testuser')
    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.type(screen.getByLabelText('Confirm Password'), 'wrongpassword')

    const submitButton = screen.getByRole('button', { name: 'Create account' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login?message=Registration successful! Please login.')
    })

    // User should be created even if auto-login fails
    expect(mockUsers.size).toBe(1)
  })

  it('should navigate to login page when sign in link is clicked', async () => {
    const user = userEvent.setup()
    renderRegister()

    const signInLink = screen.getByText('Sign in to your account')
    expect(signInLink).toHaveAttribute('href', '/login')
  })

  it('should require all fields to be filled', async () => {
    const user = userEvent.setup()
    renderRegister()

    const submitButton = screen.getByRole('button', { name: 'Create account' })
    
    // Try to submit empty form
    await user.click(submitButton)

    // Form should not submit (HTML5 validation will prevent it)
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(mockUsers.size).toBe(0)
  })
}) 