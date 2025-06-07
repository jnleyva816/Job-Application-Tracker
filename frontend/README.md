# Job Application Tracker - Frontend

A modern, responsive React frontend application built with TypeScript, Vite, and Tailwind CSS. Provides an intuitive user interface for managing job applications with comprehensive testing and development tools.

![React](https://img.shields.io/badge/React-19.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.2.0-purple.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0.16-cyan.svg)

## 🏗️ Architecture

The frontend follows a modern React architecture with clear separation of concerns:

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Shared components (Button, Modal, etc.)
│   ├── forms/       # Form components
│   └── layout/      # Layout components (Header, Sidebar, etc.)
├── pages/           # Page components and routing
├── hooks/           # Custom React hooks
├── services/        # API services and HTTP clients
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and helpers
├── store/           # State management (Context/Redux)
├── styles/          # Global styles and Tailwind config
└── assets/          # Static assets (images, icons, etc.)
```

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Build and run with Docker
docker build -t jleyva816/jobtracker-frontend:latest .
docker run -p 3000:80 \
  -e VITE_API_URL=http://localhost:8080 \
  jleyva816/jobtracker-frontend:latest
```

### Local Development

**Prerequisites:**
- Node.js 20+
- npm 10+ or yarn
- Git

**Setup:**
```bash
# Clone and navigate to frontend
git clone https://github.com/jnleyva816/Job-Application-Tracker.git
cd Job-Application-Tracker/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000

# Application Configuration
VITE_APP_NAME=Job Application Tracker
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Track your job applications efficiently

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# UI Configuration
VITE_THEME_DEFAULT=light
VITE_ITEMS_PER_PAGE=10
```

### Production Environment (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_THEME_DEFAULT=light
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server (Vite)
npm run dev:host         # Start with network access

# Building
npm run build            # Build for production
npm run preview          # Preview production build locally

# Testing
npm run test             # Run unit tests (Vitest)
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests (Playwright)
npm run test:e2e:ui      # Run E2E tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Dependencies
npm run deps:update      # Update dependencies
npm run deps:audit       # Security audit
```

### Development Server

The development server runs on `http://localhost:5173` with:

- **Hot Module Replacement (HMR)**: Instant updates without page refresh
- **TypeScript Support**: Real-time type checking
- **ESLint Integration**: Code quality checks
- **Proxy Configuration**: API requests proxied to backend

### Project Structure Details

```
frontend/
├── public/              # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   └── manifest.json
├── src/
│   ├── components/      # Reusable components
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── LoadingSpinner/
│   │   │   └── ErrorBoundary/
│   │   ├── forms/
│   │   │   ├── ApplicationForm/
│   │   │   ├── LoginForm/
│   │   │   └── RegisterForm/
│   │   └── layout/
│   │       ├── Header/
│   │       ├── Sidebar/
│   │       ├── Footer/
│   │       └── Layout/
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Applications/
│   │   ├── Login/
│   │   ├── Register/
│   │   └── Profile/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   └── useApplications.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── applications.ts
│   │   └── users.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── application.ts
│   │   ├── user.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── store/
│   │   ├── AuthContext.tsx
│   │   ├── ApplicationContext.tsx
│   │   └── GlobalContext.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── utilities.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/               # Unit tests
├── e2e-tests/          # End-to-end tests
├── .env.example        # Environment template
├── tailwind.config.js  # Tailwind configuration
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json
```

## 🎨 UI/UX Features

### Design System

**Tailwind CSS 4.0.16:**
- **Utility-first**: Rapid UI development
- **Custom Components**: Reusable design patterns
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching capability
- **Accessibility**: WCAG 2.1 AA compliance

**Component Library:**
- Button variants (primary, secondary, outline, ghost)
- Form inputs with validation states
- Modal dialogs and tooltips
- Loading states and skeletons
- Alert and notification systems

### Responsive Design

```css
/* Breakpoints */
sm: 640px    /* Small devices */
md: 768px    /* Medium devices */
lg: 1024px   /* Large devices */
xl: 1280px   /* Extra large devices */
2xl: 1536px  /* 2X large devices */
```

### Accessibility Features

- **Semantic HTML**: Proper element usage
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliance
- **Alternative Text**: Image descriptions

## 🔐 Authentication & Security

### Authentication Flow

```typescript
// Login process
const login = async (credentials: LoginCredentials) => {
  try {
    const response = await authService.login(credentials);
    setAuthToken(response.token);
    setUser(response.user);
    navigate('/dashboard');
  } catch (error) {
    setError('Invalid credentials');
  }
};

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

### Security Features

- **JWT Token Management**: Secure token storage and renewal
- **Route Protection**: Private route authentication
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: Request verification
- **Secure HTTP**: HTTPS enforcement in production
- **Content Security Policy**: Browser security headers

## 🧪 Testing Strategy

### Unit Testing (Vitest)

**Testing Framework:**
- **Vitest**: Fast unit test runner
- **React Testing Library**: Component testing
- **Mock Service Worker (MSW)**: API mocking
- **Jest DOM**: Additional matchers

**Example Test:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ApplicationCard } from './ApplicationCard';

describe('ApplicationCard', () => {
  const mockApplication = {
    id: '1',
    companyName: 'Tech Corp',
    position: 'Frontend Developer',
    status: 'APPLIED',
    applicationDate: new Date(),
  };

  it('renders application information', () => {
    render(<ApplicationCard application={mockApplication} />);
    
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('APPLIED')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<ApplicationCard application={mockApplication} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockApplication);
  });
});
```

### End-to-End Testing (Playwright)

**Test Coverage:**
- User authentication flows
- Application CRUD operations
- Navigation and routing
- Form submissions and validation
- Responsive design testing

**Example E2E Test:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Job Applications', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid=username]', 'testuser');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=login-button]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create new job application', async ({ page }) => {
    await page.click('[data-testid=new-application-button]');
    
    await page.fill('[data-testid=company-name]', 'Tech Innovations');
    await page.fill('[data-testid=position]', 'React Developer');
    await page.selectOption('[data-testid=status]', 'APPLIED');
    
    await page.click('[data-testid=save-button]');
    
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator('text=Tech Innovations')).toBeVisible();
  });
});
```

### Testing Commands

```bash
# Unit tests
npm run test                 # Run all unit tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm run test:ui             # Visual test runner

