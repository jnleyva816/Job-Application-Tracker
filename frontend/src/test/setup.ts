import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

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

// Mock fetch in case MSW fails to intercept
const originalFetch = global.fetch
let mswStarted = false

// Setup MSW
beforeAll(async () => {
  try {
    server.listen({ 
      onUnhandledRequest: (req) => {
        console.error('MSW: Unhandled request:', req.method, req.url)
        console.error('This request was not intercepted by MSW')
      }
    })
    mswStarted = true
  } catch (error) {
    console.error('Failed to start MSW server:', error)
    mswStarted = false
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
    server.close()
  }
}) 