import { useState, useMemo } from 'react';

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

interface CalendarProps {
  applications: JobApplication[];
  interviews?: Interview[];
  onDateClick?: (date: Date, applications: JobApplication[], interviews?: Interview[]) => void;
}

function Calendar({ applications, interviews = [], onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { daysInMonth, firstDayOfMonth, applicationsByDate, interviewsByDate } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Group applications by date
    const appsByDate: Record<string, JobApplication[]> = {};
    applications.forEach(app => {
      // Use a consistent date format to avoid timezone issues
      const appDate = new Date(app.applicationDate + 'T00:00:00');
      const dateKey = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, '0')}-${String(appDate.getDate()).padStart(2, '0')}`;
      if (!appsByDate[dateKey]) {
        appsByDate[dateKey] = [];
      }
      appsByDate[dateKey].push(app);
    });

    // Group interviews by date
    const interviewsByDate: Record<string, Interview[]> = {};
    interviews.forEach(interview => {
      try {
        // Parse interview date as local time to avoid timezone issues
        // If the interviewDate includes time information, extract just the date part
        let dateStr = interview.interviewDate;
        if (dateStr.includes('T')) {
          // Extract just the date part and treat as local time
          dateStr = dateStr.split('T')[0] + 'T00:00:00';
        }
        const interviewDate = new Date(dateStr);
        const dateKey = `${interviewDate.getFullYear()}-${String(interviewDate.getMonth() + 1).padStart(2, '0')}-${String(interviewDate.getDate()).padStart(2, '0')}`;
        if (!interviewsByDate[dateKey]) {
          interviewsByDate[dateKey] = [];
        }
        interviewsByDate[dateKey].push(interview);
      } catch (error) {
        console.warn('Invalid interview date:', interview.interviewDate, error);
      }
    });

    return {
      daysInMonth: lastDay.getDate(),
      firstDayOfMonth: firstDayOfWeek,
      applicationsByDate: appsByDate,
      interviewsByDate: interviewsByDate
    };
  }, [currentDate, applications, interviews]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;
    const dayApplications = applicationsByDate[dateKey] || [];
    const dayInterviews = interviewsByDate[dateKey] || [];
    
    if (onDateClick) {
      onDateClick(clickedDate, dayApplications, dayInterviews);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="aspect-square p-1 text-center text-sm"
        />
      );
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayApplications = applicationsByDate[dateKey] || [];
      const dayInterviews = interviewsByDate[dateKey] || [];
      const hasApplications = dayApplications.length > 0;
      const hasInterviews = dayInterviews.length > 0;
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          className={`
            aspect-square p-1 text-center text-sm cursor-pointer rounded-lg relative
            ${isToday ? 'bg-primary/20 border-2 border-primary' : 'hover:bg-light-background dark:hover:bg-dark-background'}
            ${(hasApplications || hasInterviews) ? 'font-bold' : ''}
          `}
          onClick={() => handleDateClick(day)}
        >
          <span className="text-light-text dark:text-dark-text">{day}</span>
          
          {/* Application indicator - blue dot at bottom */}
          {hasApplications && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
          )}
          
          {/* Interview indicator - yellow dot at top-right */}
          {hasInterviews && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" />
          )}
          
          {/* Count indicator - only show if there are multiple items */}
          {(dayApplications.length + dayInterviews.length) > 1 && (
            <div className="absolute top-0 left-0 text-xs text-primary font-bold">
              {dayApplications.length + dayInterviews.length}
            </div>
          )}
        </div>
      );
    }

    // Fill remaining cells if needed
    while (days.length < totalCells) {
      days.push(
        <div
          key={`fill-${days.length}`}
          className="aspect-square p-1 text-center text-sm"
        />
      );
    }

    return days;
  };

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-light-background dark:hover:bg-dark-background rounded-lg"
          aria-label="Previous month"
        >
          <svg className="w-4 h-4 text-light-text dark:text-dark-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-light-background dark:hover:bg-dark-background rounded-lg"
          aria-label="Next month"
        >
          <svg className="w-4 h-4 text-light-text dark:text-dark-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary p-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full" />
          <span>Applications submitted</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
          <span>Interviews scheduled</span>
        </div>
      </div>
    </div>
  );
}

export default Calendar; 