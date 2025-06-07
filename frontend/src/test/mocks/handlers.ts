import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:8080/api'

// Type definitions
interface MockUserProfile {
  id?: number
  firstName?: string
  lastName?: string
  bio?: string
  location?: string
  skills?: string
  jobTypes?: string
  preferredLocations?: string
  salaryMin?: number
  salaryMax?: number
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  phoneNumber?: string
  createdAt?: string
  updatedAt?: string
}

interface MockUser {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
  accountLocked: boolean
  failedLoginAttempts: number
  lastLogin: string
  createdAt: string
  updatedAt: string
  password: null
  profile?: MockUserProfile
}

interface MockApplication {
  id: number
  company: string
  jobTitle: string
  status: string
  applicationDate: string
  location?: string
  url?: string
  description?: string
  compensation?: string
  userId: number
  createdAt: string
  updatedAt: string
}

interface UserRegistrationData {
  username: string
  email: string
  password?: string
  firstName?: string
  lastName?: string
  role?: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface ApplicationData {
  id?: number
  company: string
  jobTitle: string
  status: string
  applicationDate: string
  location?: string
  url?: string
  description?: string
  compensation?: string
}

interface ProfileUpdateRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  bio?: string
  location?: string
  skills?: string
  jobTypes?: string
  preferredLocations?: string
  salaryMin?: number
  salaryMax?: number
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  phoneNumber?: string
}

// Mock data
const mockUsers = new Map<number, MockUser>()
let userIdCounter = 1
const mockApplications = new Map<number, MockApplication>()
let applicationIdCounter = 1

// Mock tokens
const validTokens = new Set<string>()

// Add common test tokens used in tests
validTokens.add('mock-auth-token')
validTokens.add('mock-token')
validTokens.add('test-token')
validTokens.add('mock-jwt-token')

// Map test tokens to usernames for getUserFromToken
const tokenToUsername = new Map<string, string>()
tokenToUsername.set('mock-auth-token', 'testuser')
tokenToUsername.set('mock-token', 'testuser')
tokenToUsername.set('test-token', 'testuser')
tokenToUsername.set('mock-jwt-token', 'testuser')

