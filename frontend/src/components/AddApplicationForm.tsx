import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { jobParsingService } from '../services/jobParsingService';
import MenuBar from './MenuBar';

interface ApplicationFormData {
  company: string;
  jobTitle: string;
  location: string;
  url: string;
  description: string;
  compensation: number;
  experienceLevel: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';
  applicationDate: string;
}

function AddApplicationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ApplicationFormData>({
    company: '',
    jobTitle: '',
    location: '',
    url: '',
    description: '',
    compensation: 0,
    experienceLevel: '',
    status: 'Applied',
    applicationDate: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await applicationService.createApplication(formData);
      navigate('/dashboard'); // Redirect to dashboard after successful submission
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'compensation' ? parseFloat(value) : value,
    }));
  };

  const handleParseUrl = async () => {
    if (!formData.url.trim()) {
      setError('Please enter a URL to parse');
      return;
    }

    setIsParsing(true);
    setError(null);
    setParseSuccess(null);

    try {
      const result = await jobParsingService.parseJobUrl(formData.url);
      
      if (result.successful) {
        // Update form data with parsed information
        setFormData(prev => ({
          ...prev,
          company: result.company || prev.company,
          jobTitle: result.jobTitle || prev.jobTitle,
          location: result.location || prev.location,
          description: result.description || prev.description,
          compensation: result.compensation || prev.compensation,
          experienceLevel: result.experienceLevel || prev.experienceLevel,
        }));
        
        setParseSuccess(`Successfully parsed job information from ${result.source} parser`);
      } else {
        setError(result.errorMessage || 'Failed to parse URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse URL');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <MenuBar />
      
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">Add New Job Application</h2>
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3">
                <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            {parseSuccess && (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-3">
                <p className="text-green-800 dark:text-green-400 text-sm">{parseSuccess}</p>
              </div>
            )}

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Job URL
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  className="flex-1 rounded-l-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="https://example.com/jobs/123"
                />
                <button
                  type="button"
                  onClick={handleParseUrl}
                  disabled={isParsing || !formData.url.trim()}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-light-border dark:border-dark-border rounded-r-md bg-primary text-white text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isParsing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Parsing...
                    </>
                  ) : (
                    'Parse URL'
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Enter a job URL and click "Parse URL" to automatically fill in the job details
              </p>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Job Title *
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                required
                value={formData.jobTitle}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Job Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="compensation" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Compensation
              </label>
              <input
                type="number"
                id="compensation"
                name="compensation"
                value={formData.compensation}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="">Not specified</option>
                <option value="JUNIOR">Junior (0-2 years)</option>
                <option value="MID">Mid-level (2-5 years)</option>
                <option value="SENIOR">Senior (5+ years)</option>
                <option value="LEAD">Lead/Principal (8+ years)</option>
                <option value="EXECUTIVE">Executive/Director</option>
              </select>
              <p className="mt-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Optional - This field helps categorize the role level
              </p>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="applicationDate" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Application Date *
              </label>
              <input
                type="date"
                id="applicationDate"
                name="applicationDate"
                required
                value={formData.applicationDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting}
                className="px-4 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-light-text dark:text-dark-text bg-light-surface dark:bg-dark-surface hover:bg-light-background dark:hover:bg-dark-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddApplicationForm; 