import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applicationService, type JobApplication } from '../applicationService';
import { mockUsers, mockApplications, validTokens, generateToken, createMockUser, createMockApplication } from '../../test/mocks/handlers';

// Set up environment variable for tests
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8080/api'
  },
  writable: true
});

describe('ApplicationService', () => {
  let testUser: any;
  let testToken: string;
  
  beforeEach(() => {
    // Clear mock data
    mockUsers.clear();
    mockApplications.clear();
    validTokens.clear();
    localStorage.clear();
    
    // Create test user
    testUser = createMockUser({
      username: 'testuser',
      email: 'test@example.com'
    });
    mockUsers.set(testUser.id, testUser);
    
    // Generate and set token
    testToken = generateToken('testuser');
    localStorage.setItem('token', testToken);
    
    vi.clearAllMocks();
  });

  describe('getAllApplications', () => {
    it('should fetch all applications successfully', async () => {
      // Create test applications
      const app1 = createMockApplication({
        company: 'Test Company',
        jobTitle: 'Software Engineer',
        status: 'Applied',
        applicationDate: '2023-01-01',
        location: 'Remote',
        url: 'https://example.com/job',
        description: 'A great job opportunity',
        compensation: 100000,
      }, testUser.id);
      mockApplications.set(app1.id, app1);

      const result = await applicationService.getAllApplications();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        id: app1.id.toString(),
        company: 'Test Company',
        jobTitle: 'Software Engineer',
        status: 'Applied',
      }));
    });

    it('should throw error when no token is available', async () => {
      localStorage.removeItem('token');

      await expect(applicationService.getAllApplications()).rejects.toThrow('No authentication token found');
    });

    it('should return empty array when no applications exist', async () => {
      const result = await applicationService.getAllApplications();
      expect(result).toEqual([]);
    });
  });

  describe('getApplicationById', () => {
    it('should fetch application by id successfully', async () => {
      const testApp = createMockApplication({
        company: 'Test Company',
        jobTitle: 'Software Engineer',
        status: 'Applied',
        applicationDate: '2023-01-01',
        location: 'Remote',
        url: 'https://example.com/job',
        description: 'A great job opportunity',
        compensation: 100000,
      }, testUser.id);
      mockApplications.set(testApp.id, testApp);

      const result = await applicationService.getApplicationById(testApp.id.toString());

      expect(result).toEqual(expect.objectContaining({
        id: testApp.id.toString(),
        company: 'Test Company',
        jobTitle: 'Software Engineer',
      }));
    });

    it('should throw error when application not found', async () => {
      await expect(applicationService.getApplicationById('999')).rejects.toThrow('Failed to fetch application: 404');
    });
  });

  describe('createApplication', () => {
    it('should create application successfully', async () => {
      const newApplication = {
        company: 'New Company',
        jobTitle: 'Senior Developer',
        status: 'Applied' as const,
        applicationDate: '2023-02-01',
        location: 'Remote',
        url: 'https://example.com/job2',
        description: 'Another great opportunity',
        compensation: 120000,
      };

      const result = await applicationService.createApplication(newApplication);

      expect(result).toEqual(expect.objectContaining({
        id: expect.any(String),
        company: 'New Company',
        jobTitle: 'Senior Developer',
        status: 'Applied',
      }));
      expect(mockApplications.size).toBe(1);
    });
  });

  describe('updateApplication', () => {
    it('should update application successfully', async () => {
      const testApp = createMockApplication({
        company: 'Test Company',
        jobTitle: 'Software Engineer',
        status: 'Applied',
        applicationDate: '2023-01-01',
        location: 'Remote',
        url: 'https://example.com/job',
        description: 'A great job opportunity',
        compensation: 100000,
      }, testUser.id);
      mockApplications.set(testApp.id, testApp);

      const updatedData = {
        ...testApp,
        id: testApp.id.toString(),
        jobTitle: 'Senior Software Engineer',
        status: 'Interviewing' as const,
      };

      const result = await applicationService.updateApplication(testApp.id.toString(), updatedData);

      expect(result).toEqual(expect.objectContaining({
        id: testApp.id.toString(),
        jobTitle: 'Senior Software Engineer',
        status: 'Interviewing',
      }));
    });
  });

  describe('deleteApplication', () => {
    it('should delete application successfully', async () => {
      const testApp = createMockApplication({
        company: 'Test Company',
        jobTitle: 'Software Engineer',
        status: 'Applied',
        applicationDate: '2023-01-01',
        location: 'Remote',
        url: 'https://example.com/job',
        description: 'A great job opportunity',
        compensation: 100000,
      }, testUser.id);
      mockApplications.set(testApp.id, testApp);

      expect(mockApplications.size).toBe(1);

      await applicationService.deleteApplication(testApp.id.toString());

      expect(mockApplications.size).toBe(0);
    });

    it('should throw error when deleting non-existent application', async () => {
      await expect(applicationService.deleteApplication('999')).rejects.toThrow('Failed to delete application: 404');
    });

    it('should throw error when no token is available', async () => {
      localStorage.removeItem('token');

      await expect(applicationService.deleteApplication('1')).rejects.toThrow('No authentication token found');
    });
  });
}); 