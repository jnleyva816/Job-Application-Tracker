import { useState, useEffect } from 'react';
import MenuBar from '../components/MenuBar';
import ApplicationsView from '../components/ApplicationsView';
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

  const handleApplicationsChange = (updatedApplications: JobApplication[]) => {
    setApplications(updatedApplications);
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <MenuBar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">All Applications</h1>
            <button 
              onClick={() => navigate('/add-application')}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Application
            </button>
          </div>

          <ApplicationsView 
            applications={applications}
            onApplicationsChange={handleApplicationsChange}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default Applications; 