// Helper function to generate mock user
const createMockUser = (userData: UserRegistrationData): MockUser => ({
  id: userIdCounter++,
  username: userData.username,
  email: userData.email,
  firstName: userData.firstName || '',
  lastName: userData.lastName || '',
  role: userData.role || 'ROLE_USER',
  accountLocked: false,
  failedLoginAttempts: 0,
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  password: null, // Password is never returned
  profile: {
    id: userIdCounter,
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
})

// Helper function to generate mock application
const createMockApplication = (applicationData: ApplicationData, userId: number): MockApplication => ({
  id: applicationData.id || applicationIdCounter++,
  company: applicationData.company,
  jobTitle: applicationData.jobTitle,
  status: applicationData.status,
  applicationDate: applicationData.applicationDate,
  location: applicationData.location,
  url: applicationData.url,
  description: applicationData.description,
  compensation: applicationData.compensation,
  userId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Helper function to generate JWT token
const generateToken = (username: string) => {
  const token = `mock-jwt-token-${username}-${Date.now()}`
  validTokens.add(token)
  return token
}

// Helper function to validate token
const validateToken = (authorization: string | null) => {
  if (!authorization || !authorization.startsWith('Bearer ')) return null
  const token = authorization.replace('Bearer ', '')
  return validTokens.has(token) ? token : null
}

// Helper function to get user from token
const getUserFromToken = (token: string): MockUser | undefined => {
  // Check if it's a test token first
  const testUsername = tokenToUsername.get(token)
  if (testUsername) {
    // Return a hardcoded test user for test tokens
    return {
      id: 999,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'ROLE_USER',
      accountLocked: false,
      failedLoginAttempts: 0,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      password: null,
      profile: {
        id: 999,
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  }
  
  // For generated tokens, extract username from token format
  const username = token.split('-')[3] // Extract username from mock token
  return Array.from(mockUsers.values()).find((user: MockUser) => user.username === username)
}

export const handlers = [
  // Register user
  http.post(`${API_URL}/users/register`, async ({ request }) => {
    const userData = await request.json() as UserRegistrationData
    
    // Check if username already exists
    const existingUser = Array.from(mockUsers.values()).find((user: MockUser) => 
      user.username === userData.username || user.email === userData.email
    )
    
    if (existingUser) {
      return HttpResponse.json(
        { message: 'Username or email already exists' },
        { status: 400 }
      )
    }
    
    const newUser = createMockUser(userData)
    mockUsers.set(newUser.id, newUser)
    
    return HttpResponse.json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    }, { status: 201 })
  }),

  // Login user
  http.post(`${API_URL}/users/login`, async ({ request }) => {
    const credentials = await request.json() as LoginCredentials
    
    const user = Array.from(mockUsers.values()).find((user: MockUser) => 
      user.username === credentials.username
    )
    
    if (!user) {
      return HttpResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // For testing purposes, we'll accept any password that's not "wrongpassword"
    // In real tests, the password validation should be more sophisticated
    if (credentials.password === 'wrongpassword') {
      return HttpResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    const token = generateToken(user.username)
    
    return HttpResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    })
  }),

  // Get all applications
  http.get(`${API_URL}/applications`, ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Return applications for the user (admin can see all)
    const applications = Array.from(mockApplications.values()).filter((app: MockApplication) => 
      user.role === 'ROLE_ADMIN' || app.userId === user.id
    )
    
    return HttpResponse.json(applications.map(app => ({
      ...app,
      id: app.id.toString() // Convert to string for frontend compatibility
    })))
  }),

  // Get application by ID
  http.get(`${API_URL}/applications/:id`, ({ params, request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const applicationId = parseInt(params.id as string)
    const application = mockApplications.get(applicationId)
    
    if (!application) {
      return HttpResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Check ownership or admin role
    if (application.userId !== user.id && user.role !== 'ROLE_ADMIN') {
      return HttpResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      )
    }
    
    return HttpResponse.json({
      ...application,
      id: application.id.toString() // Convert to string for frontend compatibility
    })
  }),

  // Create application
  http.post(`${API_URL}/applications`, async ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const applicationData = await request.json() as ApplicationData
    const newApplication = createMockApplication(applicationData, user.id)
    mockApplications.set(newApplication.id, newApplication)
    
    return HttpResponse.json({
      ...newApplication,
      id: newApplication.id.toString() // Convert to string for frontend compatibility
    }, { status: 201 })
  }),

  // Update application
  http.put(`${API_URL}/applications/:id`, async ({ params, request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const applicationId = parseInt(params.id as string)
    const existingApplication = mockApplications.get(applicationId)
    
    if (!existingApplication) {
      return HttpResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Check ownership or admin role
    if (existingApplication.userId !== user.id && user.role !== 'ROLE_ADMIN') {
      return HttpResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const updateData = await request.json() as Partial<ApplicationData>
    const updatedApplication = {
      ...existingApplication,
      ...updateData,
      id: applicationId,
      userId: existingApplication.userId,
      updatedAt: new Date().toISOString()
    }
    
    mockApplications.set(applicationId, updatedApplication)
    
    return HttpResponse.json({
      ...updatedApplication,
      id: updatedApplication.id.toString() // Convert to string for frontend compatibility
    })
  }),

  // Delete application
  http.delete(`${API_URL}/applications/:id`, ({ params, request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const applicationId = parseInt(params.id as string)
    const application = mockApplications.get(applicationId)
    
    if (!application) {
      return HttpResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Check ownership or admin role
    if (application.userId !== user.id && user.role !== 'ROLE_ADMIN') {
      return HttpResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      )
    }
    
    mockApplications.delete(applicationId)
    
    return HttpResponse.json({ message: 'Application deleted successfully' })
  }),

  // Get statistics
  http.get(`${API_URL}/statistics`, ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Return mock statistics
    return HttpResponse.json({
      total: 10,
      byStatus: {
        Applied: 4,
        Interviewing: 3,
        Offered: 2,
        Rejected: 1
      },
      byMonth: {
        'Jan 2024': 3,
        'Feb 2024': 4,
        'Mar 2024': 3
      },
      successRate: 20.0,
      averageResponseTime: 14,
      interviewStats: {
        totalInterviews: 8,
        upcoming: 2,
        past: 6,
        today: 0,
        byType: {
          Technical: 3,
          HR: 2,
          Final: 3
        },
        byStatus: {
          SCHEDULED: 2,
          COMPLETED: 6
        },
        byMonth: {
          'Jan 2024': 2,
          'Feb 2024': 3,
          'Mar 2024': 3
        },
        conversionRate: 40.0,
        averagePerApplication: 0.8
      }
    })
  }),

  // Error endpoint for testing
  http.get(`${API_URL}/statistics/error`, () => {
    return HttpResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }),

  // Get interviews
  http.get(`${API_URL}/interviews`, ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    // Return mock interviews
    return HttpResponse.json([
      {
        id: 1,
        type: 'TECHNICAL_INTERVIEW',
        interviewDate: '2024-01-15T10:00:00Z',
        notes: 'Technical round',
        status: 'SCHEDULED',
        interviewerName: 'John Doe',
        interviewerEmail: 'john@company.com',
        location: 'Office',
        durationMinutes: 60,
        meetingLink: 'https://zoom.us/meeting1',
        applicationId: 1
      },
      {
        id: 2,
        type: 'HR_INTERVIEW',
        interviewDate: '2024-01-20T14:00:00Z',
        notes: 'Culture fit discussion',
        status: 'COMPLETED',
        interviewerName: 'Jane Smith',
        interviewerEmail: 'jane@company.com',
        location: 'Remote',
        durationMinutes: 30,
        meetingLink: 'https://zoom.us/meeting2',
        applicationId: 2
      }
    ])
  }),

  // Create interview
  http.post(`${API_URL}/interviews`, async ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const interviewData = await request.json() as Record<string, unknown>
    
    const newInterview = {
      id: Date.now(), // Simple ID generation
      ...interviewData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return HttpResponse.json(newInterview, { status: 201 })
  }),

  // Update interview
  http.put(`${API_URL}/interviews/:id`, async ({ params, request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const interviewId = params.id as string
    const updateData = await request.json() as Record<string, unknown>
    
    const updatedInterview = {
      id: parseInt(interviewId),
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    return HttpResponse.json(updatedInterview)
  }),

  // Delete interview
  http.delete(`${API_URL}/interviews/:id`, ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({ message: 'Interview deleted successfully' })
  }),

  // Get current user profile
  http.get(`${API_URL}/profile`, ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    if (!token) {
      return HttpResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    return HttpResponse.json(user)
  }),

  // Update current user profile
  http.put(`${API_URL}/profile`, async ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    if (!token) {
      return HttpResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    const updateData = await request.json() as ProfileUpdateRequest
    
    // Check for duplicate username/email if being updated
    if (updateData.username && updateData.username !== user.username) {
      const existingUser = Array.from(mockUsers.values()).find((u: MockUser) => 
        u.username === updateData.username && u.id !== user.id
      )
      if (existingUser) {
        return HttpResponse.json({ message: 'Username already exists' }, { status: 400 })
      }
    }
    
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = Array.from(mockUsers.values()).find((u: MockUser) => 
        u.email === updateData.email && u.id !== user.id
      )
      if (existingUser) {
        return HttpResponse.json({ message: 'Email already exists' }, { status: 400 })
      }
    }
    
    // Update user
    const updatedUser = {
      ...user,
      ...updateData,
      profile: {
        ...user.profile,
        ...updateData,
        updatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    }
    
    mockUsers.set(user.id, updatedUser)
    return HttpResponse.json(updatedUser)
  }),

  // Complete user profile
  http.post(`${API_URL}/profile/complete`, async ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const profileData = await request.json() as ProfileUpdateRequest
    
    // Complete profile data
    const completedProfile = {
      ...user.profile,
      ...profileData,
      id: user.profile?.id || user.id,
      updatedAt: new Date().toISOString(),
    }
    
    user.profile = completedProfile
    user.updatedAt = new Date().toISOString()
    
    mockUsers.set(user.id, user)
    
    return HttpResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile
    })
  }),

  // Get user by ID
  http.get(`${API_URL}/users/:id`, ({ request, params }) => {
    const token = validateToken(request.headers.get('Authorization'))
    if (!token) {
      return HttpResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    
    const currentUser = getUserFromToken(token)
    if (!currentUser) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    const userId = parseInt(params.id as string)
    const targetUser = mockUsers.get(userId)
    
    if (!targetUser) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    // Only allow users to access their own profile or admin users to access any profile
    if (currentUser.id !== userId && currentUser.role !== 'ROLE_ADMIN') {
      return HttpResponse.json({ message: 'You don\'t have permission to access this resource' }, { status: 403 })
    }
    
    return HttpResponse.json(targetUser)
  }),

  // Update user by ID
  http.put(`${API_URL}/users/:id`, async ({ request, params }) => {
    const token = validateToken(request.headers.get('Authorization'))
    if (!token) {
      return HttpResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    
    const currentUser = getUserFromToken(token)
    if (!currentUser) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    const userId = parseInt(params.id as string)
    const targetUser = mockUsers.get(userId)
    
    if (!targetUser) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    // Only allow users to update their own profile or admin users to update any profile
    if (currentUser.id !== userId && currentUser.role !== 'ROLE_ADMIN') {
      return HttpResponse.json({ message: 'You don\'t have permission to modify this resource' }, { status: 403 })
    }
    
    const updateData = await request.json() as ProfileUpdateRequest
    
    // Check for duplicate username/email if being updated
    if (updateData.username && updateData.username !== targetUser.username) {
      const existingUser = Array.from(mockUsers.values()).find((u: MockUser) => 
        u.username === updateData.username && u.id !== userId
      )
      if (existingUser) {
        return HttpResponse.json({ message: 'Username already exists' }, { status: 400 })
      }
    }
    
    if (updateData.email && updateData.email !== targetUser.email) {
      const existingUser = Array.from(mockUsers.values()).find((u: MockUser) => 
        u.email === updateData.email && u.id !== userId
      )
      if (existingUser) {
        return HttpResponse.json({ message: 'Email already exists' }, { status: 400 })
      }
    }
    
    // Update user
    const updatedUser = {
      ...targetUser,
      ...updateData,
      profile: {
        ...targetUser.profile,
        ...updateData,
        updatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    }
    
    mockUsers.set(userId, updatedUser)
    return HttpResponse.json(updatedUser)
  }),

  // Delete user by ID
  http.delete(`${API_URL}/users/:id`, ({ request, params }) => {
    const token = validateToken(request.headers.get('Authorization'))
    if (!token) {
      return HttpResponse.json({ message: 'Authentication required' }, { status: 401 })
    }
    
    const currentUser = getUserFromToken(token)
    if (!currentUser) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    const userId = parseInt(params.id as string)
    const targetUser = mockUsers.get(userId)
    
    if (!targetUser) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    // Only allow admin users to delete users
    if (currentUser.role !== 'ROLE_ADMIN') {
      return HttpResponse.json({ message: 'You don\'t have permission to delete users' }, { status: 403 })
    }
    
    mockUsers.delete(userId)
    return HttpResponse.json({ message: 'User deleted successfully' })
  }),

  // Get interview types
  http.get(`${API_URL}/interview-options/types`, ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json([
      { value: 'TECHNICAL_INTERVIEW', label: 'Technical Interview' },
      { value: 'HR_INTERVIEW', label: 'HR Interview' },
      { value: 'BEHAVIORAL_INTERVIEW', label: 'Behavioral Interview' }
    ])
  }),

  // Get interview statuses
  http.get(`${API_URL}/interview-options/statuses`, ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json([
      { value: 'SCHEDULED', label: 'Scheduled' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'CANCELLED', label: 'Cancelled' }
    ])
  }),

  // Get interviews by application ID
  http.get(`${API_URL}/applications/:applicationId/interviews`, ({ request, params }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const applicationId = parseInt(params.applicationId as string)
    
    // Return mock interviews for the application
    return HttpResponse.json([
      {
        id: 1,
        type: 'TECHNICAL_INTERVIEW',
        interviewDate: '2024-01-15T10:00:00Z',
        notes: 'Technical round',
        status: 'SCHEDULED',
        interviewerName: 'John Doe',
        interviewerEmail: 'john@company.com',
        location: 'Office',
        durationMinutes: 60,
        meetingLink: 'https://zoom.us/meeting1',
        applicationId: applicationId
      },
      {
        id: 2,
        type: 'HR_INTERVIEW',
        interviewDate: '2024-01-20T14:00:00Z',
        notes: 'Culture fit discussion',
        status: 'COMPLETED',
        interviewerName: 'Jane Smith',
        interviewerEmail: 'jane@company.com',
        location: 'Remote',
        durationMinutes: 30,
        meetingLink: 'https://zoom.us/meeting2',
        applicationId: applicationId
      }
    ])
  }),

  // Create interview for application
  http.post(`${API_URL}/applications/:applicationId/interviews`, async ({ request, params }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const applicationId = parseInt(params.applicationId as string)
    const interviewData = await request.json() as Record<string, unknown>
    
    const newInterview = {
      id: Date.now(),
      ...interviewData,
      applicationId
    }
    
    return HttpResponse.json(newInterview, { status: 201 })
  }),

  // Update interview for application
  http.put(`${API_URL}/applications/:applicationId/interviews/:interviewId`, async ({ request, params }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const interviewId = parseInt(params.interviewId as string)
    const updateData = await request.json() as Record<string, unknown>
    
    const updatedInterview = {
      id: interviewId,
      ...updateData
    }
    
    return HttpResponse.json(updatedInterview)
  }),

  // Delete interview for application
  http.delete(`${API_URL}/applications/:applicationId/interviews/:interviewId`, ({ request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({ message: 'Interview deleted successfully' })
  }),

  // Reschedule interview
  http.put(`${API_URL}/applications/:applicationId/interviews/:interviewId/reschedule`, async ({ request, params }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const interviewId = parseInt(params.interviewId as string)
    const rescheduleData = await request.json() as { newDate: string; reason: string }
    
    const updatedInterview = {
      id: interviewId,
      status: 'RESCHEDULED',
      interviewDate: rescheduleData.newDate,
      originalDate: '2024-01-15T10:00:00',
      notes: `Rescheduled: ${rescheduleData.reason}`
    }
    
    return HttpResponse.json(updatedInterview)
  }),

  // Cancel interview
  http.put(`${API_URL}/applications/:applicationId/interviews/:interviewId/cancel`, async ({ request, params }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const interviewId = parseInt(params.interviewId as string)
    const cancelReason = await request.text() // The service sends just a string, not JSON
    
    const updatedInterview = {
      id: interviewId,
      status: 'CANCELLED',
      cancellationReason: cancelReason
    }
    
    return HttpResponse.json(updatedInterview)
  }),

  // Complete interview
  http.put(`${API_URL}/applications/:applicationId/interviews/:interviewId/complete`, async ({ request, params }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const user = getUserFromToken(token)
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const interviewId = parseInt(params.interviewId as string)
    const completeData = await request.json() as { feedback?: string }
    
    const updatedInterview = {
      id: interviewId,
      status: 'COMPLETED',
      interviewFeedback: completeData.feedback
    }
    
    return HttpResponse.json(updatedInterview)
  }),
]

// Export helper functions for tests
export { validTokens, generateToken, createMockUser, createMockApplication, mockUsers, mockApplications };
export type { MockUser, MockApplication, UserRegistrationData, LoginCredentials, ApplicationData, MockUserProfile, ProfileUpdateRequest }; 