import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobApplication } from '../services/applicationService';
import KanbanView from './KanbanView';

interface ApplicationsViewProps {
  applications: JobApplication[];
  onApplicationsChange?: (applications: JobApplication[]) => void;
  isLoading: boolean;
  error: string | null;
}

type ViewMode = 'list' | 'grid' | 'kanban';
type DateSortOrder = 'newest' | 'oldest' | '';

function ApplicationsView({ applications, onApplicationsChange, isLoading, error }: ApplicationsViewProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateSortOrder, setDateSortOrder] = useState<DateSortOrder>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [groupByStatus, setGroupByStatus] = useState<boolean>(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check on mount
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-switch to list view on mobile if currently on kanban
  useEffect(() => {
    if (isMobile && viewMode === 'kanban') {
      setViewMode('list');
    }
  }, [isMobile, viewMode]);

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = applications.filter((app) => {
      // Search filter - search across company, job title, location, and description
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          app.company,
          app.jobTitle,
          app.location,
          app.description
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter && app.status !== statusFilter) {
        return false;
      }

      return true;
    });

    // Date sorting
    if (dateSortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.applicationDate + 'T00:00:00').getTime();
        const dateB = new Date(b.applicationDate + 'T00:00:00').getTime();
        
        if (dateSortOrder === 'newest') {
          return dateB - dateA; // Newest first
        } else {
          return dateA - dateB; // Oldest first
        }
      });
    }

    return filtered;
  }, [applications, statusFilter, searchQuery, dateSortOrder]);

  // Group applications by status if groupByStatus is enabled
  const groupedApplications = useMemo(() => {
    if (!groupByStatus) {
      return null;
    }

    const statusOrder: JobApplication['status'][] = ['Applied', 'Interviewing', 'Offered', 'Rejected'];
    const grouped: Record<JobApplication['status'], JobApplication[]> = {
      'Applied': [],
      'Interviewing': [],
      'Offered': [],
      'Rejected': []
    };

    filteredAndSortedApplications.forEach(app => {
      grouped[app.status].push(app);
    });

    // Return in order, only including statuses that have applications
    return statusOrder
      // eslint-disable-next-line security/detect-object-injection
      .filter(status => grouped[status].length > 0)
      .map(status => ({
        status,
        // eslint-disable-next-line security/detect-object-injection
        applications: grouped[status]
      }));
  }, [filteredAndSortedApplications, groupByStatus]);

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

  const getStatusHeaderColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'Applied':
        return 'text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Interviewing':
        return 'text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'Offered':
        return 'text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'Rejected':
        return 'text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
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
    setSearchQuery('');
    setDateSortOrder('');
    setGroupByStatus(false);
  };

  const hasActiveFilters = statusFilter || searchQuery || dateSortOrder || groupByStatus;

  // For Kanban view, we don't apply status filter since the columns show all statuses
  const applicationsForKanban = useMemo(() => {
    let filtered = applications.filter((app) => {
      // Search filter - search across company, job title, location, and description
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          app.company,
          app.jobTitle,
          app.location,
          app.description
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });

    // Date sorting
    if (dateSortOrder) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.applicationDate + 'T00:00:00').getTime();
        const dateB = new Date(b.applicationDate + 'T00:00:00').getTime();
        
        if (dateSortOrder === 'newest') {
          return dateB - dateA; // Newest first
        } else {
          return dateA - dateB; // Oldest first
        }
      });
    }

    return filtered;
  }, [applications, searchQuery, dateSortOrder]);

  // Render applications in list view
  const renderListApplications = (apps: JobApplication[]) => (
    <ul className="divide-y divide-light-border dark:divide-dark-border">
      {apps.map((application) => (
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
              {!groupByStatus && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              )}
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
  );

  // Render applications in grid view
  const renderGridApplications = (apps: JobApplication[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apps.map((application) => (
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
            {!groupByStatus && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                {application.status}
              </span>
            )}
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
  );

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
      {/* Search and Controls */}
      <div className="bg-light-surface dark:bg-dark-surface shadow-sm rounded-lg p-4 mb-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              data-testid="search-input"
              type="text"
              placeholder="Search by company, job title, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text placeholder-light-text-secondary dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

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
              {/* Only show Kanban button on non-mobile devices */}
              {!isMobile && (
                <button
                  data-testid="kanban-toggle-button"
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'kanban'
                      ? 'bg-primary text-white'
                      : 'bg-transparent text-light-text dark:text-dark-text hover:bg-light-background dark:hover:bg-dark-background'
                  }`}
                >
                  Kanban
                </button>
              )}
            </div>
          </div>

          {/* Filters Toggle and Clear */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                data-testid="clear-filters-button"
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              data-testid="toggle-filters-button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-primary/10 text-primary border-primary'
                  : 'text-light-text dark:text-dark-text border-light-border dark:border-dark-border hover:bg-light-background dark:hover:bg-dark-background'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.121A1 1 0 013 6.414V4z" />
              </svg>
              Filters
              <svg className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
              {/* Status Filter - Hide for Kanban view since it shows all statuses */}
              {viewMode !== 'kanban' && (
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
              )}

              {/* Date Sort Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-light-text dark:text-dark-text">
                  Sort by Date:
                </label>
                <select
                  data-testid="date-sort-filter"
                  value={dateSortOrder}
                  onChange={(e) => setDateSortOrder(e.target.value as DateSortOrder)}
                  className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text"
                >
                  <option value="">No Sorting</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* Group by Status - Hide for Kanban view since it already groups by status */}
              {viewMode !== 'kanban' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-light-text dark:text-dark-text">
                    Group by Status:
                  </label>
                  <input
                    data-testid="group-by-status"
                    type="checkbox"
                    checked={groupByStatus}
                    onChange={(e) => setGroupByStatus(e.target.checked)}
                    className="w-4 h-4 text-primary bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border rounded focus:ring-primary focus:ring-2"
                  />
                </div>
              )}
            </div>
          </div>
        )}
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
      ) : viewMode === 'kanban' && !isMobile ? (
        // Kanban view - only show on non-mobile
        applicationsForKanban.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              No applications found matching your search and filters
            </p>
            <button
              onClick={clearFilters}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Search and Filters
            </button>
          </div>
        ) : (
          <KanbanView
            applications={applicationsForKanban}
            onApplicationsChange={onApplicationsChange || (() => {})}
            isLoading={false}
            error={null}
          />
        )
      ) : filteredAndSortedApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
            No applications found matching your search and filters
          </p>
          <button
            onClick={clearFilters}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear Search and Filters
          </button>
        </div>
      ) : (
        <>
          {groupByStatus && groupedApplications ? (
            // Grouped view
            <div className="space-y-8">
              {groupedApplications.map(({ status, applications: statusApps }) => (
                <div key={status} className="space-y-4">
                  <div className={`flex items-center justify-between py-2 px-4 border-l-4 bg-light-background/50 dark:bg-dark-background/50 ${getStatusHeaderColor(status)}`}>
                    <h3 className="text-lg font-semibold">
                      {status}
                    </h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(status)}`}>
                      {statusApps.length} {statusApps.length === 1 ? 'application' : 'applications'}
                    </span>
                  </div>
                  
                  {viewMode === 'list' ? (
                    <div className="bg-light-surface dark:bg-dark-surface shadow overflow-hidden sm:rounded-md">
                      {renderListApplications(statusApps)}
                    </div>
                  ) : (
                    renderGridApplications(statusApps)
                  )}
                </div>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div 
              data-testid="list-view"
              className="bg-light-surface dark:bg-dark-surface shadow overflow-hidden sm:rounded-md"
            >
              {renderListApplications(filteredAndSortedApplications)}
            </div>
          ) : (
            <div data-testid="grid-view">
              {renderGridApplications(filteredAndSortedApplications)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ApplicationsView; 