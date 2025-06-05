import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, ProfileUpdateRequest } from '../services/profileService';

interface ProfileSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

function ProfileSetup({ onComplete, onSkip }: ProfileSetupProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    phoneNumber: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    salaryMin: undefined,
    salaryMax: undefined,
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Skill management
  const [newSkill, setNewSkill] = useState('');
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Job type management
  const [newJobType, setNewJobType] = useState('');
  const addJobType = () => {
    if (newJobType.trim() && !jobTypes.includes(newJobType.trim())) {
      setJobTypes([...jobTypes, newJobType.trim()]);
      setNewJobType('');
    }
  };
  const removeJobType = (jobTypeToRemove: string) => {
    setJobTypes(jobTypes.filter(jobType => jobType !== jobTypeToRemove));
  };

  // Preferred location management
  const [newPreferredLocation, setNewPreferredLocation] = useState('');
  const addPreferredLocation = () => {
    if (newPreferredLocation.trim() && !preferredLocations.includes(newPreferredLocation.trim())) {
      setPreferredLocations([...preferredLocations, newPreferredLocation.trim()]);
      setNewPreferredLocation('');
    }
  };
  const removePreferredLocation = (locationToRemove: string) => {
    setPreferredLocations(preferredLocations.filter(location => location !== locationToRemove));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salaryMin' || name === 'salaryMax' 
        ? (value === '' ? undefined : parseInt(value)) 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const profileData: ProfileUpdateRequest = {
        ...formData,
        skills: skills.length > 0 ? profileService.stringifySkills(skills) : undefined,
        jobTypes: jobTypes.length > 0 ? profileService.stringifyJobTypes(jobTypes) : undefined,
        preferredLocations: preferredLocations.length > 0 ? profileService.stringifyPreferredLocations(preferredLocations) : undefined,
      };

      await profileService.completeProfile(profileData);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete profile setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-light-text dark:text-dark-text">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Help us personalize your job tracking experience (you can always update this later)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-light-surface dark:bg-dark-surface py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName || ''}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName || ''}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio || ''}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself and your professional background..."
                className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Current Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location || ''}
                  onChange={handleChange}
                  placeholder="e.g., San Francisco, CA"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  placeholder="e.g., (555) 123-4567"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-white hover:bg-primary-dark focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (e.g., JavaScript, React, Python)"
                  className="flex-1 appearance-none block px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Job Types */}
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Preferred Job Types
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {jobTypes.map((jobType, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-white"
                  >
                    {jobType}
                    <button
                      type="button"
                      onClick={() => removeJobType(jobType)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-white hover:bg-secondary-dark focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newJobType}
                  onChange={(e) => setNewJobType(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addJobType())}
                  placeholder="Add job type (e.g., Full-time, Remote, Contract)"
                  className="flex-1 appearance-none block px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addJobType}
                  className="px-4 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
                Preferred Job Locations
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {preferredLocations.map((location, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-white"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => removePreferredLocation(location)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-white hover:bg-accent-dark focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPreferredLocation}
                  onChange={(e) => setNewPreferredLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredLocation())}
                  placeholder="Add preferred location (e.g., New York, Remote, Hybrid)"
                  className="flex-1 appearance-none block px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
                <button
                  type="button"
                  onClick={addPreferredLocation}
                  className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="salaryMin" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Minimum Salary ($)
                </label>
                <input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  value={formData.salaryMin || ''}
                  onChange={handleChange}
                  placeholder="e.g., 80000"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="salaryMax" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Maximum Salary ($)
                </label>
                <input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  value={formData.salaryMax || ''}
                  onChange={handleChange}
                  placeholder="e.g., 120000"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-light-text dark:text-dark-text">
                Professional Links
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    LinkedIn URL
                  </label>
                  <input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl || ''}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                    GitHub URL
                  </label>
                  <input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    value={formData.githubUrl || ''}
                    onChange={handleChange}
                    placeholder="https://github.com/yourusername"
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="portfolioUrl" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
                  Portfolio URL
                </label>
                <input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl || ''}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm placeholder-light-text-secondary dark:placeholder-dark-text-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Complete Profile'}
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 flex justify-center py-2 px-4 border border-light-border dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary bg-light-surface dark:bg-dark-surface hover:bg-light-background dark:hover:bg-dark-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Skip for Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup; 