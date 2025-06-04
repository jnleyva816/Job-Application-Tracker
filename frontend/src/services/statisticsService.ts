import { authService } from './authService';

export interface InterviewStats {
  totalInterviews: number;
  byType: {
    [key: string]: number;
  };
  byStatus: {
    [key: string]: number;
  };
  upcoming: number;
  past: number;
  today: number;
  byMonth: {
    [key: string]: number;
  };
  conversionRate: number;
  averagePerApplication: number;
}

export interface ApplicationStats {
  total: number;
  byStatus: {
    Applied: number;
    Interviewing: number;
    Offered: number;
    Rejected: number;
  };
  byMonth: {
    [key: string]: number;
  };
  averageResponseTime: number;
  successRate: number;
  interviewStats: InterviewStats;
}

class StatisticsService {
  private apiUrl = import.meta.env.VITE_API_URL;

  async getStatistics(): Promise<ApplicationStats> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.apiUrl}/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch statistics:', response.status, errorText);
      throw new Error(`Failed to fetch statistics: ${response.status}`);
    }

    return response.json();
  }
}

export const statisticsService = new StatisticsService(); 