const API_URL = import.meta.env.VITE_API_URL;

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface RegisterResponse {
  id: number;
  username: string;
  email: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  accountLocked: boolean;
  failedLoginAttempts: number;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateUserData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('Attempting login with:', { ...credentials, password: '[REDACTED]' });
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use default message
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Login response data:', { ...responseData, token: responseData.token ? '[REDACTED]' : null });

    localStorage.setItem('token', responseData.token);
    return responseData;
  },

  async register(data: RegisterData): Promise<RegisterResponse> {
    console.log('Attempting registration with:', { ...data, password: '[REDACTED]' });
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Registration response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use default message
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Registration response data:', responseData);

    // Registration endpoint returns user info, not a token
    // User will need to login after registration
    return responseData;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch user profile';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async updateCurrentUser(data: UpdateUserData): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update user profile';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async deleteUser(id: number): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }
  },

  async getUserById(id: number): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch user';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },
}; 