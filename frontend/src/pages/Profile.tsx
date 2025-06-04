import { useState } from 'react';
import MenuBar from '../components/MenuBar';

interface UserProfile {
  username: string;
  email: string;
  name: string;
  location: string;
  bio: string;
  skills: string[];
  preferences: {
    jobTypes: string[];
    locations: string[];
    salaryRange: {
      min: number;
      max: number;
    };
  };
}

function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    username: 'johndoe',
    email: 'john.doe@example.com',
    name: 'John Doe',
    location: 'San Francisco, CA',
    bio: 'Full-stack developer with 5 years of experience in web development.',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
    preferences: {
      jobTypes: ['Full-time', 'Remote', 'Hybrid'],
      locations: ['San Francisco', 'Remote', 'New York'],
      salaryRange: {
        min: 120000,
        max: 200000,
      },
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Here you would typically make an API call to update the profile
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <MenuBar />
      
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="bg-light-surface dark:bg-dark-surface shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">{profile.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">{profile.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">{profile.location}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Bio</h2>
                  {isEditing ? (
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                    />
                  ) : (
                    <p className="text-sm text-light-text dark:text-dark-text">{profile.bio}</p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Skills</h2>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.skills.join(', ')}
                      onChange={(e) => setProfile({
                        ...profile,
                        skills: e.target.value.split(',').map(skill => skill.trim())
                      })}
                      className="block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20"
                        >
                          {skill}
                        </span>
                      ))}
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
                          value={profile.preferences.jobTypes.join(', ')}
                          onChange={(e) => setProfile({
                            ...profile,
                            preferences: {
                              ...profile.preferences,
                              jobTypes: e.target.value.split(',').map(type => type.trim())
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                        />
                      ) : (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {profile.preferences.jobTypes.map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success dark:bg-success/20"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Preferred Locations</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.preferences.locations.join(', ')}
                          onChange={(e) => setProfile({
                            ...profile,
                            preferences: {
                              ...profile.preferences,
                              locations: e.target.value.split(',').map(location => location.trim())
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                        />
                      ) : (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {profile.preferences.locations.map((location) => (
                            <span
                              key={location}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info/10 text-info dark:bg-info/20"
                            >
                              {location}
                            </span>
                          ))}
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
                              value={profile.preferences.salaryRange.min}
                              onChange={(e) => setProfile({
                                ...profile,
                                preferences: {
                                  ...profile.preferences,
                                  salaryRange: {
                                    ...profile.preferences.salaryRange,
                                    min: parseInt(e.target.value)
                                  }
                                }
                              })}
                              className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-light-text-secondary dark:text-dark-text-secondary">Maximum</label>
                            <input
                              type="number"
                              value={profile.preferences.salaryRange.max}
                              onChange={(e) => setProfile({
                                ...profile,
                                preferences: {
                                  ...profile.preferences,
                                  salaryRange: {
                                    ...profile.preferences.salaryRange,
                                    max: parseInt(e.target.value)
                                  }
                                }
                              })}
                              className="mt-1 block w-full rounded-md border-light-border dark:border-dark-border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text shadow-sm focus:border-primary focus:ring-primary"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-light-text dark:text-dark-text">
                          ${profile.preferences.salaryRange.min.toLocaleString()} - ${profile.preferences.salaryRange.max.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-light-border dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-light-text dark:text-dark-text bg-light-surface dark:bg-dark-surface hover:bg-light-background dark:hover:bg-dark-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Save Changes
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