import React from 'react';
import DonutChart from './DonutChart';

const DonutChartDemo: React.FC = () => {
  // Sample data that would cause congestion with the old chart
  const complexData = [
    { label: 'Applied', value: 25, color: '#667eea' },
    { label: 'Interviewing', value: 15, color: '#764ba2' },
    { label: 'Technical Round', value: 8, color: '#f093fb' },
    { label: 'HR Round', value: 5, color: '#4facfe' },
    { label: 'Final Round', value: 3, color: '#43e97b' },
    { label: 'Offered', value: 2, color: '#f39c12' },
    { label: 'Rejected', value: 12, color: '#e74c3c' },
    { label: 'Withdrawn', value: 1, color: '#95a5a6' }
  ];

  const simpleData = [
    { label: 'Applied', value: 10, color: '#667eea' },
    { label: 'Interviewing', value: 8, color: '#764ba2' },
    { label: 'Offered', value: 5, color: '#43e97b' },
    { label: 'Rejected', value: 2, color: '#f093fb' }
  ];

  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Donut Chart Improvements Demo
      </h1>

      {/* Simple Chart with Labels */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Simple Chart (4 items) - With Labels
        </h2>
        <div className="flex justify-center">
          <DonutChart 
            data={simpleData}
            width={400}
            height={400}
            showLabels={true}
            showPercentages={true}
            useLegend={false}
          />
        </div>
      </div>

      {/* Complex Chart with Legend */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Complex Chart (8 items) - With Legend
        </h2>
        <DonutChart 
          data={complexData}
          width={400}
          height={400}
          showLabels={false}
          showPercentages={true}
          useLegend={true}
          legendPosition="right"
        />
      </div>

      {/* Complex Chart with Smart Labels */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Complex Chart - Smart Labels (Only Large Slices)
        </h2>
        <div className="flex justify-center">
          <DonutChart 
            data={complexData}
            width={400}
            height={400}
            showLabels={true}
            showPercentages={true}
            useLegend={false}
            minSliceAngle={0.15} // Only show labels for slices > ~8.5 degrees
          />
        </div>
      </div>

      {/* Bottom Legend */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Complex Chart - Bottom Legend
        </h2>
        <DonutChart 
          data={complexData}
          width={400}
          height={400}
          showLabels={false}
          showPercentages={true}
          useLegend={true}
          legendPosition="bottom"
        />
      </div>
    </div>
  );
};

export default DonutChartDemo; 