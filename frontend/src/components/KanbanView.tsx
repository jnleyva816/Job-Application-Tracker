import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JobApplication, applicationService } from '../services/applicationService';

interface KanbanViewProps {
  applications: JobApplication[];
  onApplicationsChange: (applications: JobApplication[]) => void;
  isLoading: boolean;
  error: string | null;
}

interface ApplicationCardProps {
  application: JobApplication;
  onClick: (id: string) => void;
  onJobLinkClick: (e: React.MouseEvent, url: string) => void;
}

// Individual application card component
function ApplicationCard({ application, onClick, onJobLinkClick }: ApplicationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: application.id,
    data: {
      type: 'application',
      application
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger click if not dragging
    if (!isDragging) {
      onClick(application.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-4 mb-3 cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text line-clamp-2">
          {application.jobTitle}
        </h3>
      </div>
      
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
        {application.company}
      </p>
      
      <div className="space-y-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
        <p>📍 {application.location}</p>
        <p>💰 ${application.compensation.toLocaleString()}</p>
        <p>📅 {new Date(application.applicationDate + 'T00:00:00').toLocaleDateString()}</p>
      </div>
      
      <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border">
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 mb-2">
          {application.description}
        </p>
        <button
          className="text-primary hover:text-primary/80 text-xs font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onJobLinkClick(e, application.url);
          }}
        >
          View Job Posting →
        </button>
      </div>
    </div>
  );
}

// Kanban column component
interface KanbanColumnProps {
  status: JobApplication['status'];
  applications: JobApplication[];
  onApplicationClick: (id: string) => void;
  onJobLinkClick: (e: React.MouseEvent, url: string) => void;
  title: string;
  colorClass: string;
}

function KanbanColumn({ status, applications, onApplicationClick, onJobLinkClick, title, colorClass }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${status.toLowerCase()}-column`,
    data: {
      type: 'column',
      status: status
    }
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-4 h-full">
        <div className={`flex flex-col items-center mb-4 pb-3 border-b-2 ${colorClass}`}>
          <h2 className="font-bold text-lg text-light-text dark:text-dark-text mb-2">
            {title}
          </h2>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getCountBadgeColors(status)}`}>
            {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </span>
        </div>
        
        <div
          ref={setNodeRef}
          className={`min-h-[400px] transition-colors ${
            isOver ? 'bg-primary/10 rounded-lg' : ''
          }`}
        >
          <SortableContext items={applications.map(app => app.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onClick={onApplicationClick}
                  onJobLinkClick={onJobLinkClick}
                />
              ))}
              {applications.length === 0 && (
                <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary text-sm">
                  {isOver ? 'Drop here to change status' : 'No applications'}
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

// Helper function to get appropriate colors for count badges
function getCountBadgeColors(status: JobApplication['status']) {
  switch (status) {
    case 'Applied':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'Interviewing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'Offered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'Rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }
}

// Helper function to get appropriate border colors for columns
function getColumnBorderColors(status: JobApplication['status']) {
  switch (status) {
    case 'Applied':
      return 'border-blue-500 dark:border-blue-400';
    case 'Interviewing':
      return 'border-yellow-500 dark:border-yellow-400';
    case 'Offered':
      return 'border-green-500 dark:border-green-400';
    case 'Rejected':
      return 'border-red-500 dark:border-red-400';
  }
}

function KanbanView({ applications, onApplicationsChange, isLoading, error }: KanbanViewProps) {
  const navigate = useNavigate();
  const [activeApplication, setActiveApplication] = useState<JobApplication | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group applications by status
  const applicationsByStatus = {
    Applied: applications.filter(app => app.status === 'Applied'),
    Interviewing: applications.filter(app => app.status === 'Interviewing'),
    Offered: applications.filter(app => app.status === 'Offered'),
    Rejected: applications.filter(app => app.status === 'Rejected'),
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const application = applications.find(app => app.id === active.id);
    if (application) {
      setActiveApplication(application);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This could be used for visual feedback during drag
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApplication(null);

    if (!over) return;

    const activeId = active.id as string;
    const activeApplication = applications.find(app => app.id === activeId);
    if (!activeApplication) return;

    // Determine the new status based on where it was dropped
    let newStatus: JobApplication['status'] | null = null;
    
    // Check if dropped on a column
    if (over.data.current?.type === 'column') {
      newStatus = over.data.current.status;
    } else if (over.data.current?.type === 'application') {
      // Dropped on another application - use that application's status
      const overApplication = applications.find(app => app.id === over.id);
      if (overApplication) {
        newStatus = overApplication.status;
      }
    }

    // Only update if status actually changed
    if (newStatus && newStatus !== activeApplication.status) {
      setIsUpdating(true);
      try {
        const updatedApplication = { ...activeApplication, status: newStatus };
        await applicationService.updateApplication(activeApplication.id, updatedApplication);
        
        // Update local state
        const updatedApplications = applications.map(app =>
          app.id === activeApplication.id ? updatedApplication : app
        );
        onApplicationsChange(updatedApplications);
      } catch (error) {
        console.error('Failed to update application status:', error);
        // You might want to show a toast notification here
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleApplicationClick = (applicationId: string) => {
    navigate(`/applications/${applicationId}`);
  };

  const handleJobLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
          Loading applications...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isUpdating && (
        <div className="fixed top-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Updating status...
        </div>
      )}
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[500px]">
          <KanbanColumn
            status="Applied"
            applications={applicationsByStatus.Applied}
            onApplicationClick={handleApplicationClick}
            onJobLinkClick={handleJobLinkClick}
            title="Applied"
            colorClass={getColumnBorderColors('Applied')}
          />
          <KanbanColumn
            status="Interviewing"
            applications={applicationsByStatus.Interviewing}
            onApplicationClick={handleApplicationClick}
            onJobLinkClick={handleJobLinkClick}
            title="Interviewing"
            colorClass={getColumnBorderColors('Interviewing')}
          />
          <KanbanColumn
            status="Offered"
            applications={applicationsByStatus.Offered}
            onApplicationClick={handleApplicationClick}
            onJobLinkClick={handleJobLinkClick}
            title="Offered"
            colorClass={getColumnBorderColors('Offered')}
          />
          <KanbanColumn
            status="Rejected"
            applications={applicationsByStatus.Rejected}
            onApplicationClick={handleApplicationClick}
            onJobLinkClick={handleJobLinkClick}
            title="Rejected"
            colorClass={getColumnBorderColors('Rejected')}
          />
        </div>

        <DragOverlay>
          {activeApplication ? (
            <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-4 shadow-lg transform rotate-2 opacity-90">
              <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">
                {activeApplication.jobTitle}
              </h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {activeApplication.company}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default KanbanView; 