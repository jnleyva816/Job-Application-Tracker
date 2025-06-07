import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';

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
    notes: 'Technical round',
    status: 'SCHEDULED',
    interviewerName: 'John Doe',
    interviewerEmail: 'john@company.com',
    location: 'Office',
    durationMinutes: 60,
    meetingLink: 'https://zoom.us/meeting1',
    applicationId: '123'
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
    applicationId: '456'
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

      server.use(
        http.get('http://localhost:8080/api/interview-options/types', () => HttpResponse.json(mockInterviewTypes))
      );

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.getInterviewTypes();

      expect(result).toEqual(mockInterviewTypes);
    });

    it('should handle API errors when fetching interview types', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.get('http://localhost:8080/api/interview-options/types', () => HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewTypes()).rejects.toThrow('Failed to fetch interview types: 500');
    });

    it('should handle network errors when fetching interview types', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.get('http://localhost:8080/api/interview-options/types', () => HttpResponse.error())
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewTypes()).rejects.toThrow('Failed to fetch');
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

      server.use(
        http.get('http://localhost:8080/api/interview-options/statuses', () => HttpResponse.json(mockInterviewStatuses))
      );

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.getInterviewStatuses();

      expect(result).toEqual(mockInterviewStatuses);
    });

    it('should handle API errors when fetching interview statuses', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.get('http://localhost:8080/api/interview-options/statuses', () => HttpResponse.json({ error: 'Not Found' }, { status: 404 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewStatuses()).rejects.toThrow('Failed to fetch interview statuses: 404');
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

      server.use(
        http.get('http://localhost:8080/api/applications/123/interviews', () => HttpResponse.json(mockInterviews))
      );

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.getInterviewsByApplicationId('123');

      expect(result).toEqual(mockInterviews);
    });

    it('should handle API errors when fetching interviews by application ID', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.get('http://localhost:8080/api/applications/123/interviews', () => HttpResponse.json({ error: 'Forbidden' }, { status: 403 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewsByApplicationId('123')).rejects.toThrow('Failed to fetch interviews: 403');
    });

    it('should return empty array when no interviews found', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.get('http://localhost:8080/api/applications/123/interviews', () => HttpResponse.json([]))
      );

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

      // Force override handlers to mock both endpoints needed
      server.resetHandlers(
        http.get('http://localhost:8080/api/applications', () => HttpResponse.json([
          { id: '123', company: 'Test Company' },
          { id: '456', company: 'Another Company' }
        ])),
        http.get('http://localhost:8080/api/applications/123/interviews', () => HttpResponse.json([mockInterviews[0]])),
        http.get('http://localhost:8080/api/applications/456/interviews', () => HttpResponse.json([mockInterviews[1]]))
      );

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.getAllUserInterviews();

      expect(result).toEqual(mockInterviews);
    });

    it('should handle API errors when fetching all user interviews', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.get('http://localhost:8080/api/applications', () => HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getAllUserInterviews()).rejects.toThrow('Failed to fetch applications: 500');
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

      server.use(
        http.post('http://localhost:8080/api/applications/123/interviews', () => HttpResponse.json(mockInterview))
      );

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.createInterview('123', interviewData);

      expect(result).toEqual(mockInterview);
    });

    it('should handle API errors when creating interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.post('http://localhost:8080/api/applications/123/interviews', () => HttpResponse.json({ error: 'Bad Request' }, { status: 400 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.createInterview('123', interviewData)).rejects.toThrow('Failed to create interview: 400');
    });

    it('should handle validation errors when creating interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.post('http://localhost:8080/api/applications/123/interviews', () => HttpResponse.json({ error: 'Unprocessable Entity', errors: ['Interview date is required'] }, { status: 422 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.createInterview('123', interviewData)).rejects.toThrow('Failed to create interview: 422');
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
      server.use(
        http.put('http://localhost:8080/api/applications/123/interviews/1', () => HttpResponse.json(updatedInterview))
      );

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.updateInterview('123', '1', updatedInterviewData);

      expect(result).toEqual(updatedInterview);
    });

    it('should handle API errors when updating interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.put('http://localhost:8080/api/applications/123/interviews/1', () => HttpResponse.json({ error: 'Not Found' }, { status: 404 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.updateInterview('123', '1', updatedInterviewData)).rejects.toThrow('Failed to update interview: 404');
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

      server.use(
        http.delete('http://localhost:8080/api/applications/123/interviews/1', () => HttpResponse.json({}))
      );

      const { interviewService } = await import('../interviewService');
      await interviewService.deleteInterview('123', '1');
    });

    it('should handle API errors when deleting interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.delete('http://localhost:8080/api/applications/123/interviews/1', () => HttpResponse.json({ error: 'Not Found' }, { status: 404 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.deleteInterview('123', '1')).rejects.toThrow('Failed to delete interview: 404');
    });

    it('should handle permissions errors when deleting interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.delete('http://localhost:8080/api/applications/123/interviews/1', () => HttpResponse.json({ error: 'Forbidden' }, { status: 403 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.deleteInterview('123', '1')).rejects.toThrow('Failed to delete interview: 403');
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
      server.use(
        http.put('http://localhost:8080/api/applications/123/interviews/1/reschedule', () => HttpResponse.json(rescheduledInterview))
      );

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.rescheduleInterview('123', '1', rescheduleData);

      expect(result).toEqual(rescheduledInterview);
    });

    it('should handle API errors when rescheduling interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.put('http://localhost:8080/api/applications/123/interviews/1/reschedule', () => HttpResponse.json({ error: 'Bad Request' }, { status: 400 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.rescheduleInterview('123', '1', rescheduleData)).rejects.toThrow('Failed to reschedule interview: 400');
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
      server.use(
        http.put('http://localhost:8080/api/applications/123/interviews/1/cancel', () => HttpResponse.json(cancelledInterview))
      );

      const { interviewService } = await import('../interviewService');
      const result = await interviewService.cancelInterview('123', '1', cancelReason);

      expect(result).toEqual(cancelledInterview);
    });

    it('should handle API errors when cancelling interview', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.put('http://localhost:8080/api/applications/123/interviews/1/cancel', () => HttpResponse.json({ error: 'Conflict' }, { status: 409 }))
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.cancelInterview('123', '1', cancelReason)).rejects.toThrow('Failed to cancel interview: 409');
    });
  });

  describe('Network Error Handling', () => {
    it('should handle fetch network errors gracefully', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.get('http://localhost:8080/api/interview-options/types', () => HttpResponse.error()),
        http.get('http://localhost:8080/api/interview-options/statuses', () => HttpResponse.error()),
        http.get('http://localhost:8080/api/applications', () => HttpResponse.error())
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.getInterviewTypes()).rejects.toThrow('Failed to fetch');
      await expect(interviewService.getInterviewStatuses()).rejects.toThrow('Failed to fetch');
      await expect(interviewService.getAllUserInterviews()).rejects.toThrow('Failed to fetch');
    });

    it('should handle timeout errors', async () => {
      const { authService } = await import('../authService');
      vi.mocked(authService.getToken).mockReturnValue(mockToken);

      server.use(
        http.post('http://localhost:8080/api/applications/123/interviews', () => HttpResponse.error())
      );

      const { interviewService } = await import('../interviewService');

      await expect(interviewService.createInterview('123', { type: 'PHONE', interviewDate: '2024-01-15T10:00:00', status: 'SCHEDULED' })).rejects.toThrow('Failed to fetch');
    });
  });
}); 