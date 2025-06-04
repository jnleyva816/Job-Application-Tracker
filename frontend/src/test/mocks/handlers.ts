import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:8080/api'

// Mock user data
const mockUsers = new Map()
let userIdCounter = 1

// Mock application data
const mockApplications = new Map()
let applicationIdCounter = 1

// Mock tokens
const validTokens = new Set<string>()

// Helper function to generate mock user
const createMockUser = (userData: any) => ({
  id: userData.id || userIdCounter++,
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
})

// Helper function to generate mock application
const createMockApplication = (applicationData: any, userId: number) => ({
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
const getUserFromToken = (token: string) => {
  const username = token.split('-')[3] // Extract username from mock token
  return Array.from(mockUsers.values()).find((user: any) => user.username === username)
}

export const handlers = [
  // Register user
  http.post(`${API_URL}/users/register`, async ({ request }) => {
    const userData = await request.json() as any
    
    // Check if username already exists
    const existingUser = Array.from(mockUsers.values()).find((user: any) => 
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
    const credentials = await request.json() as any
    
    const user = Array.from(mockUsers.values()).find((user: any) => 
      user.username === credentials.username
    )
    
    if (!user || credentials.password !== 'correctpassword') {
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
    const applications = Array.from(mockApplications.values()).filter((app: any) => 
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
    
    const applicationData = await request.json() as any
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
    
    const updateData = await request.json() as any
    const updatedApplication = {
      ...application,
      ...updateData,
      id: application.id, // Keep original ID
      userId: application.userId, // Keep original user association
      updatedAt: new Date().toISOString(),
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
    
    return new HttpResponse(null, { status: 204 })
  }),

  // Get user by ID
  http.get(`${API_URL}/users/:id`, ({ params, request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userId = parseInt(params.id as string)
    const user = mockUsers.get(userId)
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const currentUser = getUserFromToken(token)
    if (!currentUser || (currentUser.id !== userId && currentUser.role !== 'ROLE_ADMIN')) {
      return HttpResponse.json(
        { message: 'You don\'t have permission to access this resource' },
        { status: 403 }
      )
    }
    
    return HttpResponse.json(user)
  }),

  // Update user
  http.put(`${API_URL}/users/:id`, async ({ params, request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userId = parseInt(params.id as string)
    const user = mockUsers.get(userId)
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const currentUser = getUserFromToken(token)
    if (!currentUser || (currentUser.id !== userId && currentUser.role !== 'ROLE_ADMIN')) {
      return HttpResponse.json(
        { message: 'You don\'t have permission to access this resource' },
        { status: 403 }
      )
    }
    
    const updateData = await request.json() as any
    
    // Check for duplicate username/email if being changed
    if (updateData.username && updateData.username !== user.username) {
      const existing = Array.from(mockUsers.values()).find((u: any) => 
        u.username === updateData.username && u.id !== userId
      )
      if (existing) {
        return HttpResponse.json(
          { message: 'Username already exists' },
          { status: 400 }
        )
      }
    }
    
    if (updateData.email && updateData.email !== user.email) {
      const existing = Array.from(mockUsers.values()).find((u: any) => 
        u.email === updateData.email && u.id !== userId
      )
      if (existing) {
        return HttpResponse.json(
          { message: 'Email already exists' },
          { status: 400 }
        )
      }
    }
    
    // Update user
    const updatedUser = {
      ...user,
      ...updateData,
      id: user.id, // Keep original ID
      updatedAt: new Date().toISOString(),
    }
    
    mockUsers.set(userId, updatedUser)
    
    return HttpResponse.json(updatedUser)
  }),

  // Delete user
  http.delete(`${API_URL}/users/:id`, ({ params, request }) => {
    const token = validateToken(request.headers.get('Authorization'))
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userId = parseInt(params.id as string)
    const user = mockUsers.get(userId)
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    const currentUser = getUserFromToken(token)
    if (!currentUser || (currentUser.id !== userId && currentUser.role !== 'ROLE_ADMIN')) {
      return HttpResponse.json(
        { message: 'You don\'t have permission to access this resource' },
        { status: 403 }
      )
    }
    
    mockUsers.delete(userId)
    
    return new HttpResponse(null, { status: 204 })
  }),

  // Get current user profile
  http.get(`${API_URL}/profile`, ({ request }) => {
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
    
    return HttpResponse.json(user)
  }),

  // Update current user profile
  http.put(`${API_URL}/profile`, async ({ request }) => {
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
    
    const updateData = await request.json() as any
    
    // Check for duplicate username/email if being changed
    if (updateData.username && updateData.username !== user.username) {
      const existing = Array.from(mockUsers.values()).find((u: any) => 
        u.username === updateData.username && u.id !== user.id
      )
      if (existing) {
        return HttpResponse.json(
          { message: 'Username already exists' },
          { status: 400 }
        )
      }
    }
    
    if (updateData.email && updateData.email !== user.email) {
      const existing = Array.from(mockUsers.values()).find((u: any) => 
        u.email === updateData.email && u.id !== user.id
      )
      if (existing) {
        return HttpResponse.json(
          { message: 'Email already exists' },
          { status: 400 }
        )
      }
    }
    
    // Update user
    const updatedUser = {
      ...user,
      ...updateData,
      id: user.id, // Keep original ID
      updatedAt: new Date().toISOString(),
    }
    
    mockUsers.set(user.id, updatedUser)
    
    return HttpResponse.json(updatedUser)
  }),
]

// Export helper functions for tests
export { mockUsers, mockApplications, validTokens, generateToken, createMockUser, createMockApplication } 