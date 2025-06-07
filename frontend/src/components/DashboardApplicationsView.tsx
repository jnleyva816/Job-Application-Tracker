import { useNavigate } from 'react-router-dom';
import { JobApplication } from '../services/applicationService';

interface DashboardApplicationsViewProps {
  applications: JobApplication[];
}

function DashboardApplicationsView({ applications }: DashboardApplicationsViewProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'Applied':
        return 'bg-primary/10 text-primary dark:bg-primary/20';
      case 'Interviewing':
        return 'bg-accent/10 text-accent dark:bg-accent/20';
      case 'Offered':
        return 'bg-success/10 text-success dark:bg-success/20';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const handleApplicationClick = (applicationId: string) => {
    navigate(`/applications/${applicationId}`);
  };

  const recentApplications = applications
    .sort((a, b) => new Date(b.applicationDate + 'T00:00:00').getTime() - new Date(a.applicationDate + 'T00:00:00').getTime())
    .slice(0, 5);

  return (
    <div className="bg-light-surface dark:bg-dark-surface shadow-sm rounded-lg overflow-hidden" data-testid="dashboard-applications-view">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-lg font-medium text-light-text dark:text-dark-text">Recent Applications</h2>
        <button
          onClick={() => navigate('/applications')}
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          View All →
        </button>
      </div>
      <div className="border-t border-light-border dark:border-dark-border">
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              No applications yet. Get started by adding your first application!
            </p>
            <button 
              onClick={() => navigate('/add-application')}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Your First Application
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-light-border dark:divide-dark-border">
            {recentApplications.map((application) => (
              <li 
                key={application.id} 
                className="px-4 py-4 sm:px-6 hover:bg-light-background/50 dark:hover:bg-dark-background/50 cursor-pointer transition-colors"
                onClick={() => handleApplicationClick(application.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-light-text dark:text-dark-text hover:text-primary">
                      {application.jobTitle}
                    </h3>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {application.company} • {application.location}
                    </p>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                      ${application.compensation.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {new Date(application.applicationDate + 'T00:00:00').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DashboardApplicationsView; 