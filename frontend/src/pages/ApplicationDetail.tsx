import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuBar from '../components/MenuBar';
import { applicationService, type JobApplication } from '../services/applicationService';
import { interviewService, type Interview } from '../services/interviewService';

function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState<JobApplication | null>(null);
  const [newInterview, setNewInterview] = useState<Omit<Interview, 'id' | 'application'>>({
    type: '',
    interviewDate: '',
    notes: ''
  });

  const fetchApplicationAndInterviews = useCallback(async () => {
    if (!id) {
      setError('No application ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors

      console.log('Fetching application and interviews for ID:', id);

      // Fetch application details using the service
      const appData = await applicationService.getApplicationById(id);
      console.log('Application data fetched successfully:', appData);
      setApplication(appData);
      setEditForm(appData);

      // Fetch interviews
      console.log('Fetching interviews for application ID:', id);
      try {
        const interviewsData = await interviewService.getInterviewsByApplicationId(id);
        console.log('Interviews data fetched successfully:', interviewsData);
        setInterviews(interviewsData);
      } catch (interviewError) {
        console.error('Failed to fetch interviews:', interviewError);
        // Don't fail the entire page if interviews fail to load
        setInterviews([]);
        setError(`Failed to load interviews: ${interviewError instanceof Error ? interviewError.message : 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error in fetchApplicationAndInterviews:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplicationAndInterviews();
  }, [fetchApplicationAndInterviews]);

  const handleSaveApplication = async () => {
    if (!editForm || !id) return;

    try {
      const updatedApp = await applicationService.updateApplication(id, editForm);
      setApplication(updatedApp);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    }
  };

  const handleDeleteApplication = async () => {
    if (!id) return;

    try {
      await applicationService.deleteApplication(id);
      // Navigate back to applications list after successful deletion
      navigate('/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the application');
      setShowDeleteConfirmation(false);
    }
  };

  const handleAddInterview = async () => {
    if (!id) return;

    // Validate required fields
    if (!newInterview.type.trim()) {
      setError('Interview type is required');
      return;
    }
    if (!newInterview.interviewDate) {
      setError('Interview date and time is required');
      return;
    }

    try {
      // Convert datetime-local format to ISO string for backend
      const interviewData = {
        type: newInterview.type.trim(),
        interviewDate: newInterview.interviewDate, // datetime-local already provides the right format
        notes: newInterview.notes?.trim() || ''
      };

      console.log('Submitting interview data:', interviewData);
      
      const createdInterview = await interviewService.createInterview(id, interviewData);
      setInterviews(prev => [...prev, createdInterview]);
      setShowAddInterview(false);
      setNewInterview({
        type: '',
        interviewDate: '',
        notes: ''
      });
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error adding interview:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while adding interview');
    }
  };

  const handleDeleteInterview = async (interviewId: number) => {
    if (!id) return;

    try {
      await interviewService.deleteInterview(id, interviewId.toString());
      setInterviews(prev => prev.filter(interview => interview.id !== interviewId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting interview');
    }
  };

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
            <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">Loading application...</p>
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
            <button 
              onClick={() => navigate('/applications')}
              className="mt-4 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">Application not found</p>
            <button 
              onClick={() => navigate('/applications')}
              className="mt-4 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <MenuBar />
      
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <button
                onClick={() => navigate('/applications')}
                className="text-primary hover:text-primary/80 mb-2 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Applications
              </button>
              <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                {application.jobTitle}
              </h1>
              <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">
                {application.company}
              </p>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveApplication}
                    className="bg-success hover:bg-success/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(application);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Edit Application
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Delete Application
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                  Delete Application
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                  Are you sure you want to delete this application for <strong>{application.jobTitle}</strong> at <strong>{application.company}</strong>? 
                  This action cannot be undone and will also delete all associated interviews.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="px-4 py-2 text-light-text dark:text-dark-text border border-light-border dark:border-dark-border rounded-lg hover:bg-light-background dark:hover:bg-dark-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteApplication}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete Application
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Application Details */}
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-4">Application Details</h2>
            
            {isEditing && editForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Job Title</label>
                  <input
                    type="text"
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({...editForm, jobTitle: e.target.value})}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Company</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value as JobApplication['status']})}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Compensation</label>
                  <input
                    type="number"
                    value={editForm.compensation}
                    onChange={(e) => setEditForm({...editForm, compensation: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">URL</label>
                  <input
                    type="url"
                    value={editForm.url}
                    onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Location</p>
                    <p className="text-light-text dark:text-dark-text">{application.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Compensation</p>
                    <p className="text-light-text dark:text-dark-text">${application.compensation.toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Applied Date</p>
                    <p className="text-light-text dark:text-dark-text">
                      {new Date(application.applicationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Job Posting</p>
                    <a
                      href={application.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 underline"
                    >
                      View Original Posting
                    </a>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Description</p>
                  <p className="text-light-text dark:text-dark-text">{application.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Interviews Section */}
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">Interviews</h2>
              <button
                onClick={() => setShowAddInterview(true)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Interview
              </button>
            </div>

            {/* Error message for interview loading */}
            {error && error.includes('interviews') && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchApplicationAndInterviews();
                  }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Add Interview Form */}
            {showAddInterview && (
              <div className="mb-6 p-4 border border-light-border dark:border-dark-border rounded-lg">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-3">Add New Interview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Type</label>
                    <input
                      type="text"
                      placeholder="e.g., Technical, Behavioral, HR"
                      value={newInterview.type}
                      onChange={(e) => setNewInterview({...newInterview, type: e.target.value})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={newInterview.interviewDate}
                      onChange={(e) => setNewInterview({...newInterview, interviewDate: e.target.value})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Notes</label>
                    <textarea
                      value={newInterview.notes}
                      onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddInterview}
                    className="bg-success hover:bg-success/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Interview
                  </button>
                  <button
                    onClick={() => {
                      setShowAddInterview(false);
                      setNewInterview({ type: '', interviewDate: '', notes: '' });
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Interviews List */}
            {interviews.length === 0 ? (
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-center py-4">
                No interviews scheduled yet.
              </p>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="border border-light-border dark:border-dark-border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-light-text dark:text-dark-text">{interview.type}</h4>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {new Date(interview.interviewDate).toLocaleString()}
                        </p>
                        {interview.notes && (
                          <p className="text-sm text-light-text dark:text-dark-text mt-2">{interview.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => interview.id && handleDeleteInterview(interview.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail; 