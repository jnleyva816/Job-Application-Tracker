import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuBar from '../components/MenuBar';
import { applicationService, type JobApplication } from '../services/applicationService';
import { interviewService, type Interview, type InterviewType, type InterviewStatus } from '../services/interviewService';

function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]);
  const [interviewStatuses, setInterviewStatuses] = useState<InterviewStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<Interview | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<Interview | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState<JobApplication | null>(null);
  const [newInterview, setNewInterview] = useState<Omit<Interview, 'id' | 'application'>>({
    type: '',
    interviewDate: '',
    notes: '',
    status: 'SCHEDULED',
    interviewerName: '',
    interviewerEmail: '',
    location: '',
    durationMinutes: undefined,
    meetingLink: ''
  });

  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    reason: ''
  });

  const [cancelReason, setCancelReason] = useState('');

  const fetchApplicationAndInterviews = useCallback(async () => {
    if (!id) {
      setError('No application ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

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
        setInterviews([]);
        setError(`Failed to load interviews: ${interviewError instanceof Error ? interviewError.message : 'Unknown error'}`);
      }

      // Fetch interview types and statuses
      try {
        const [typesData, statusesData] = await Promise.all([
          interviewService.getInterviewTypes(),
          interviewService.getInterviewStatuses()
        ]);
        setInterviewTypes(typesData);
        setInterviewStatuses(statusesData);
      } catch (err) {
        console.error('Failed to fetch interview options:', err);
        // Set default values if API fails
        setInterviewTypes([
          { value: 'TECHNICAL_INTERVIEW', label: 'Technical Interview' },
          { value: 'HR_INTERVIEW', label: 'HR Interview' },
          { value: 'BEHAVIORAL_INTERVIEW', label: 'Behavioral Interview' },
          { value: 'PHONE_SCREENING', label: 'Phone Screening' },
          { value: 'FINAL_INTERVIEW', label: 'Final Interview' },
          { value: 'OTHER', label: 'Other' }
        ]);
        setInterviewStatuses([
          { value: 'SCHEDULED', label: 'Scheduled' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'CANCELLED', label: 'Cancelled' },
          { value: 'RESCHEDULED', label: 'Rescheduled' }
        ]);
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
      navigate('/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the application');
      setShowDeleteConfirmation(false);
    }
  };

  const handleAddInterview = async () => {
    if (!id) return;

    if (!newInterview.type.trim()) {
      setError('Interview type is required');
      return;
    }
    if (!newInterview.interviewDate) {
      setError('Interview date and time is required');
      return;
    }

    try {
      const interviewData = {
        type: newInterview.type.trim(),
        interviewDate: newInterview.interviewDate,
        notes: newInterview.notes?.trim() || '',
        status: newInterview.status || 'SCHEDULED',
        interviewerName: newInterview.interviewerName?.trim() || '',
        interviewerEmail: newInterview.interviewerEmail?.trim() || '',
        location: newInterview.location?.trim() || '',
        durationMinutes: newInterview.durationMinutes || undefined,
        meetingLink: newInterview.meetingLink?.trim() || ''
      };

      console.log('Submitting interview data:', interviewData);
      
      const createdInterview = await interviewService.createInterview(id, interviewData);
      setInterviews(prev => [...prev, createdInterview]);
      setShowAddInterview(false);
      setNewInterview({
        type: '',
        interviewDate: '',
        notes: '',
        status: 'SCHEDULED',
        interviewerName: '',
        interviewerEmail: '',
        location: '',
        durationMinutes: undefined,
        meetingLink: ''
      });
      setError(null);
    } catch (err) {
      console.error('Error adding interview:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while adding interview');
    }
  };

  const handleEditInterview = async () => {
    if (!id || !editingInterview?.id) return;

    try {
      const updatedInterview = await interviewService.updateInterview(
        id, 
        editingInterview.id.toString(), 
        editingInterview
      );
      setInterviews(prev => 
        prev.map(interview => 
          interview.id === updatedInterview.id ? updatedInterview : interview
        )
      );
      setEditingInterview(null);
      setError(null);
    } catch (err) {
      console.error('Error updating interview:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating interview');
    }
  };

  const handleDeleteInterview = async (interviewId: number) => {
    if (!id) return;

    try {
      await interviewService.deleteInterview(id, interviewId.toString());
      setInterviews(prev => prev.filter(interview => interview.id !== interviewId));
      setError(null);
    } catch (err) {
      console.error('Error deleting interview:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting interview');
    }
  };

  const handleCancelInterview = async () => {
    if (!id || !showCancelModal?.id) return;

    try {
      const cancelledInterview = await interviewService.cancelInterview(
        id,
        showCancelModal.id.toString(),
        cancelReason
      );
      setInterviews(prev =>
        prev.map(interview =>
          interview.id === cancelledInterview.id ? cancelledInterview : interview
        )
      );
      setShowCancelModal(null);
      setCancelReason('');
      setError(null);
    } catch (err) {
      console.error('Error cancelling interview:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while cancelling interview');
    }
  };

  const handleRescheduleInterview = async () => {
    if (!id || !showRescheduleModal?.id) return;

    if (!rescheduleData.newDate) {
      setError('New date is required for rescheduling');
      return;
    }

    try {
      const rescheduledInterview = await interviewService.rescheduleInterview(
        id,
        showRescheduleModal.id.toString(),
        rescheduleData
      );
      setInterviews(prev =>
        prev.map(interview =>
          interview.id === rescheduledInterview.id ? rescheduledInterview : interview
        )
      );
      setShowRescheduleModal(null);
      setRescheduleData({ newDate: '', reason: '' });
      setError(null);
    } catch (err) {
      console.error('Error rescheduling interview:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while rescheduling interview');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'RESCHEDULED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-light-text dark:text-dark-text">Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Application Not Found</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              The application you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <button
              onClick={() => navigate('/applications')}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
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
      <div className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-red-800 dark:text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Application Details Section */}
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
                  {application.jobTitle} at {application.company}
                </h1>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Applied on {new Date(application.applicationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </>
                ) : (
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
                )}
              </div>
            </div>

            {/* Application Form */}
            {isEditing && editForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Job Title</label>
                  <input
                    type="text"
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({...editForm, jobTitle: e.target.value})}
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
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Company</p>
                  <p className="text-light-text dark:text-dark-text">{application.company}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Job Title</p>
                  <p className="text-light-text dark:text-dark-text">{application.jobTitle}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Location</p>
                  <p className="text-light-text dark:text-dark-text">{application.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    application.status === 'Applied' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    application.status === 'Interviewing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    application.status === 'Offered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {application.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Compensation</p>
                  <p className="text-light-text dark:text-dark-text">
                    {application.compensation ? `$${application.compensation.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">URL</p>
                  <p className="text-light-text dark:text-dark-text break-all">
                    {application.url ? (
                      <a 
                        href={application.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {application.url}
                      </a>
                    ) : 'Not provided'}
                  </p>
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

            {/* Add Interview Form */}
            {showAddInterview && (
              <div className="mb-6 p-4 border border-light-border dark:border-dark-border rounded-lg">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-3">Add New Interview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Type</label>
                    <select
                      value={newInterview.type}
                      onChange={(e) => setNewInterview({...newInterview, type: e.target.value})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    >
                      <option value="">Select interview type</option>
                      {interviewTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
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
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Interviewer Name</label>
                    <input
                      type="text"
                      value={newInterview.interviewerName}
                      onChange={(e) => setNewInterview({...newInterview, interviewerName: e.target.value})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Location/Meeting Link</label>
                    <input
                      type="text"
                      placeholder="Address or video call link"
                      value={newInterview.location}
                      onChange={(e) => setNewInterview({...newInterview, location: e.target.value})}
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
                      setNewInterview({
                        type: '',
                        interviewDate: '',
                        notes: '',
                        status: 'SCHEDULED',
                        interviewerName: '',
                        interviewerEmail: '',
                        location: '',
                        durationMinutes: undefined,
                        meetingLink: ''
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Edit Interview Form */}
            {editingInterview && (
              <div className="mb-6 p-4 border border-light-border dark:border-dark-border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-3">Edit Interview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Type</label>
                    <select
                      value={editingInterview.type}
                      onChange={(e) => setEditingInterview({...editingInterview, type: e.target.value})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    >
                      {interviewTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={editingInterview.interviewDate}
                      onChange={(e) => setEditingInterview({...editingInterview, interviewDate: e.target.value})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Status</label>
                    <select
                      value={editingInterview.status || 'SCHEDULED'}
                      onChange={(e) => setEditingInterview({...editingInterview, status: e.target.value})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    >
                      {interviewStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Interviewer Name</label>
                    <input
                      type="text"
                      value={editingInterview.interviewerName || ''}
                      onChange={(e) => setEditingInterview({...editingInterview, interviewerName: e.target.value})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Location</label>
                    <input
                      type="text"
                      value={editingInterview.location || ''}
                      onChange={(e) => setEditingInterview({...editingInterview, location: e.target.value})}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Notes</label>
                    <textarea
                      value={editingInterview.notes || ''}
                      onChange={(e) => setEditingInterview({...editingInterview, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditInterview}
                    className="bg-success hover:bg-success/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingInterview(null)}
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-light-text dark:text-dark-text">
                            {interviewTypes.find(t => t.value === interview.type)?.label || interview.type}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(interview.status || 'SCHEDULED')}`}>
                            {interviewStatuses.find(s => s.value === interview.status)?.label || interview.status}
                          </span>
                        </div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                          📅 {new Date(interview.interviewDate).toLocaleString()}
                          {interview.originalDate && interview.originalDate !== interview.interviewDate && (
                            <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                              (Rescheduled from {new Date(interview.originalDate).toLocaleString()})
                            </span>
                          )}
                        </p>
                        {interview.interviewerName && (
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                            👤 {interview.interviewerName}
                          </p>
                        )}
                        {interview.location && (
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1">
                            📍 {interview.location}
                          </p>
                        )}
                        {interview.notes && (
                          <p className="text-sm text-light-text dark:text-dark-text mt-2">{interview.notes}</p>
                        )}
                        {interview.cancellationReason && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                            ❌ Cancelled: {interview.cancellationReason}
                          </p>
                        )}
                        {interview.interviewFeedback && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            📝 Feedback: {interview.interviewFeedback}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setEditingInterview(interview)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        {interview.status === 'SCHEDULED' && (
                          <>
                            <button
                              onClick={() => setShowRescheduleModal(interview)}
                              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 p-1"
                              title="Reschedule"
                            >
                              📅
                            </button>
                            <button
                              onClick={() => setShowCancelModal(interview)}
                              className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 p-1"
                              title="Cancel"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => interview.id && handleDeleteInterview(interview.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Delete Application</h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                Are you sure you want to delete this application? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleDeleteApplication}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Reschedule Interview</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">New Date & Time</label>
                  <input
                    type="datetime-local"
                    value={rescheduleData.newDate}
                    onChange={(e) => setRescheduleData({...rescheduleData, newDate: e.target.value})}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Reason</label>
                  <input
                    type="text"
                    placeholder="Reason for rescheduling"
                    value={rescheduleData.reason}
                    onChange={(e) => setRescheduleData({...rescheduleData, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                  />
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleRescheduleInterview}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => {
                    setShowRescheduleModal(null);
                    setRescheduleData({ newDate: '', reason: '' });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Cancel Interview</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">Reason for cancellation</label>
                  <input
                    type="text"
                    placeholder="Why is this interview being cancelled?"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                  />
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleCancelInterview}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel Interview
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(null);
                    setCancelReason('');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Keep Interview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationDetail; 