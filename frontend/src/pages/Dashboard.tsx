import { useState, useEffect } from 'react';
import MenuBar from '../components/MenuBar';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

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

function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${import.meta.env.VITE_DEV_API_URL}/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <MenuBar />
      
      {/* Main Content */}
      <div className="w-full">
        {/* Header */}
        <header className="bg-light-surface dark:bg-dark-surface shadow-sm">
          <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Job Application Tracker</h1>
              <button 
                onClick={() => navigate('/add-application')}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Application
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Total Applications</h3>
              <p className="text-2xl font-semibold text-light-text dark:text-dark-text">{applications.length}</p>
            </div>
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Applied</h3>
              <p className="text-2xl font-semibold text-light-text dark:text-dark-text">
                {applications.filter(app => app.status === 'Applied').length}
              </p>
            </div>
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Interviewing</h3>
              <p className="text-2xl font-semibold text-light-text dark:text-dark-text">
                {applications.filter(app => app.status === 'Interviewing').length}
              </p>
            </div>
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Offered</h3>
              <p className="text-2xl font-semibold text-light-text dark:text-dark-text">
                {applications.filter(app => app.status === 'Offered').length}
              </p>
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-light-surface dark:bg-dark-surface shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-light-text dark:text-dark-text">Recent Applications</h2>
            </div>
            <div className="border-t border-light-border dark:border-dark-border">
              <ul className="divide-y divide-light-border dark:divide-dark-border">
                {applications.map((application) => (
                  <li key={application.id} className="px-4 py-4 sm:px-6 hover:bg-light-background/50 dark:hover:bg-dark-background/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-medium text-light-text dark:text-dark-text">{application.jobTitle}</h3>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{application.company}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          Applied: {new Date(application.applicationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard; 