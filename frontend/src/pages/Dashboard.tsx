import { useState, useEffect } from 'react';
import MenuBar from '../components/MenuBar';
import Calendar from '../components/Calendar';
import DashboardApplicationsView from '../components/DashboardApplicationsView';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { interviewService } from '../services/interviewService';

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

function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<JobApplication[]>([]);
  const [selectedInterviews, setSelectedInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch applications
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

        // Fetch interviews
        try {
          const interviewsData = await interviewService.getAllUserInterviews();
          setInterviews(interviewsData);
        } catch (interviewError) {
          console.error('Failed to fetch interviews:', interviewError);
          // Don't throw here, just continue without interviews
          setInterviews([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const handleDateClick = (date: Date, dayApplications: JobApplication[], dayInterviews?: Interview[]) => {
    setSelectedDate(date);
    setSelectedApplications(dayApplications);
    setSelectedInterviews(dayInterviews || []);
  };

  const handleApplicationClick = (applicationId: string) => {
    navigate(`/applications/${applicationId}`);
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
              <DashboardApplicationsView applications={applications} />
            </div>

            {/* Calendar Section - Takes up 1/3 of the space */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Application Calendar</h2>
                <Calendar 
                  applications={applications} 
                  interviews={interviews}
                  onDateClick={handleDateClick}
                />
              </div>

              {/* Selected Date Applications and Interviews */}
              {selectedDate && (selectedApplications.length > 0 || selectedInterviews.length > 0) && (
                <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm p-4">
                  <h3 className="text-md font-medium text-light-text dark:text-dark-text mb-3">
                    {selectedDate.toLocaleDateString()}
                  </h3>
                  
                  {/* Applications */}
                  {selectedApplications.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Applications ({selectedApplications.length})
                      </h4>
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

                  {/* Interviews */}
                  {selectedInterviews.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                        Interviews ({selectedInterviews.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedInterviews.map((interview) => (
                          <div
                            key={interview.id}
                            className="p-3 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-background dark:hover:bg-dark-background cursor-pointer transition-colors"
                            onClick={() => interview.applicationId && handleApplicationClick(interview.applicationId)}
                          >
                            <p className="font-medium text-sm text-light-text dark:text-dark-text">
                              {interview.type}
                            </p>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                              {new Date(interview.interviewDate).toLocaleString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                            {interview.interviewerName && (
                              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                                with {interview.interviewerName}
                              </p>
                            )}
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                              interview.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              interview.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              interview.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {interview.status || 'SCHEDULED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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