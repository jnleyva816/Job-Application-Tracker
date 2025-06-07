import React, { useState } from 'react';

interface ApplicationStats {
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
  offerStatusDistribution?: {
    ACCEPTED: number;
    DECLINED: number;
    PENDING: number;
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
  byMonth: Record<string, number>;
}

interface FlowNode {
  id: string;
  title: string;
  value: number;
  percentage: number;
  color: string;
  icon: string;
  x: number;
  y: number;
}

interface FlowConnection {
  from: string;
  to: string;
  value: number;
  percentage: number;
  color: string;
}

interface ApplicationFlowCardsProps {
  stats: ApplicationStats;
}

const ApplicationFlowCards: React.FC<ApplicationFlowCardsProps> = ({ stats }) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<number | null>(null);
  
  const currentStatus = stats.currentStatusDistribution || stats.byStatus;
  const total = stats.total || 1;

  // Calculate flow connections based on the original flow logic
  const calculateFlowConnections = (): FlowConnection[] => {
    const connections: FlowConnection[] = [];
    
    // From Applications to Pending
    if (currentStatus.Applied > 0) {
      connections.push({
        from: 'applications',
        to: 'pending',
        value: currentStatus.Applied,
        percentage: Math.round((currentStatus.Applied / total) * 100),
        color: '#fcd34d'
      });
    }
    
    // From Applications to Rejected (direct rejections)
    if (currentStatus.Rejected > 0) {
      connections.push({
        from: 'applications',
        to: 'rejected',
        value: currentStatus.Rejected,
        percentage: Math.round((currentStatus.Rejected / total) * 100),
        color: '#ef4444'
      });
    }
    
    // From Applications to Interviewing
    if (currentStatus.Interviewing > 0) {
      connections.push({
        from: 'applications',
        to: 'interviewing',
        value: currentStatus.Interviewing,
        percentage: Math.round((currentStatus.Interviewing / total) * 100),
        color: '#fb923c'
      });
    }
    
    // From Interviewing to Interview Records (total interviews)
    if (stats.interviewStats?.totalInterviews && stats.interviewStats.totalInterviews > 0) {
      connections.push({
        from: 'interviewing',
        to: 'interviews',
        value: stats.interviewStats.totalInterviews,
        percentage: Math.round((stats.interviewStats.totalInterviews / total) * 100),
        color: '#e879f9'
      });
    }
    
    // From Applications to Offers (direct)
    if (currentStatus.Offered > 0) {
      connections.push({
        from: 'applications',
        to: 'offers',
        value: currentStatus.Offered,
        percentage: Math.round((currentStatus.Offered / total) * 100),
        color: '#43e97b'
      });
    }
    
    return connections;
  };

  // Define flow nodes
  const flowNodes: FlowNode[] = [
    {
      id: 'applications',
      title: 'Applications',
      value: total,
      percentage: 100,
      color: '#667eea',
      icon: '📝',
      x: 80,
      y: 300
    },
    {
      id: 'pending',
      title: 'Pending',
      value: currentStatus.Applied,
      percentage: Math.round((currentStatus.Applied / total) * 100),
      color: '#fcd34d',
      icon: '⏳',
      x: 450,
      y: 80
    },
    {
      id: 'interviewing',
      title: 'Interviewing',
      value: currentStatus.Interviewing,
      percentage: Math.round((currentStatus.Interviewing / total) * 100),
      color: '#fb923c',
      icon: '🎤',
      x: 450,
      y: 240
    },
    {
      id: 'interviews',
      title: 'Total Interviews',
      value: stats.interviewStats?.totalInterviews || 0,
      percentage: Math.round(((stats.interviewStats?.totalInterviews || 0) / total) * 100),
      color: '#e879f9',
      icon: '💼',
      x: 750,
      y: 240
    },
    {
      id: 'offers',
      title: 'Offers',
      value: currentStatus.Offered,
      percentage: Math.round((currentStatus.Offered / total) * 100),
      color: '#43e97b',
      icon: '🎉',
      x: 450,
      y: 400
    },
    {
      id: 'rejected',
      title: 'Rejected',
      value: currentStatus.Rejected,
      percentage: Math.round((currentStatus.Rejected / total) * 100),
      color: '#ef4444',
      icon: '❌',
      x: 450,
      y: 560
    }
  ].filter(node => node.value > 0);

  const flowConnections = calculateFlowConnections();

  // Create SVG flow paths
  const createFlowPath = (connection: FlowConnection) => {
    const fromNode = flowNodes.find(n => n.id === connection.from);
    const toNode = flowNodes.find(n => n.id === connection.to);
    if (!fromNode || !toNode) return '';
    
    const fromX = fromNode.x + 120; // Right edge of source node (adjusted for larger nodes)
    const fromY = fromNode.y + 40; // Center of source node (adjusted for larger nodes)
    const toX = toNode.x; // Left edge of target node
    const toY = toNode.y + 40; // Center of target node (adjusted for larger nodes)
    
    const midX = (fromX + toX) / 2;
    const controlX1 = fromX + (midX - fromX) * 0.7;
    const controlX2 = toX - (toX - midX) * 0.7;
    
    return `M ${fromX} ${fromY} C ${controlX1} ${fromY} ${controlX2} ${toY} ${toX} ${toY}`;
  };

