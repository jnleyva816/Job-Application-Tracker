import { useState, useEffect } from 'react';
import MenuBar from '../components/MenuBar';
import { statisticsService, ApplicationStats } from '../services/statisticsService';
import { BarChart, DonutChart } from '../components/charts';

function Statistics() {
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await statisticsService.getStatistics();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
        console.error('Error fetching statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const getStatusColors = () => ({
    Applied: '#667eea',
    Interviewing: '#764ba2', 
    Offered: '#43e97b',
    Rejected: '#f093fb'
  });

  const getInterviewStatusColors = () => ({
    SCHEDULED: '#4facfe',
    COMPLETED: '#43e97b',
    CANCELLED: '#f093fb'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" role="status" aria-label="Loading"></div>
              <p className="text-light-text dark:text-dark-text mt-4">Loading statistics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <p className="text-red-500 text-lg">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <p className="text-light-text dark:text-dark-text">No statistics available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Defensive programming: fallback to byStatus if currentStatusDistribution is missing
  const currentStatusDistribution = stats.currentStatusDistribution || stats.byStatus;
  if (!stats.currentStatusDistribution) {
    console.warn('currentStatusDistribution missing from API response, falling back to byStatus');
  }

  // Prepare data for charts
  const statusColors = getStatusColors();
  const statusProgressionData = Object.entries(stats.byStatus).map(([status, count]) => ({
    label: status,
    value: count,
    color: statusColors[status as keyof typeof statusColors] || '#667eea'
  }));

  const currentStatusData = Object.entries(currentStatusDistribution).map(([status, count]) => ({
    label: status,
    value: count,
    color: statusColors[status as keyof typeof statusColors] || '#667eea'
  }));

  const monthlyData = Object.entries(stats.byMonth).map(([month, count]) => ({
    label: month.substring(0, 7), // Show YYYY-MM format
    value: count,
    color: '#667eea'
  }));

  const interviewTypeData = stats.interviewStats ? Object.entries(stats.interviewStats.byType).map(([type, count]) => ({
    label: type,
    value: count,
    color: '#4facfe'
  })) : [];

  const interviewStatusColors = getInterviewStatusColors();
  const interviewStatusData = stats.interviewStats ? Object.entries(stats.interviewStats.byStatus).map(([status, count]) => ({
    label: status,
    value: count,
    color: interviewStatusColors[status as keyof typeof interviewStatusColors] || '#4facfe'
  })) : [];

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <MenuBar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-8">Application Analytics</h1>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-6 rounded-xl shadow-lg border border-blue-200 dark:border-blue-700">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Total Applications</h3>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">All time submissions</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 p-6 rounded-xl shadow-lg border border-green-200 dark:border-green-700">
              <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Success Rate</h3>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.successRate}%</p>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">Offers received</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900 dark:to-violet-900 p-6 rounded-xl shadow-lg border border-purple-200 dark:border-purple-700">
              <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Avg Response Time</h3>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.averageResponseTime} days</p>
              <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">Days to hear back</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-900 p-6 rounded-xl shadow-lg border border-amber-200 dark:border-amber-700">
              <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">Active Applications</h3>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                {(currentStatusDistribution.Applied || 0) + (currentStatusDistribution.Interviewing || 0)}
              </p>
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">In progress</div>
            </div>
          </div>

          {/* Interview Overview Cards */}
          {stats.interviewStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-900 dark:to-teal-900 p-6 rounded-xl shadow-lg border-l-4 border-cyan-500">
                <h3 className="text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-2">Total Interviews</h3>
                <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{stats.interviewStats.totalInterviews}</p>
                <div className="mt-2 text-xs text-cyan-600 dark:text-cyan-400">All interviews scheduled</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-900 dark:to-teal-900 p-6 rounded-xl shadow-lg border-l-4 border-cyan-500">
                <h3 className="text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-2">Interview Rate</h3>
                <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{stats.interviewStats.conversionRate}%</p>
                <div className="mt-2 text-xs text-cyan-600 dark:text-cyan-400">Applications to interviews</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-900 dark:to-teal-900 p-6 rounded-xl shadow-lg border-l-4 border-cyan-500">
                <h3 className="text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-2">Upcoming Interviews</h3>
                <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{stats.interviewStats.upcoming}</p>
                <div className="mt-2 text-xs text-cyan-600 dark:text-cyan-400">Scheduled ahead</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-teal-100 dark:from-cyan-900 dark:to-teal-900 p-6 rounded-xl shadow-lg border-l-4 border-cyan-500">
                <h3 className="text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-2">Avg per Application</h3>
                <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{stats.interviewStats.averagePerApplication}</p>
                <div className="mt-2 text-xs text-cyan-600 dark:text-cyan-400">Interviews per app</div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Status Distribution Donut Chart */}
            <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">Current Status Distribution</h2>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
                Where your applications stand right now
              </p>
              <div className="flex justify-center">
                <DonutChart 
                  data={currentStatusData}
                  width={350}
                  height={350}
                  colorScheme={Object.values(statusColors)}
                  showLabels={currentStatusData.length <= 4}
                  showPercentages={true}
                  useLegend={currentStatusData.length > 4}
                  legendPosition="right"
                  minSliceAngle={0.08}
                />
              </div>
            </div>

            {/* Status Progression Bar Chart */}
            <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">Status Progression</h2>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
                How many applications reached each stage
              </p>
              <BarChart 
                data={statusProgressionData}
                width={350}
                height={300}
                colorScheme={Object.values(statusColors)}
                showValues={true}
              />
            </div>
          </div>

          {/* Interview Charts */}
          {stats.interviewStats && stats.interviewStats.totalInterviews > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Interview Types */}
              <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">Interview Types</h2>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
                  Breakdown by interview format
                </p>
                <BarChart 
                  data={interviewTypeData}
                  width={350}
                  height={280}
                  colorScheme={['#4facfe', '#43e97b', '#667eea', '#f093fb']}
                  showValues={true}
                />
              </div>

              {/* Interview Status */}
              <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">Interview Status</h2>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
                  Current state of your interviews
                </p>
                <div className="flex justify-center">
                  <DonutChart 
                    data={interviewStatusData}
                    width={320}
                    height={320}
                    colorScheme={Object.values(interviewStatusColors)}
                    showLabels={interviewStatusData.length <= 3}
                    showPercentages={true}
                    useLegend={interviewStatusData.length > 3}
                    legendPosition="right"
                    minSliceAngle={0.1}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Monthly Applications Trend */}
          <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">Monthly Application Trend</h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-6">
              Your application activity over time
            </p>
            <div className="overflow-x-auto">
              <BarChart 
                data={monthlyData}
                width={Math.max(600, monthlyData.length * 80)}
                height={350}
                colorScheme={['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']}
                showValues={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Statistics; 