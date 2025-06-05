import { describe, it, expect, beforeEach, vi } from 'vitest';

// Set up environment variable
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8080/api'
  },
  writable: true
});

// Mock authService
vi.mock('../authService', () => ({
  authService: {
    getToken: vi.fn(),
  },
}));

describe('JobParsingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseJobUrl', () => {
    it('should handle network error gracefully', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue('test-token');

      // Mock fetch to throw error
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const { jobParsingService } = await import('../jobParsingService');

      const result = await jobParsingService.parseJobUrl('https://example.com/job');

      expect(result).toEqual({
        successful: false,
        errorMessage: 'Network error',
        originalUrl: 'https://example.com/job'
      });

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should handle unknown error gracefully', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue('test-token');

      // Mock fetch to throw non-Error
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValueOnce('Unknown error');

      const { jobParsingService } = await import('../jobParsingService');

      const result = await jobParsingService.parseJobUrl('https://example.com/job');

      expect(result).toEqual({
        successful: false,
        errorMessage: 'Unknown error occurred',
        originalUrl: 'https://example.com/job'
      });

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });
}); 