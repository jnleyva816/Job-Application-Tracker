const API_URL = import.meta.env.VITE_API_URL;

export interface UserProfile {
  id?: number;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  skills?: string;
  jobTypes?: string;
  preferredLocations?: string;
  salaryMin?: number;
  salaryMax?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  profile: UserProfile;
}

export interface ProfileUpdateRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  skills?: string;
  jobTypes?: string;
  preferredLocations?: string;
  salaryMin?: number;
  salaryMax?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  phoneNumber?: string;
}

class ProfileService {
  private apiUrl = API_URL;

  private getToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  async getProfile(): Promise<ProfileResponse> {
    const response = await fetch(`${this.apiUrl}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch profile:', response.status, errorText);
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    return response.json();
  }

  async updateProfile(profileData: ProfileUpdateRequest): Promise<ProfileResponse> {
    const response = await fetch(`${this.apiUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update profile:', response.status, errorText);
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    return response.json();
  }

  async completeProfile(profileData: ProfileUpdateRequest): Promise<ProfileResponse> {
    const response = await fetch(`${this.apiUrl}/profile/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to complete profile:', response.status, errorText);
      throw new Error(`Failed to complete profile: ${response.status}`);
    }

    return response.json();
  }

  // Helper methods for data transformation
  parseSkills(skillsString?: string): string[] {
    if (!skillsString) return [];
    try {
      return JSON.parse(skillsString);
    } catch {
      return skillsString.split(',').map(skill => skill.trim()).filter(skill => skill);
    }
  }

  stringifySkills(skills: string[]): string {
    return JSON.stringify(skills);
  }

  parseJobTypes(jobTypesString?: string): string[] {
    if (!jobTypesString) return [];
    try {
      return JSON.parse(jobTypesString);
    } catch {
      return jobTypesString.split(',').map(type => type.trim()).filter(type => type);
    }
  }

  stringifyJobTypes(jobTypes: string[]): string {
    return JSON.stringify(jobTypes);
  }

  parsePreferredLocations(locationsString?: string): string[] {
    if (!locationsString) return [];
    try {
      return JSON.parse(locationsString);
    } catch {
      return locationsString.split(',').map(location => location.trim()).filter(location => location);
    }
  }

  stringifyPreferredLocations(locations: string[]): string {
    return JSON.stringify(locations);
  }
}

export const profileService = new ProfileService(); 