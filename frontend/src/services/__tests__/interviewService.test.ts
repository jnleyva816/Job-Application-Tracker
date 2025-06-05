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

describe('InterviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInterviewTypes', () => {
    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewTypes()).rejects.toThrow('No authentication token found');
    });
  });

  describe('getInterviewStatuses', () => {
    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewStatuses()).rejects.toThrow('No authentication token found');
    });
  });

  describe('getInterviewsByApplicationId', () => {
    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewsByApplicationId('123')).rejects.toThrow('No authentication token found');
    });
  });

  describe('createInterview', () => {
    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      const interviewData = {
        type: 'PHONE',
        interviewDate: '2024-01-15T10:00:00',
        notes: 'Initial screening',
        status: 'SCHEDULED'
      };

      await expect(interviewService.createInterview('123', interviewData)).rejects.toThrow('No authentication token found');
    });
  });
}); 