import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

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

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockToken = 'mock-auth-token';
const mockInterviewTypes = [
  { value: 'TECHNICAL_INTERVIEW', label: 'Technical Interview' },
  { value: 'HR_INTERVIEW', label: 'HR Interview' },
  { value: 'BEHAVIORAL_INTERVIEW', label: 'Behavioral Interview' }
];

const mockInterviewStatuses = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const mockInterviews = [
  {
    id: 1,
    type: 'TECHNICAL_INTERVIEW',
    interviewDate: '2024-01-15T10:00:00Z',
    status: 'SCHEDULED',
    interviewerName: 'John Doe',
    interviewerEmail: 'john@company.com',
    location: 'Office',
    durationMinutes: 60,
    meetingLink: 'https://zoom.us/meeting1',
    notes: 'Technical round'
  },
  {
    id: 2,
    type: 'HR_INTERVIEW',
    interviewDate: '2024-01-20T14:00:00Z',
    status: 'COMPLETED',
    interviewerName: 'Jane Smith',
    interviewerEmail: 'jane@company.com',
    location: 'Remote',
    durationMinutes: 30,
    meetingLink: 'https://zoom.us/meeting2',
    notes: 'Culture fit discussion'
  }
];

const mockInterview = {
  id: 3,
  type: 'FINAL_INTERVIEW',
  interviewDate: '2024-01-25T15:00:00Z',
  status: 'SCHEDULED',
  interviewerName: 'Bob Johnson',
  interviewerEmail: 'bob@company.com',
  location: 'Office',
  durationMinutes: 90,
  meetingLink: '',
  notes: 'Final round'
};

