interface ComprehensiveOverviewProps {
  stats: {
    total: number;
    byStatus: {
      Applied: number;
      Interviewing: number;
      Offered: number;
      Rejected: number;
    };
    currentStatusDistribution?: {
      Applied: number;
      Interviewing: number;
      Offered: number;
      Rejected: number;
    };
    successRate: number;
    averageResponseTime: number;
    interviewStats?: {
      totalInterviews: number;
      upcoming: number;
      past: number;
      conversionRate: number;
      averagePerApplication: number;
    };
  };
  width?: number;
  height?: number;
}

export function ComprehensiveOverviewChart({ stats, width = 800, height = 400 }: ComprehensiveOverviewProps) {
  const currentStatus = stats.currentStatusDistribution || stats.byStatus;
  const interviewStats = stats.interviewStats || {
    totalInterviews: 0,
    upcoming: 0,
    past: 0,
    conversionRate: 0,
    averagePerApplication: 0
  };

  // Calculate key metrics
  const activeApplications = currentStatus.Applied + currentStatus.Interviewing;
  const completedApplications = currentStatus.Offered + currentStatus.Rejected;
  const interviewRate = stats.total > 0 ? ((interviewStats.totalInterviews / stats.total) * 100) : 0;
  
  // Status colors
  const statusColors = {
    Applied: '#667eea',
    Interviewing: '#764ba2',
    Offered: '#43e97b',
    Rejected: '#f093fb'
  };

  // Create SVG elements
  const margin = { top: 40, right: 40, bottom: 60, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Main flow visualization (Sankey-like)
  const flowHeight = chartHeight * 0.6;

  // Calculate proportions for flow
  const totalApps = stats.total || 1; // Avoid division by zero
  const appliedWidth = (currentStatus.Applied / totalApps) * chartWidth * 0.8;
  const interviewingWidth = (currentStatus.Interviewing / totalApps) * chartWidth * 0.8;
  const offeredWidth = (currentStatus.Offered / totalApps) * chartWidth * 0.8;
  const rejectedWidth = (currentStatus.Rejected / totalApps) * chartWidth * 0.8;

  return (
    <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
          Application Journey Overview
        </h2>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Complete view of your job search progress and key metrics
        </p>
      </div>

      <svg width={width} height={height} className="overflow-visible">
        <defs>
          {/* Gradients for enhanced visual appeal */}
          <linearGradient id="appliedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={statusColors.Applied} stopOpacity="0.8" />
            <stop offset="100%" stopColor={statusColors.Applied} stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="interviewingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={statusColors.Interviewing} stopOpacity="0.8" />
            <stop offset="100%" stopColor={statusColors.Interviewing} stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="offeredGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={statusColors.Offered} stopOpacity="0.8" />
            <stop offset="100%" stopColor={statusColors.Offered} stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="rejectedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={statusColors.Rejected} stopOpacity="0.8" />
            <stop offset="100%" stopColor={statusColors.Rejected} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Title */}
          <text
            x={chartWidth / 2}
            y={-10}
            textAnchor="middle"
            className="text-sm font-medium fill-light-text dark:fill-dark-text"
          >
            Application Status Flow
          </text>

          {/* Flow visualization */}
          <g className="flow-chart">
            {/* Applied section */}
            {appliedWidth > 0 && (
              <g>
                <rect
                  x={0}
                  y={flowHeight * 0.1}
                  width={appliedWidth}
                  height={flowHeight * 0.2}
                  fill="url(#appliedGradient)"
                  rx="4"
                />
                <text
                  x={appliedWidth / 2}
                  y={flowHeight * 0.2 + 4}
                  textAnchor="middle"
                  className="text-xs font-medium fill-white"
                >
                  Applied ({currentStatus.Applied})
                </text>
              </g>
            )}

            {/* Interviewing section */}
            {interviewingWidth > 0 && (
              <g>
                <rect
                  x={0}
                  y={flowHeight * 0.4}
                  width={interviewingWidth}
                  height={flowHeight * 0.2}
                  fill="url(#interviewingGradient)"
                  rx="4"
                />
                <text
                  x={interviewingWidth / 2}
                  y={flowHeight * 0.5 + 4}
                  textAnchor="middle"
                  className="text-xs font-medium fill-white"
                >
                  Interviewing ({currentStatus.Interviewing})
                </text>
              </g>
            )}

            {/* Offered section */}
            {offeredWidth > 0 && (
              <g>
                <rect
                  x={chartWidth - offeredWidth}
                  y={flowHeight * 0.1}
                  width={offeredWidth}
                  height={flowHeight * 0.15}
                  fill="url(#offeredGradient)"
                  rx="4"
                />
                <text
                  x={chartWidth - offeredWidth / 2}
                  y={flowHeight * 0.175 + 4}
                  textAnchor="middle"
                  className="text-xs font-medium fill-white"
                >
                  Offered ({currentStatus.Offered})
                </text>
              </g>
            )}

            {/* Rejected section */}
            {rejectedWidth > 0 && (
              <g>
                <rect
                  x={chartWidth - rejectedWidth}
                  y={flowHeight * 0.3}
                  width={rejectedWidth}
                  height={flowHeight * 0.15}
                  fill="url(#rejectedGradient)"
                  rx="4"
                />
                <text
                  x={chartWidth - rejectedWidth / 2}
                  y={flowHeight * 0.375 + 4}
                  textAnchor="middle"
                  className="text-xs font-medium fill-white"
                >
                  Rejected ({currentStatus.Rejected})
                </text>
              </g>
            )}

            {/* Flow arrows (simplified) */}
            {interviewingWidth > 0 && appliedWidth > 0 && (
              <path
                d={`M ${appliedWidth} ${flowHeight * 0.2} Q ${(appliedWidth + interviewingWidth) / 2} ${flowHeight * 0.25} ${interviewingWidth} ${flowHeight * 0.4}`}
                stroke={statusColors.Interviewing}
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                markerEnd="url(#arrowhead)"
              />
            )}
          </g>

          {/* Key metrics section */}
          <g transform={`translate(0, ${flowHeight + 40})`} className="metrics-section">
            {/* Metrics grid */}
            <g className="metrics-grid">
              {/* Success Rate */}
              <g transform="translate(0, 0)">
                <circle
                  cx="30"
                  cy="20"
                  r="25"
                  fill={statusColors.Offered}
                  opacity="0.2"
                />
                <circle
                  cx="30"
                  cy="20"
                  r={20 * (stats.successRate / 100)}
                  fill={statusColors.Offered}
                  opacity="0.8"
                />
                <text
                  x="30"
                  y="25"
                  textAnchor="middle"
                  className="text-xs font-bold fill-light-text dark:fill-dark-text"
                >
                  {stats.successRate.toFixed(0)}%
                </text>
                <text
                  x="30"
                  y="50"
                  textAnchor="middle"
                  className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
                >
                  Success Rate
                </text>
              </g>

              {/* Interview Rate */}
              <g transform="translate(140, 0)">
                <circle
                  cx="30"
                  cy="20"
                  r="25"
                  fill={statusColors.Interviewing}
                  opacity="0.2"
                />
                <circle
                  cx="30"
                  cy="20"
                  r={20 * (interviewRate / 100)}
                  fill={statusColors.Interviewing}
                  opacity="0.8"
                />
                <text
                  x="30"
                  y="25"
                  textAnchor="middle"
                  className="text-xs font-bold fill-light-text dark:fill-dark-text"
                >
                  {interviewRate.toFixed(0)}%
                </text>
                <text
                  x="30"
                  y="50"
                  textAnchor="middle"
                  className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
                >
                  Interview Rate
                </text>
              </g>

              {/* Active Applications */}
              <g transform="translate(280, 0)">
                <rect
                  x="5"
                  y="5"
                  width="50"
                  height="30"
                  fill={statusColors.Applied}
                  opacity="0.2"
                  rx="4"
                />
                <text
                  x="30"
                  y="25"
                  textAnchor="middle"
                  className="text-sm font-bold fill-light-text dark:fill-dark-text"
                >
                  {activeApplications}
                </text>
                <text
                  x="30"
                  y="50"
                  textAnchor="middle"
                  className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
                >
                  Active Apps
                </text>
              </g>

              {/* Upcoming Interviews */}
              <g transform="translate(420, 0)">
                <rect
                  x="5"
                  y="5"
                  width="50"
                  height="30"
                  fill="#4facfe"
                  opacity="0.2"
                  rx="4"
                />
                <text
                  x="30"
                  y="25"
                  textAnchor="middle"
                  className="text-sm font-bold fill-light-text dark:fill-dark-text"
                >
                  {interviewStats.upcoming}
                </text>
                <text
                  x="30"
                  y="50"
                  textAnchor="middle"
                  className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
                >
                  Upcoming
                </text>
              </g>

              {/* Response Time */}
              <g transform="translate(560, 0)">
                <rect
                  x="5"
                  y="5"
                  width="50"
                  height="30"
                  fill="#f093fb"
                  opacity="0.2"
                  rx="4"
                />
                <text
                  x="30"
                  y="25"
                  textAnchor="middle"
                  className="text-sm font-bold fill-light-text dark:fill-dark-text"
                >
                  {stats.averageResponseTime}d
                </text>
                <text
                  x="30"
                  y="50"
                  textAnchor="middle"
                  className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
                >
                  Avg Response
                </text>
              </g>
            </g>
          </g>
        </g>

        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={statusColors.Interviewing}
              opacity="0.6"
            />
          </marker>
        </defs>
      </svg>

      {/* Additional insights below the chart */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {((activeApplications / (stats.total || 1)) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-blue-500 dark:text-blue-300">
            Applications Active
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {interviewStats.conversionRate.toFixed(0)}%
          </div>
          <div className="text-xs text-green-500 dark:text-green-300">
            Interview Conversion
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-r from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {interviewStats.averagePerApplication.toFixed(1)}
          </div>
          <div className="text-xs text-purple-500 dark:text-purple-300">
            Interviews/App
          </div>
        </div>
        
        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {completedApplications}
          </div>
          <div className="text-xs text-amber-500 dark:text-amber-300">
            Completed
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComprehensiveOverviewChart; 