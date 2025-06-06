import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// Ensure environment variables are properly set for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8080/api',
    DEV: false,
    PROD: false,
    SSR: false,
    MODE: 'test'
  },
  writable: true,
})

// Create a proper localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => {
      return store[key] || null
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

let mswStarted = false

// Setup MSW
beforeAll(async () => {
  console.log('🔧 Setting up MSW server...')
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    CI: process.env.CI,
    VITEST: process.env.VITEST,
    VITE_API_URL: import.meta.env.VITE_API_URL
  })
  
  try {
    // Start MSW server with proper error handling
    server.listen({ 
      onUnhandledRequest: (req) => {
        const url = req.url
        const method = req.method
        const isApiRequest = url.includes('/api/')
        
        if (isApiRequest) {
          console.error('❌ MSW: Unhandled API request:', method, url)
          console.error('This API request was not intercepted by MSW')
          
          // In CI, be strict about unhandled API requests
          if (process.env.CI) {
            throw new Error(`Unhandled API request in CI: ${method} ${url}`)
          }
        } else {
          // Log but don't fail for non-API requests
          console.warn('⚠️ MSW: External request (allowed):', method, url)
        }
      }
    })
    
    mswStarted = true
    console.log('✅ MSW server started successfully')
    
  } catch (error) {
    console.error('❌ Failed to start MSW server:', error)
    mswStarted = false
    throw error
  }
})

afterEach(() => {
  if (mswStarted) {
    server.resetHandlers()
  }
  localStorage.clear()
})

afterAll(() => {
  if (mswStarted) {
    console.log('🛑 Stopping MSW server...')
    server.close()
  }
}) 