describe('InterviewService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getInterviewTypes', () => {
    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewTypes()).rejects.toThrow('No authentication token found');
    });

    it('should successfully fetch interview types', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInterviewTypes)
      });

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.getInterviewTypes();

      expect(result).toEqual(mockInterviewTypes);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/interviews/types', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle API errors when fetching interview types', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewTypes()).rejects.toThrow('Failed to fetch interview types: 500 Internal Server Error');
    });

    it('should handle network errors when fetching interview types', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockRejectedValue(new Error('Network error'));

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewTypes()).rejects.toThrow('Network error');
    });
  });

  describe('getInterviewStatuses', () => {
    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewStatuses()).rejects.toThrow('No authentication token found');
    });

    it('should successfully fetch interview statuses', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInterviewStatuses)
      });

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.getInterviewStatuses();

      expect(result).toEqual(mockInterviewStatuses);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/interviews/statuses', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle API errors when fetching interview statuses', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewStatuses()).rejects.toThrow('Failed to fetch interview statuses: 404 Not Found');
    });
  });

  describe('getInterviewsByApplicationId', () => {
    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewsByApplicationId('123')).rejects.toThrow('No authentication token found');
    });

    it('should successfully fetch interviews by application ID', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInterviews)
      });

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.getInterviewsByApplicationId('123');

      expect(result).toEqual(mockInterviews);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/applications/123/interviews', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle API errors when fetching interviews by application ID', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewsByApplicationId('123')).rejects.toThrow('Failed to fetch interviews: 403 Forbidden');
    });

    it('should return empty array when no interviews found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.getInterviewsByApplicationId('123');

      expect(result).toEqual([]);
    });
  });

  describe('getAllUserInterviews', () => {
    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getAllUserInterviews()).rejects.toThrow('No authentication token found');
    });

    it('should successfully fetch all user interviews', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInterviews)
      });

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.getAllUserInterviews();

      expect(result).toEqual(mockInterviews);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/interviews', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle API errors when fetching all user interviews', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getAllUserInterviews()).rejects.toThrow('Failed to fetch user interviews: 500 Internal Server Error');
    });
  });

  describe('createInterview', () => {
    const interviewData = {
      type: 'TECHNICAL_INTERVIEW',
      interviewDate: '2024-01-15T10:00:00',
      notes: 'Initial screening',
      status: 'SCHEDULED'
    };

    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.createInterview('123', interviewData)).rejects.toThrow('No authentication token found');
    });

    it('should successfully create an interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInterview)
      });

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.createInterview('123', interviewData);

      expect(result).toEqual(mockInterview);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/applications/123/interviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData),
      });
    });

    it('should handle API errors when creating interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.createInterview('123', interviewData)).rejects.toThrow('Failed to create interview: 400 Bad Request');
    });

    it('should handle validation errors when creating interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: () => Promise.resolve({ message: 'Validation failed', errors: ['Interview date is required'] })
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.createInterview('123', interviewData)).rejects.toThrow('Failed to create interview: 422 Unprocessable Entity');
    });
  });

  describe('updateInterview', () => {
    const updatedInterviewData = {
      type: 'FINAL_INTERVIEW',
      interviewDate: '2024-01-20T15:00:00',
      notes: 'Updated notes',
      status: 'RESCHEDULED'
    };

    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.updateInterview('123', '1', updatedInterviewData)).rejects.toThrow('No authentication token found');
    });

    it('should successfully update an interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      const updatedInterview = { ...mockInterview, ...updatedInterviewData };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedInterview)
      });

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.updateInterview('123', '1', updatedInterviewData);

      expect(result).toEqual(updatedInterview);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/applications/123/interviews/1', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInterviewData),
      });
    });

    it('should handle API errors when updating interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.updateInterview('123', '1', updatedInterviewData)).rejects.toThrow('Failed to update interview: 404 Not Found');
    });
  });

  describe('deleteInterview', () => {
    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.deleteInterview('123', '1')).rejects.toThrow('No authentication token found');
    });

    it('should successfully delete an interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: true
      });

      const { interviewService } = await import('../interviewService');
      await interviewService.deleteInterview('123', '1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/applications/123/interviews/1', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle API errors when deleting interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.deleteInterview('123', '1')).rejects.toThrow('Failed to delete interview: 404 Not Found');
    });

    it('should handle permissions errors when deleting interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.deleteInterview('123', '1')).rejects.toThrow('Failed to delete interview: 403 Forbidden');
    });
  });

  describe('rescheduleInterview', () => {
    const rescheduleData = {
      newDate: '2024-02-01T10:00:00',
      reason: 'Conflict with existing meeting'
    };

    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.rescheduleInterview('123', '1', rescheduleData)).rejects.toThrow('No authentication token found');
    });

    it('should successfully reschedule an interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      const rescheduledInterview = { ...mockInterview, interviewDate: rescheduleData.newDate, status: 'RESCHEDULED' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(rescheduledInterview)
      });

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.rescheduleInterview('123', '1', rescheduleData);

      expect(result).toEqual(rescheduledInterview);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/applications/123/interviews/1/reschedule', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rescheduleData),
      });
    });

    it('should handle API errors when rescheduling interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.rescheduleInterview('123', '1', rescheduleData)).rejects.toThrow('Failed to reschedule interview: 400 Bad Request');
    });
  });

  describe('cancelInterview', () => {
    const cancelReason = 'Position filled by another candidate';

    it('should throw error when no token is found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(null);

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.cancelInterview('123', '1', cancelReason)).rejects.toThrow('No authentication token found');
    });

    it('should successfully cancel an interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      const cancelledInterview = { ...mockInterview, status: 'CANCELLED', cancellationReason: cancelReason };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(cancelledInterview)
      });

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.cancelInterview('123', '1', cancelReason);

      expect(result).toEqual(cancelledInterview);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/api/applications/123/interviews/1/cancel', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancelReason),
      });
    });

    it('should handle API errors when cancelling interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict'
      });

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.cancelInterview('123', '1', cancelReason)).rejects.toThrow('Failed to cancel interview: 409 Conflict');
    });
  });

  describe('Network Error Handling', () => {
    it('should handle fetch network errors gracefully', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockRejectedValue(new Error('Failed to fetch'));

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewTypes()).rejects.toThrow('Failed to fetch');
      await expect(interviewService.getInterviewStatuses()).rejects.toThrow('Failed to fetch');
      await expect(interviewService.getAllUserInterviews()).rejects.toThrow('Failed to fetch');
    });

    it('should handle timeout errors', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      mockFetch.mockRejectedValue(new Error('Request timeout'));

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.createInterview('123', { type: 'PHONE', interviewDate: '2024-01-15T10:00:00', status: 'SCHEDULED' })).rejects.toThrow('Request timeout');
    });
  });
}); 