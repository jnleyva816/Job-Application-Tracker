import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { authService } from '../authService'
import { 
  mockUsers, 
  validTokens, 
  generateToken, 
  createMockUser,
  type MockUser
} from '../../test/mocks/handlers'

// Set up environment variable for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8080/api'
  },
  writable: true
})

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Clear mock data
    mockUsers.clear()
    validTokens.clear()
    // Reset counters
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'securepassword'
      }

      const result = await authService.register(userData)

      expect(result).toEqual({
        id: expect.any(Number),
        username: 'testuser',
        email: 'test@example.com'
      })
      expect(mockUsers.size).toBe(1)
    })

    it('should fail to register user with duplicate username', async () => {
      // Create existing user
      const existingUser = createMockUser({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password'
      })
      mockUsers.set(existingUser.id, existingUser)

      const userData = {
        username: 'testuser',
        email: 'new@example.com',
        password: 'securepassword'
      }

      await expect(authService.register(userData)).rejects.toThrow('Username or email already exists')
    })

    it('should fail to register user with duplicate email', async () => {
      // Create existing user
      const existingUser = createMockUser({
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password'
      })
      mockUsers.set(existingUser.id, existingUser)

      const userData = {
        username: 'newuser',
        email: 'test@example.com',
        password: 'securepassword'
      }

      await expect(authService.register(userData)).rejects.toThrow('Username or email already exists')
    })
  })

  describe('User Login', () => {
    beforeEach(() => {
      // Create a test user
      const user = createMockUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      })
      mockUsers.set(user.id, user)
    })

    it('should login user with correct credentials', async () => {
      const credentials = {
        username: 'testuser',
        password: 'correctpassword'
      }

      const result = await authService.login(credentials)

      expect(result).toEqual({
        token: expect.any(String),
        user: {
          id: expect.any(Number),
          username: 'testuser',
          email: 'test@example.com'
        }
      })
      expect(localStorage.getItem('token')).toBe(result.token)
      expect(validTokens.has(result.token)).toBe(true)
    })

    it('should fail to login with incorrect password', async () => {
      const credentials = {
        username: 'testuser',
        password: 'wrongpassword'
      }

      await expect(authService.login(credentials)).rejects.toThrow('Invalid username or password')
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('should fail to login with non-existent user', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'password'
      }

      await expect(authService.login(credentials)).rejects.toThrow('Invalid username or password')
      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('User Logout', () => {
    it('should clear token from localStorage', () => {
      // Set a token first
      localStorage.setItem('token', 'some-token')
      expect(localStorage.getItem('token')).toBe('some-token')

      authService.logout()

      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('Authentication Status', () => {
    it('should return true when user is authenticated', () => {
      localStorage.setItem('token', 'some-token')
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should return false when user is not authenticated', () => {
      expect(authService.isAuthenticated()).toBe(false)
    })

    it('should return token when it exists', () => {
      localStorage.setItem('token', 'test-token')
      expect(authService.getToken()).toBe('test-token')
    })

    it('should return null when token does not exist', () => {
      expect(authService.getToken()).toBeNull()
    })
  })

  describe('Get Current User', () => {
    let testUser: MockUser
    let token: string

    beforeEach(() => {
      testUser = createMockUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      })
      mockUsers.set(testUser.id, testUser)
      token = generateToken('testuser')
      localStorage.setItem('token', token)
    })

    it('should get current user profile successfully', async () => {
      const result = await authService.getCurrentUser()

      expect(result).toEqual(testUser)
    })

    it('should fail to get current user without token', async () => {
      localStorage.removeItem('token')

      await expect(authService.getCurrentUser()).rejects.toThrow('No authentication token found')
    })

    it('should fail to get current user with invalid token', async () => {
      localStorage.setItem('token', 'invalid-token')

      await expect(authService.getCurrentUser()).rejects.toThrow('Authentication required')
    })
  })

  describe('Update Current User', () => {
    let testUser: MockUser
    let token: string

    beforeEach(() => {
      testUser = createMockUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User'
      })
      mockUsers.set(testUser.id, testUser)
      token = generateToken('testuser')
      localStorage.setItem('token', token)
    })

    it('should update current user profile successfully', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User'
      }

      const result = await authService.updateCurrentUser(updateData)

      expect(result.username).toBe('updateduser')
      expect(result.email).toBe('updated@example.com')
      expect(result.firstName).toBe('Updated')
      expect(result.lastName).toBe('User')
    })

    it('should fail to update user without token', async () => {
      localStorage.removeItem('token')

      const updateData = { username: 'updateduser' }

      await expect(authService.updateCurrentUser(updateData)).rejects.toThrow('No authentication token found')
    })

    it('should fail to update user with duplicate username', async () => {
      // Create another user
      const otherUser = createMockUser({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password'
      })
      mockUsers.set(otherUser.id, otherUser)

      const updateData = { username: 'otheruser' }

      await expect(authService.updateCurrentUser(updateData)).rejects.toThrow('Username already exists')
    })

    it('should fail to update user with duplicate email', async () => {
      // Create another user
      const otherUser = createMockUser({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password'
      })
      mockUsers.set(otherUser.id, otherUser)

      const updateData = { email: 'other@example.com' }

      await expect(authService.updateCurrentUser(updateData)).rejects.toThrow('Email already exists')
    })
  })

  describe('Update User by ID', () => {
    let testUser: MockUser
    let token: string

    beforeEach(() => {
      testUser = createMockUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      })
      mockUsers.set(testUser.id, testUser)
      token = generateToken('testuser')
      localStorage.setItem('token', token)
    })

    it('should update user by ID successfully', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      }

      const result = await authService.updateUser(testUser.id, updateData)

      expect(result.username).toBe('updateduser')
      expect(result.email).toBe('updated@example.com')
    })

    it('should fail to update user without token', async () => {
      localStorage.removeItem('token')

      const updateData = { username: 'updateduser' }

      await expect(authService.updateUser(testUser.id, updateData)).rejects.toThrow('No authentication token found')
    })

    it('should fail to update non-existent user', async () => {
      await expect(authService.updateUser(999, { username: 'test' })).rejects.toThrow('User not found')
    })

    it('should fail to update other user without admin role', async () => {
      // Create another user
      const otherUser = createMockUser({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password'
      })
      mockUsers.set(otherUser.id, otherUser)

      const updateData = { username: 'hackeduser' }

      await expect(authService.updateUser(otherUser.id, updateData)).rejects.toThrow('You don\'t have permission to access this resource')
    })
  })

  describe('Delete User', () => {
    let testUser: MockUser
    let token: string

    beforeEach(() => {
      testUser = createMockUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      })
      mockUsers.set(testUser.id, testUser)
      token = generateToken('testuser')
      localStorage.setItem('token', token)
    })

    it('should delete user successfully', async () => {
      expect(mockUsers.has(testUser.id)).toBe(true)

      await authService.deleteUser(testUser.id)

      expect(mockUsers.has(testUser.id)).toBe(false)
    })

    it('should fail to delete user without token', async () => {
      localStorage.removeItem('token')

      await expect(authService.deleteUser(testUser.id)).rejects.toThrow('No authentication token found')
    })

    it('should fail to delete non-existent user', async () => {
      await expect(authService.deleteUser(999)).rejects.toThrow('User not found')
    })

    it('should fail to delete other user without admin role', async () => {
      // Create another user
      const otherUser = createMockUser({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password'
      })
      mockUsers.set(otherUser.id, otherUser)

      await expect(authService.deleteUser(otherUser.id)).rejects.toThrow('You don\'t have permission to access this resource')
    })
  })

  describe('Get User by ID', () => {
    let testUser: MockUser
    let token: string

    beforeEach(() => {
      testUser = createMockUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      })
      mockUsers.set(testUser.id, testUser)
      token = generateToken('testuser')
      localStorage.setItem('token', token)
    })

    it('should get user by ID successfully', async () => {
      const result = await authService.getUserById(testUser.id)

      expect(result).toEqual(testUser)
    })

    it('should fail to get user without token', async () => {
      localStorage.removeItem('token')

      await expect(authService.getUserById(testUser.id)).rejects.toThrow('No authentication token found')
    })

    it('should fail to get non-existent user', async () => {
      await expect(authService.getUserById(999)).rejects.toThrow('User not found')
    })

    it('should fail to get other user without admin role', async () => {
      // Create another user
      const otherUser = createMockUser({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password'
      })
      mockUsers.set(otherUser.id, otherUser)

      await expect(authService.getUserById(otherUser.id)).rejects.toThrow('You don\'t have permission to access this resource')
    })
  })
}) 