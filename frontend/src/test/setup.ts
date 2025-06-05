import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
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

// Mock fetch globally to ensure it's available and prevent real requests
if (!global.fetch) {
  global.fetch = vi.fn()
}

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

// Prevent any real network requests by mocking them globally
const mockFetch = vi.fn()
Object.defineProperty(global, 'fetch', {
  value: mockFetch,
  writable: true,
})

let mswStarted = false

// Setup MSW
beforeAll(async () => {
  console.log('🔧 Setting up MSW server...')
  
  // Reset the mock fetch before starting MSW
  mockFetch.mockReset()
  
  try {
    server.listen({ 
      onUnhandledRequest: (req) => {
        const isInternalTest = req.url.includes('localhost:8080/api')
        
        if (isInternalTest) {
          console.error('❌ MSW: Unhandled API request:', req.method, req.url)
          console.error('This API request was not intercepted by MSW')
          // In CI, we want tests to fail if there are unhandled API requests
          if (process.env.CI) {
            throw new Error(`Unhandled API request: ${req.method} ${req.url}`)
          }
        } else {
          console.warn('⚠️ MSW: External request (allowed):', req.method, req.url)
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