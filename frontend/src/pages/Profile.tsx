import { useState, useEffect } from 'react';
import MenuBar from '../components/MenuBar';
import { profileService, ProfileResponse, ProfileUpdateRequest } from '../services/profileService';

function Profile() {
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Temporary state for editing
  const [editForm, setEditForm] = useState<ProfileUpdateRequest>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfile();
      setProfileData(data);
      setEditForm({
        username: data.username,
        email: data.email,
        firstName: data.profile.firstName || '',
        lastName: data.profile.lastName || '',
        bio: data.profile.bio || '',
        location: data.profile.location || '',
        skills: data.profile.skills || '',
        jobTypes: data.profile.jobTypes || '',
        preferredLocations: data.profile.preferredLocations || '',
        salaryMin: data.profile.salaryMin || undefined,
        salaryMax: data.profile.salaryMax || undefined,
        linkedinUrl: data.profile.linkedinUrl || '',
        githubUrl: data.profile.githubUrl || '',
        portfolioUrl: data.profile.portfolioUrl || '',
        phoneNumber: data.profile.phoneNumber || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileUpdateRequest, value: string | number | undefined) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    try {
      const updatedProfile = await profileService.updateProfile(editForm);
      setProfileData(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setEditForm({
        username: profileData.username,
        email: profileData.email,
        firstName: profileData.profile.firstName || '',
        lastName: profileData.profile.lastName || '',
        bio: profileData.profile.bio || '',
        location: profileData.profile.location || '',
        skills: profileData.profile.skills || '',
        jobTypes: profileData.profile.jobTypes || '',
        preferredLocations: profileData.profile.preferredLocations || '',
        salaryMin: profileData.profile.salaryMin || undefined,
        salaryMax: profileData.profile.salaryMax || undefined,
        linkedinUrl: profileData.profile.linkedinUrl || '',
        githubUrl: profileData.profile.githubUrl || '',
        portfolioUrl: profileData.profile.portfolioUrl || '',
        phoneNumber: profileData.profile.phoneNumber || '',
      });
    }
    setIsEditing(false);
  };

  // Helper functions for parsing array data
  const parseSkills = () => profileService.parseSkills(profileData?.profile.skills);
  const parseJobTypes = () => profileService.parseJobTypes(profileData?.profile.jobTypes);
  const parsePreferredLocations = () => profileService.parsePreferredLocations(profileData?.profile.preferredLocations);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-light-text dark:text-dark-text">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background">
        <MenuBar />
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="text-red-600 dark:text-red-400">Failed to load profile</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <MenuBar />
      
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Profile</h1>
            <button
              onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={saveLoading}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-light-surface dark:bg-dark-surface shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Username</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.username || ''}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">{profileData.username}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">{profileData.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.firstName || ''}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">{profileData.profile.firstName || 'Not set'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.lastName || ''}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">{profileData.profile.lastName || 'Not set'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">{profileData.profile.location || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Bio</h2>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-sm text-light-text dark:text-dark-text">{profileData.profile.bio || 'No bio provided'}</p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Skills</h2>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.skills || ''}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      className="block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="React, TypeScript, Node.js (comma-separated)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {parseSkills().length > 0 ? parseSkills().map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20"
                        >
                          {skill}
                        </span>
                      )) : <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No skills listed</span>}
                    </div>
                  )}
                </div>

                {/* Job Preferences */}
                <div>
                  <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Job Preferences</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Job Types</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.jobTypes || ''}
                          onChange={(e) => handleInputChange('jobTypes', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                          placeholder="Full-time, Remote, Hybrid (comma-separated)"
                        />
                      ) : (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {parseJobTypes().length > 0 ? parseJobTypes().map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success dark:bg-success/20"
                            >
                              {type}
                            </span>
                          )) : <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No job types specified</span>}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Preferred Locations</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.preferredLocations || ''}
                          onChange={(e) => handleInputChange('preferredLocations', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                          placeholder="San Francisco, Remote, New York (comma-separated)"
                        />
                      ) : (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {parsePreferredLocations().length > 0 ? parsePreferredLocations().map((location) => (
                            <span
                              key={location}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info/10 text-info dark:bg-info/20"
                            >
                              {location}
                            </span>
                          )) : <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">No location preferences set</span>}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Salary Range</label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-light-text-secondary dark:text-dark-text-secondary">Minimum</label>
                            <input
                              type="number"
                              value={editForm.salaryMin || ''}
                              onChange={(e) => handleInputChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                              placeholder="80000"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-light-text-secondary dark:text-dark-text-secondary">Maximum</label>
                            <input
                              type="number"
                              value={editForm.salaryMax || ''}
                              onChange={(e) => handleInputChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                              placeholder="120000"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">
                          {profileData.profile.salaryMin && profileData.profile.salaryMax
                            ? `$${profileData.profile.salaryMin.toLocaleString()} - $${profileData.profile.salaryMax.toLocaleString()}`
                            : 'Salary range not specified'
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact & Links */}
                <div>
                  <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Contact & Links</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editForm.phoneNumber || ''}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                          placeholder="+1 (555) 123-4567"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">{profileData.profile.phoneNumber || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">LinkedIn URL</label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={editForm.linkedinUrl || ''}
                          onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                          placeholder="https://linkedin.com/in/yourname"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">
                          {profileData.profile.linkedinUrl ? (
                            <a href={profileData.profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {profileData.profile.linkedinUrl}
                            </a>
                          ) : 'Not provided'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">GitHub URL</label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={editForm.githubUrl || ''}
                          onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                          placeholder="https://github.com/yourname"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">
                          {profileData.profile.githubUrl ? (
                            <a href={profileData.profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {profileData.profile.githubUrl}
                            </a>
                          ) : 'Not provided'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Portfolio URL</label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={editForm.portfolioUrl || ''}
                          onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                          placeholder="https://yourportfolio.com"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">
                          {profileData.profile.portfolioUrl ? (
                            <a href={profileData.profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {profileData.profile.portfolioUrl}
                            </a>
                          ) : 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saveLoading}
                      className="px-4 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-light-text dark:text-dark-text bg-light-surface dark:bg-dark-surface hover:bg-light-background dark:hover:bg-dark-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 