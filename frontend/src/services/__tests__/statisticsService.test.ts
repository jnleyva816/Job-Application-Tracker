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

describe('StatisticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStatistics', () => {
    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { statisticsService } = await import('../statisticsService');

      await expect(statisticsService.getStatistics()).rejects.toThrow('No authentication token found');
    });

    it('should handle network errors', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue('test-token');

      // Mock fetch to throw error
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      const { statisticsService } = await import('../statisticsService');

      await expect(statisticsService.getStatistics()).rejects.toThrow('Network error');

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });
}); 