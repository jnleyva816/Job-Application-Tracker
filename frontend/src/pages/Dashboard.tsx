import { useState, useEffect } from 'react';
import MenuBar from '../components/MenuBar';
import Calendar from '../components/Calendar';
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/applications`, {
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

  const handleDateClick = (date: Date, dayApplications: JobApplication[]) => {
    setSelectedDate(date);
    setSelectedApplications(dayApplications);
  };

  const handleApplicationClick = (applicationId: string) => {
    navigate(`/applications/${applicationId}`);
  };

  const getRecentApplications = () => {
    return applications
      .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
      .slice(0, 8);
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
              <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Dashboard</h1>
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

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Applications Section - Takes up 2/3 of the space */}
            <div className="lg:col-span-2">
              <div className="bg-light-surface dark:bg-dark-surface shadow-sm rounded-lg overflow-hidden">
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
                  <ul className="divide-y divide-light-border dark:divide-dark-border">
                    {getRecentApplications().map((application) => (
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
                              {new Date(application.applicationDate).toLocaleDateString()}
                            </span>
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

            {/* Calendar Section - Takes up 1/3 of the space */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Application Calendar</h2>
                <Calendar 
                  applications={applications} 
                  onDateClick={handleDateClick}
                />
              </div>

              {/* Selected Date Applications */}
              {selectedDate && selectedApplications.length > 0 && (
                <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm p-4">
                  <h3 className="text-md font-medium text-light-text dark:text-dark-text mb-3">
                    Applications on {selectedDate.toLocaleDateString()}
                  </h3>
                  <div className="space-y-2">
                    {selectedApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-background dark:hover:bg-dark-background cursor-pointer transition-colors"
                        onClick={() => handleApplicationClick(app.id)}
                      >
                        <p className="font-medium text-sm text-light-text dark:text-dark-text">
                          {app.jobTitle}
                        </p>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                          {app.company}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard; 