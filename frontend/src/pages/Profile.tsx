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
    <div className="min-h-screen bg-gray-50">
      <MenuBar />
      
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{profile.location}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Bio</h2>
                  {isEditing ? (
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{profile.bio}</p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Skills</h2>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.skills.join(', ')}
                      onChange={(e) => setProfile({
                        ...profile,
                        skills: e.target.value.split(',').map(skill => skill.trim())
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Job Preferences */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Job Preferences</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Job Types</label>
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {profile.preferences.jobTypes.map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Preferred Locations</label>
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {profile.preferences.locations.map((location) => (
                            <span
                              key={location}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                            >
                              {location}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salary Range</label>
                      {isEditing ? (
                        <div className="mt-1 flex space-x-4">
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
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="flex items-center">to</span>
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
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">
                          ${profile.preferences.salaryRange.min.toLocaleString()} - ${profile.preferences.salaryRange.max.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
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