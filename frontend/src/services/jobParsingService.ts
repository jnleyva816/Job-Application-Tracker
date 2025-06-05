import { authService } from './authService';

export interface JobParseResult {
  jobTitle?: string;
  company?: string;
  location?: string;
  description?: string;
  compensation?: number;
  compensationType?: string; // "ANNUAL", "HOURLY", "UNKNOWN"
  experienceLevel?: string;
  originalUrl?: string;
  successful: boolean;
  errorMessage?: string;
  source?: string; // "META", "NETFLIX", "APPLE", "MICROSOFT", "GREENHOUSE", "GENERIC"
}

export interface JobUrlRequest {
  url: string;
}

class JobParsingService {
  private apiUrl = import.meta.env.VITE_API_URL;

  async parseJobUrl(url: string): Promise<JobParseResult> {
    const token = authService.getToken();
    
    try {
      // VITE_API_URL already includes /api, and JobParsingController is at /api/job-parsing
      // So we use /job-parsing/parse to avoid duplication
      const response = await fetch(`${this.apiUrl}/job-parsing/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error parsing job URL:', error);
      return {
        successful: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        originalUrl: url
      };
    }
  }
}

export const jobParsingService = new JobParsingService(); 