  return (
    <div className="w-full">
      {/* Embedded styles for animations */}
      <style>{`
        @keyframes flowPulse {
          0% { stroke-dashoffset: 0; opacity: 0.6; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: -20; opacity: 0.6; }
        }
        
        @keyframes nodeGlow {
          0% { filter: drop-shadow(0 0 5px currentColor); }
          50% { filter: drop-shadow(0 0 15px currentColor); }
          100% { filter: drop-shadow(0 0 5px currentColor); }
        }
        
        .flow-line {
          animation: flowPulse 3s linear infinite;
        }
        
        .node-glow {
          animation: nodeGlow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-2">
          Application Journey Flow
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Track your applications through each stage of the hiring process
        </p>
      </div>

      {/* Flow Chart Visualization */}
      <div className="relative bg-light-surface dark:bg-dark-surface rounded-2xl p-8 mb-8">
        <div className="w-full relative flex justify-center">
          <svg 
            className="w-full h-full max-w-full" 
            viewBox="0 0 1200 750"
            style={{ height: '750px', maxWidth: '100%' }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Gradient definitions for flow lines */}
              {flowConnections.map((connection, index) => (
                <linearGradient key={index} id={`flowGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={connection.color} stopOpacity="0.8" />
                  <stop offset="50%" stopColor={connection.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={connection.color} stopOpacity="0.8" />
                </linearGradient>
              ))}
              
              {/* Node shadow filters */}
              <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
              </filter>
            </defs>
            
            {/* Flow Lines */}
            {flowConnections.map((connection, index) => {
              const pathD = createFlowPath(connection);
              const strokeWidth = Math.max(8, Math.min(40, connection.value * 2));
              
              return (
                <g key={index}>
                  {/* Background flow line */}
                  <path
                    d={pathD}
                    stroke={connection.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    opacity="0.3"
                  />
                  {/* Animated flow line */}
                  <path
                    d={pathD}
                    stroke={`url(#flowGradient-${index})`}
                    strokeWidth={strokeWidth - 2}
                    fill="none"
                    strokeDasharray="15 10"
                    className={`flow-line ${hoveredConnection === index ? 'opacity-100' : 'opacity-70'}`}
                    style={{ animationDelay: `${index * 0.5}s` }}
                    onMouseEnter={() => setHoveredConnection(index)}
                    onMouseLeave={() => setHoveredConnection(null)}
                  />
                </g>
              );
            })}

            {/* Flow Nodes */}
            {flowNodes.map((node) => (
              <g key={node.id}>
                {/* Node background */}
                <rect
                  x={node.x}
                  y={node.y}
                  width="120"
                  height="80"
                  rx="16"
                  fill={node.color}
                  filter="url(#nodeShadow)"
                  className={`transition-all duration-300 cursor-pointer ${
                    hoveredNode === node.id ? 'node-glow' : ''
                  }`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
                
                {/* Node icon */}
                <text
                  x={node.x + 60}
                  y={node.y + 30}
                  textAnchor="middle"
                  className="text-2xl"
                >
                  {node.icon}
                </text>
                
                {/* Node value */}
                <text
                  x={node.x + 60}
                  y={node.y + 55}
                  textAnchor="middle"
                  className="text-lg font-bold fill-white"
                >
                  {node.value}
                </text>
                
                {/* Node title */}
                <text
                  x={node.x + 60}
                  y={node.y + 95}
                  textAnchor="middle"
                  className="text-sm font-medium fill-light-text dark:fill-dark-text"
                >
                  {node.title}
                </text>
                
                {/* Node percentage */}
                <text
                  x={node.x + 60}
                  y={node.y + 110}
                  textAnchor="middle"
                  className="text-xs fill-light-text-secondary dark:fill-dark-text-secondary"
                >
                  {node.percentage}%
                </text>

                {/* Hover tooltip */}
                {hoveredNode === node.id && (
                  <g>
                    <rect
                      x={node.x - 30}
                      y={node.y - 45}
                      width="180"
                      height="30"
                      rx="8"
                      fill="rgba(0,0,0,0.8)"
                    />
                    <text
                      x={node.x + 60}
                      y={node.y - 25}
                      textAnchor="middle"
                      className="text-sm fill-white font-medium"
                    >
                      {node.title}: {node.value} applications
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Flow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {flowConnections.map((connection, index) => {
          const fromNode = flowNodes.find(n => n.id === connection.from);
          const toNode = flowNodes.find(n => n.id === connection.to);
          if (!fromNode || !toNode) return null;
          
          return (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{fromNode.icon}</span>
                  <span className="text-sm font-medium text-light-text dark:text-dark-text">
                    {fromNode.title}
                  </span>
                </div>
                <div className="text-gray-400">→</div>
                <div className="flex items-center">
                  <span className="text-lg mr-2">{toNode.icon}</span>
                  <span className="text-sm font-medium text-light-text dark:text-dark-text">
                    {toNode.title}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold" style={{ color: connection.color }}>
                  {connection.value}
                </span>
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {connection.percentage}% of total
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${connection.percentage}%`,
                    backgroundColor: connection.color
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats Below */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-light-surface dark:bg-dark-surface rounded-lg hover:shadow-lg transition-shadow duration-300">
          <div className="text-2xl font-bold text-blue-500 mb-1">{stats.successRate}%</div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Success Rate</div>
        </div>
        <div className="text-center p-4 bg-light-surface dark:bg-dark-surface rounded-lg hover:shadow-lg transition-shadow duration-300">
          <div className="text-2xl font-bold text-green-500 mb-1">{stats.interviewStats?.conversionRate || 0}%</div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Interview Rate</div>
        </div>
        <div className="text-center p-4 bg-light-surface dark:bg-dark-surface rounded-lg hover:shadow-lg transition-shadow duration-300">
          <div className="text-2xl font-bold text-purple-500 mb-1">{stats.averageResponseTime}</div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Avg Response (days)</div>
        </div>
        <div className="text-center p-4 bg-light-surface dark:bg-dark-surface rounded-lg hover:shadow-lg transition-shadow duration-300">
          <div className="text-2xl font-bold text-orange-500 mb-1">{currentStatus.Applied + currentStatus.Interviewing}</div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Active Apps</div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFlowCards; 