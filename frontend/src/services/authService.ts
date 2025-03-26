const API_URL = import.meta.env.VITE_DEV_API_URL;

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
    const responseData = await response.json();
    console.log('Login response data:', { ...responseData, token: responseData.token ? '[REDACTED]' : null });

    if (!response.ok) {
      throw new Error(responseData.message || 'Login failed');
    }

    localStorage.setItem('token', responseData.token);
    return responseData;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('Attempting registration with:', { ...data, password: '[REDACTED]' });
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Registration response status:', response.status);
    const responseData = await response.json();
    console.log('Registration response data:', { ...responseData, token: responseData.token ? '[REDACTED]' : null });

    if (!response.ok) {
      throw new Error(responseData.message || 'Registration failed');
    }

    localStorage.setItem('token', responseData.token);
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
}; 