import { authService } from './authService';

interface Interview {
  id?: number;
  type: string;
  interviewDate: string; // Will be converted to ISO string for LocalDateTime
  notes?: string;
  application?: {
    id: number;
  };
}

class InterviewService {
  private apiUrl = import.meta.env.VITE_API_URL;

  async getInterviewsByApplicationId(applicationId: string): Promise<Interview[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.apiUrl}/applications/${applicationId}/interviews`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch interviews:', response.status, errorText);
      throw new Error(`Failed to fetch interviews: ${response.status}`);
    }

    return response.json();
  }

  async getInterviewById(applicationId: string, interviewId: string): Promise<Interview> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.apiUrl}/applications/${applicationId}/interviews/${interviewId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch interview:', response.status, errorText);
      throw new Error(`Failed to fetch interview: ${response.status}`);
    }

    return response.json();
  }

  async createInterview(applicationId: string, interview: Omit<Interview, 'id' | 'application'>): Promise<Interview> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Ensure the date is in the correct ISO format for LocalDateTime
    const interviewData = {
      type: interview.type,
      interviewDate: interview.interviewDate, // Should be in ISO format already from datetime-local input
      notes: interview.notes || null
    };

    console.log('Creating interview with data:', interviewData);

    const response = await fetch(`${this.apiUrl}/applications/${applicationId}/interviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interviewData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create interview:', response.status, errorText);
      throw new Error(`Failed to create interview: ${response.status}`);
    }

    return response.json();
  }

  async updateInterview(applicationId: string, interviewId: string, interview: Omit<Interview, 'id' | 'application'>): Promise<Interview> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const interviewData = {
      type: interview.type,
      interviewDate: interview.interviewDate,
      notes: interview.notes || null
    };

    const response = await fetch(`${this.apiUrl}/applications/${applicationId}/interviews/${interviewId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(interviewData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update interview:', response.status, errorText);
      throw new Error(`Failed to update interview: ${response.status}`);
    }

    return response.json();
  }

  async deleteInterview(applicationId: string, interviewId: string): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.apiUrl}/applications/${applicationId}/interviews/${interviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete interview:', response.status, errorText);
      throw new Error(`Failed to delete interview: ${response.status}`);
    }
  }
}

export const interviewService = new InterviewService();
export type { Interview }; 