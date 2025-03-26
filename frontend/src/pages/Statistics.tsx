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

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuBar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Application Statistics</h1>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.successRate}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageResponseTime} days</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Active Applications</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.byStatus.Applied + stats.byStatus.Interviewing}
              </p>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h2>
            <div className="space-y-4">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center">
                  <div className="w-24 text-sm font-medium text-gray-500">{status}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(count / stats.total) * 100}%`,
                          backgroundColor: status === 'Applied' ? '#60A5FA' :
                                         status === 'Interviewing' ? '#FBBF24' :
                                         status === 'Offered' ? '#34D399' :
                                         '#F87171'
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{count} applications</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Applications */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Applications by Month</h2>
            <div className="space-y-4">
              {Object.entries(stats.byMonth).map(([month, count]) => (
                <div key={month} className="flex items-center">
                  <div className="w-24 text-sm font-medium text-gray-500">{month}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${(count / Math.max(...Object.values(stats.byMonth))) * 100}%`
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{count} applications</div>
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