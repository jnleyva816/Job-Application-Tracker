import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobApplication } from '../services/applicationService';

interface ApplicationsViewProps {
  applications: JobApplication[];
  isLoading: boolean;
  error: string | null;
}

type ViewMode = 'list' | 'grid';

function ApplicationsView({ applications, isLoading, error }: ApplicationsViewProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (statusFilter && app.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFromFilter || dateToFilter) {
        const appDate = new Date(app.applicationDate + 'T00:00:00');
        appDate.setHours(0, 0, 0, 0); // Normalize to start of day
        
        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          fromDate.setHours(0, 0, 0, 0);
          if (appDate < fromDate) {
            return false;
          }
        }
        
        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          toDate.setHours(23, 59, 59, 999); // End of day
          if (appDate > toDate) {
            return false;
          }
        }
      }

      return true;
    });
  }, [applications, statusFilter, dateFromFilter, dateToFilter]);

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

  const handleJobLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <div 
              data-testid="loading-spinner"
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"
            ></div>
            <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
              Loading applications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="bg-light-surface dark:bg-dark-surface shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-light-text dark:text-dark-text">View:</span>
            <div className="flex rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
              <button
                data-testid="list-toggle-button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-transparent text-light-text dark:text-dark-text hover:bg-light-background dark:hover:bg-dark-background'
                }`}
              >
                List
              </button>
              <button
                data-testid="grid-toggle-button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-transparent text-light-text dark:text-dark-text hover:bg-light-background dark:hover:bg-dark-background'
                }`}
              >
                Grid
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-light-text dark:text-dark-text">
                Status:
              </label>
              <select
                data-testid="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text"
              >
                <option value="">All Status</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Date Filters */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-light-text dark:text-dark-text">
                From:
              </label>
              <input
                data-testid="date-from-filter"
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-light-text dark:text-dark-text">
                To:
              </label>
              <input
                data-testid="date-to-filter"
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text"
              />
            </div>

            {/* Clear Filters */}
            <button
              data-testid="clear-filters-button"
              onClick={clearFilters}
              className="px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications Display */}
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
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
            No applications found matching your filters
          </p>
          <button
            onClick={clearFilters}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div 
              data-testid="list-view"
              className="bg-light-surface dark:bg-dark-surface shadow overflow-hidden sm:rounded-md"
            >
              <ul className="divide-y divide-light-border dark:divide-dark-border">
                {filteredApplications.map((application) => (
                  <li 
                    key={application.id}
                    data-testid={`application-${application.id}`}
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
                          <span>Applied: {new Date(application.applicationDate + 'T00:00:00').toLocaleDateString()}</span>
                          <span>Compensation: ${application.compensation.toLocaleString()}</span>
                          <span 
                            className="text-primary hover:text-primary/80 cursor-pointer"
                            onClick={(e) => handleJobLinkClick(e, application.url)}
                          >
                            View Job Posting
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div 
              data-testid="grid-view"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  data-testid={`application-${application.id}`}
                  className="bg-light-surface dark:bg-dark-surface shadow-sm rounded-lg p-6 hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() => handleApplicationClick(application.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-light-text dark:text-dark-text hover:text-primary">
                        {application.jobTitle}
                      </h3>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {application.company}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      📍 {application.location}
                    </p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      💰 ${application.compensation.toLocaleString()}
                    </p>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      📅 Applied: {new Date(application.applicationDate + 'T00:00:00').toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 mb-2">
                      {application.description}
                    </p>
                    <button
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                      onClick={(e) => handleJobLinkClick(e, application.url)}
                    >
                      View Job Posting →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ApplicationsView; 