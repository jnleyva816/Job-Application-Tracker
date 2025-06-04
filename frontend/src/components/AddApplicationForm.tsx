import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import MenuBar from './MenuBar';

interface ApplicationFormData {
  company: string;
  jobTitle: string;
  location: string;
  url: string;
  description: string;
  compensation: number;
  status: string;
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
    status: 'Applied',
    applicationDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/dashboard'); // Redirect to dashboard after successful submission
      } else {
        console.error('Failed to create application');
      }
    } catch (error) {
      console.error('Error creating application:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'compensation' ? parseFloat(value) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <MenuBar />
      
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">Add New Job Application</h2>
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label htmlFor="url" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Job URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
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
                className="px-4 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-light-text dark:text-dark-text bg-light-surface dark:bg-dark-surface hover:bg-light-background dark:hover:bg-dark-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Save Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddApplicationForm; 