# E2E tests
npm run test:e2e            # Run E2E tests
npm run test:e2e:headed     # Run with browser UI
npm run test:e2e:debug      # Debug mode
npm run test:e2e:report     # Generate HTML report
```

## 🚀 API Integration

### HTTP Client Configuration

```typescript
// services/api.ts
import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Service Layer

```typescript
// services/applications.ts
export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  status: ApplicationStatus;
  applicationDate: Date;
  description?: string;
  notes?: string;
}

export const applicationService = {
  getAll: (): Promise<JobApplication[]> =>
    apiClient.get('/api/applications').then(res => res.data),
    
  getById: (id: string): Promise<JobApplication> =>
    apiClient.get(`/api/applications/${id}`).then(res => res.data),
    
  create: (application: CreateApplicationRequest): Promise<JobApplication> =>
    apiClient.post('/api/applications', application).then(res => res.data),
    
  update: (id: string, application: UpdateApplicationRequest): Promise<JobApplication> =>
    apiClient.put(`/api/applications/${id}`, application).then(res => res.data),
    
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/applications/${id}`),
};
```

## 🐳 Docker

### Multi-Stage Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Building & Running

```bash
# Build image
docker build -t jleyva816/jobtracker-frontend:latest .

# Run container
docker run -p 3000:80 \
  -e VITE_API_URL=http://localhost:8080 \
  jleyva816/jobtracker-frontend:latest

# Run with docker-compose
docker-compose up -d frontend
```

## 📊 Key Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.0 | UI library |
| **TypeScript** | 5.7.2 | Type safety |
| **Vite** | 6.2.0 | Build tool |
| **Tailwind CSS** | 4.0.16 | Styling framework |
| **React Router** | 7.4.0 | Client-side routing |
| **Vitest** | 3.2.2 | Unit testing |
| **Playwright** | 1.41.0 | E2E testing |
| **ESLint** | 9.21.0 | Code linting |
| **D3.js** | 7.9.0 | Data visualization |

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build:analyze
```

### Environment-Specific Builds

```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

### Deployment Strategies

**Static Hosting (Netlify, Vercel):**
```bash
# Build command
npm run build

# Output directory
dist
```

**Docker Deployment:**
```bash
# Build and push
docker build -t jleyva816/jobtracker-frontend:v1.0.0 .
docker push jleyva816/jobtracker-frontend:v1.0.0

# Deploy
docker run -d \
  --name jobtracker-frontend \
  -p 3000:80 \
  -e VITE_API_URL=https://api.yourdomain.com \
  jleyva816/jobtracker-frontend:v1.0.0
```

## 🐛 Troubleshooting

### Common Issues

**Port Conflicts:**
```bash
# Check port usage
netstat -tulpn | grep :5173

# Use different port
npm run dev -- --port 3001
```

**Build Failures:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

**Type Errors:**
```bash
# Run type checking
npm run type-check

# Update TypeScript
npm update typescript
```

**E2E Test Issues:**
```bash
# Install Playwright browsers
npx playwright install

# Run tests in headed mode
npm run test:e2e:headed
```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **File naming**: kebab-case for files, PascalCase for components
- **Import organization**: External, internal, relative imports

### Component Guidelines

```typescript
// Component template
interface Props {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

const ComponentName: React.FC<Props> = ({ 
  title, 
  onAction, 
  children 
}) => {
  // Hooks
  const [state, setState] = useState<string>('');
  
  // Event handlers
  const handleClick = useCallback(() => {
    onAction?.();
  }, [onAction]);
  
  // Render
  return (
    <div className="component-wrapper">
      <h2>{title}</h2>
      {children}
      <button onClick={handleClick}>Action</button>
    </div>
  );
};

export default ComponentName;
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Contributing Guidelines](../CONTRIBUTING/README.md)
- [Project WIKI](../WIKI/README.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using React, TypeScript, and modern web technologies**

*For issues and feature requests, please visit our [GitHub Issues](https://github.com/jnleyva816/Job-Application-Tracker/issues)*
