import { setupServer } from 'msw/node'
import { handlers } from './handlers'

console.log('Setting up MSW server with', handlers.length, 'handlers')

export const server = setupServer(...handlers)

// Add event listeners for unhandled requests only (not all requests)
server.events.on('request:unhandled', ({ request }) => {
  console.warn('MSW: Unhandled request:', request.method, request.url)
  console.warn('MSW: This request was not intercepted by any handler')
}) 