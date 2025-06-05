import { authService } from './authService';

export interface JobApplication {
  id: string;
  company: string;
  jobTitle: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';
  applicationDate: string;
  location: string;
  url: string;
  description: string;
  compensation: number;
  experienceLevel?: string;
}

class ApplicationService {
  private apiUrl = import.meta.env.VITE_API_URL;

  async getAllApplications(): Promise<JobApplication[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.apiUrl}/applications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch applications:', response.status, errorText);
      throw new Error(`Failed to fetch applications: ${response.status}`);
    }

    return response.json();
  }

  async getApplicationById(id: string): Promise<JobApplication> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.apiUrl}/applications/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch application:', response.status, errorText);
      throw new Error(`Failed to fetch application: ${response.status}`);
    }

    return response.json();
  }

  async createApplication(application: Omit<JobApplication, 'id'>): Promise<JobApplication> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.apiUrl}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create application:', response.status, errorText);
      throw new Error(`Failed to create application: ${response.status}`);
    }

    return response.json();
  }

  async updateApplication(id: string, application: JobApplication): Promise<JobApplication> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.apiUrl}/applications/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update application:', response.status, errorText);
      throw new Error(`Failed to update application: ${response.status}`);
    }

    return response.json();
  }

  async deleteApplication(id: string): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.apiUrl}/applications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete application:', response.status, errorText);
      throw new Error(`Failed to delete application: ${response.status}`);
    }
  }
}

export const applicationService = new ApplicationService(); 