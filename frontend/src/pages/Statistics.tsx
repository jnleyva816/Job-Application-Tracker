import { useState } from 'react';
import MenuBar from '../components/MenuBar';

interface ApplicationStats {
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
}

function Statistics() {
  const [stats] = useState<ApplicationStats>({
    total: 25,
    byStatus: {
      Applied: 10,
      Interviewing: 8,
      Offered: 5,
      Rejected: 2,
    },
    byMonth: {
      'Jan 2024': 5,
      'Feb 2024': 8,
      'Mar 2024': 12,
    },
    averageResponseTime: 7,
    successRate: 20,
  });

  const getStatusBarColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'oklch(var(--color-primary))';
      case 'Interviewing':
        return 'oklch(var(--color-accent))';
      case 'Offered':
        return 'oklch(var(--color-success))';
      case 'Rejected':
        return '#F87171';
      default:
        return 'oklch(var(--color-primary))';
    }
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <MenuBar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6">Application Statistics</h1>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Total Applications</h3>
              <p className="text-2xl font-semibold text-light-text dark:text-dark-text">{stats.total}</p>
            </div>
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Success Rate</h3>
              <p className="text-2xl font-semibold text-light-text dark:text-dark-text">{stats.successRate}%</p>
            </div>
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Avg Response Time</h3>
              <p className="text-2xl font-semibold text-light-text dark:text-dark-text">{stats.averageResponseTime} days</p>
            </div>
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Active Applications</h3>
              <p className="text-2xl font-semibold text-light-text dark:text-dark-text">
                {stats.byStatus.Applied + stats.byStatus.Interviewing}
              </p>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Status Distribution</h2>
            <div className="space-y-4">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center">
                  <div className="w-24 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{status}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-light-border dark:bg-dark-border rounded-full">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(count / stats.total) * 100}%`,
                          backgroundColor: getStatusBarColor(status)
                        }}
                      />
                    </div>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{count} applications</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Applications */}
          <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Applications by Month</h2>
            <div className="space-y-4">
              {Object.entries(stats.byMonth).map(([month, count]) => (
                <div key={month} className="flex items-center">
                  <div className="w-24 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{month}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-light-border dark:bg-dark-border rounded-full">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...Object.values(stats.byMonth))) * 100}%`,
                          backgroundColor: 'oklch(var(--color-primary))'
                        }}
                      />
                    </div>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{count} applications</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics; 