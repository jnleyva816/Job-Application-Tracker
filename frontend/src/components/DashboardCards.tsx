import React, { useState } from 'react';

interface JobApplication {
  id: string;
  company: string;
  jobTitle: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';
  applicationDate: string;
  location: string;
  url: string;
  description: string;
  compensation: number;
}

interface Interview {
  id?: number;
  type: string;
  interviewDate: string;
  notes?: string;
  status?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  location?: string;
  durationMinutes?: number;
  cancellationReason?: string;
  meetingLink?: string;
  interviewFeedback?: string;
  originalDate?: string;
  applicationId?: string;
}

interface DashboardCardData {
  id: string;
  title: string;
  value: number;
  percentage: number;
  color: string;
  bgGradient: string;
  icon: string;
  description: string;
  details: {
    label: string;
    value: string | number;
  }[];
}

interface DashboardCardsProps {
  applications: JobApplication[];
  interviews: Interview[];
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ applications, interviews }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const total = applications.length || 1;
  const appliedCount = applications.filter(app => app.status === 'Applied').length;
  const interviewingCount = applications.filter(app => app.status === 'Interviewing').length;
  const offeredCount = applications.filter(app => app.status === 'Offered').length;
  const rejectedCount = applications.filter(app => app.status === 'Rejected').length;
  
  // Calculate success rate
  const successRate = total > 0 ? Math.round((offeredCount / total) * 100) : 0;
  
  // Calculate interview rate
  const interviewRate = total > 0 ? Math.round((interviewingCount / total) * 100) : 0;
  
  // Calculate active applications
  const activeApps = appliedCount + interviewingCount;

  // Create dashboard cards
  const dashboardCards: DashboardCardData[] = [
    {
      id: 'total',
      title: 'Total Applications',
      value: total,
      percentage: 100,
      color: '#667eea',
      bgGradient: 'from-indigo-100 to-purple-200 dark:from-indigo-600 dark:to-purple-600',
      icon: '📝',
      description: 'All job applications submitted',
      details: [
        { label: 'Total Submitted', value: total },
        { label: 'Success Rate', value: `${successRate}%` },
        { label: 'Active Applications', value: activeApps }
      ]
    },
    {
      id: 'pending',
      title: 'Pending Review',
      value: appliedCount,
      percentage: Math.round((appliedCount / total) * 100),
      color: '#fcd34d',
      bgGradient: 'from-yellow-100 to-orange-200 dark:from-yellow-600 dark:to-orange-600',
      icon: '⏳',
      description: 'Waiting for initial response',
      details: [
        { label: 'Applications', value: appliedCount },
        { label: 'Percentage', value: `${Math.round((appliedCount / total) * 100)}%` },
        { label: 'Status', value: 'Under Review' }
      ]
    },
    {
      id: 'interviewing',
      title: 'Interviewing',
      value: interviewingCount,
      percentage: Math.round((interviewingCount / total) * 100),
      color: '#fb923c',
      bgGradient: 'from-orange-100 to-red-200 dark:from-orange-600 dark:to-red-600',
      icon: '🎤',
      description: 'Active interview processes',
      details: [
        { label: 'In Process', value: interviewingCount },
        { label: 'Total Interviews', value: interviews.length },
        { label: 'Conversion Rate', value: `${interviewRate}%` }
      ]
    },
    {
      id: 'offers',
      title: 'Offers Received',
      value: offeredCount,
      percentage: Math.round((offeredCount / total) * 100),
      color: '#43e97b',
      bgGradient: 'from-green-100 to-emerald-200 dark:from-green-600 dark:to-emerald-600',
      icon: '🎉',
      description: 'Job offers received',
      details: [
        { label: 'Total Offers', value: offeredCount },
        { label: 'Success Rate', value: `${successRate}%` },
        { label: 'Percentage', value: `${Math.round((offeredCount / total) * 100)}%` }
      ]
    },
    {
      id: 'rejected',
      title: 'Not Selected',
      value: rejectedCount,
      percentage: Math.round((rejectedCount / total) * 100),
      color: '#ef4444',
      bgGradient: 'from-red-100 to-pink-200 dark:from-red-600 dark:to-pink-600',
      icon: '❌',
      description: 'Applications not moving forward',
      details: [
        { label: 'Total Rejected', value: rejectedCount },
        { label: 'Percentage', value: `${Math.round((rejectedCount / total) * 100)}%` },
        { label: 'Learning Opportunity', value: 'Keep improving!' }
      ]
    }
  ];

  // Filter out cards with zero values except total
  const visibleCards = dashboardCards.filter(card => card.value > 0 || card.id === 'total');

  return (
    <div className="w-full mb-8">
      {/* Embedded styles for animations */}
      <style>{`
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5), 0 0 25px rgba(59, 130, 246, 0.3); }
          100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
        }
        
        .glow-animation {
          animation: glow 2s ease-in-out infinite alternate;
        }
      `}</style>

      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-2">
          Application Overview
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Track your application progress at a glance
        </p>
      </div>

      {/* Interactive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {visibleCards.map((card) => (
          <div
            key={card.id}
            className="relative group"
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Main Card */}
            <div
              className={`
                relative p-6 rounded-2xl shadow-md cursor-pointer transition-all duration-300 ease-out
                transform group-hover:scale-105 group-hover:shadow-lg
                bg-gradient-to-br ${card.bgGradient}
                border-2 border-gray-800 dark:border-gray-200
                ${hoveredCard === card.id ? 'z-50 glow-animation' : 'z-10'}
              `}
              style={{ 
                minHeight: '140px'
              }}
            >
              {/* Card Content */}
              <div className="text-center text-gray-800 dark:text-gray-200">
                <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">
                  {card.icon}
                </div>
                <h3 className="font-semibold text-sm mb-2">{card.title}</h3>
                <div className="text-2xl font-bold mb-2 transition-all duration-300 group-hover:text-3xl">
                  {card.value}
                </div>
                <div className="text-xs opacity-75">{card.percentage}% of total</div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              
              {/* Sparkle Effects */}
              {hoveredCard === card.id && (
                <>
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-gray-600 dark:bg-gray-300 rounded-full opacity-60 animate-ping"></div>
                  <div className="absolute bottom-2 left-2 w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full opacity-40 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 left-2 w-1 h-1 bg-gray-600 dark:bg-gray-300 rounded-full opacity-50 animate-ping" style={{ animationDelay: '1s' }}></div>
                </>
              )}
            </div>

            {/* Hover Popout */}
            {hoveredCard === card.id && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 min-w-[280px] max-w-sm">
                  {/* Arrow pointing up */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>
                  
                  <div className="relative">
                    <h4 className="font-semibold text-light-text dark:text-dark-text mb-2 flex items-center">
                      <span className="text-2xl mr-3">{card.icon}</span>
                      <span className="text-lg">{card.title}</span>
                    </h4>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                      {card.description}
                    </p>
                    
                    {/* Details */}
                    <div className="space-y-3">
                      {card.details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            {detail.label}:
                          </span>
                          <span className="font-semibold text-light-text dark:text-dark-text">
                            {detail.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5">
                      <div className="flex justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        <span>Progress</span>
                        <span>{card.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{
                            width: `${card.percentage}%`,
                            backgroundColor: card.color
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardCards; 