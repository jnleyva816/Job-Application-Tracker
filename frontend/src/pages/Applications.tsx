import { useState, useEffect } from 'react';
import MenuBar from '../components/MenuBar';
import { useNavigate } from 'react-router-dom';
import { applicationService, type JobApplication } from '../services/applicationService';

function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationService.getAllApplications();
        setApplications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">Loading applications...</p>
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
            <div className="text-center text-red-600 dark:text-red-400">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <MenuBar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">All Applications</h1>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/add-application')}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Application
              </button>
              <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors">
                Filter
              </button>
              <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors">
                Sort
              </button>
            </div>
          </div>

          <div className="bg-light-surface dark:bg-dark-surface shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-light-border dark:divide-dark-border">
              {applications.map((application) => (
                <li 
                  key={application.id} 
                  className="px-4 py-4 sm:px-6 hover:bg-light-background/50 dark:hover:bg-dark-background/50 cursor-pointer transition-colors"
                  onClick={() => handleApplicationClick(application.id)}
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-light-text dark:text-dark-text hover:text-primary">
                          {application.jobTitle}
                        </h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {application.company}
                        </p>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {application.location}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      <p className="mb-2 line-clamp-2">{application.description}</p>
                      <div className="flex flex-wrap gap-4">
                        <span>Applied: {new Date(application.applicationDate).toLocaleDateString()}</span>
                        <span>Compensation: ${application.compensation.toLocaleString()}</span>
                        <span 
                          className="text-primary hover:text-primary/80 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(application.url, '_blank');
                          }}
                        >
                          View Job Posting
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {applications.length === 0 && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Applications; 