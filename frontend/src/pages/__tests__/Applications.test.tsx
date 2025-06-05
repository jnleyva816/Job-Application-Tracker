import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Applications from '../Applications'
import { applicationService } from '../../services/applicationService'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock the ApplicationsView component since we've already tested it thoroughly
vi.mock('../../components/ApplicationsView', () => ({
  default: ({ applications, isLoading, error }: any) => {
    if (isLoading) return <div data-testid="loading">Loading applications...</div>
    if (error) return <div data-testid="error">{error}</div>
    return (
      <div data-testid="applications-view">
        <div>Applications View with {applications.length} applications</div>
      </div>
    )
  }
}))

vi.mock('../../services/applicationService', () => ({
  applicationService: {
    getAllApplications: vi.fn(),
  },
}))

const mockApplications = [
  {
    id: '1',
    company: 'Tech Corp',
    jobTitle: 'Frontend Developer',
    status: 'Applied' as const,
    applicationDate: '2024-01-15',
    location: 'San Francisco, CA',
    url: 'https://example.com/job1',
    description: 'Exciting frontend role',
    compensation: 120000,
  },
  {
    id: '2',
    company: 'StartupXYZ',
    jobTitle: 'React Developer',
    status: 'Interviewing' as const,
    applicationDate: '2024-01-10',
    location: 'Remote',
    url: 'https://example.com/job2',
    description: 'Remote React position',
    compensation: 95000,
  },
]

const renderApplications = () => {
  return render(
    <BrowserRouter>
      <Applications />
    </BrowserRouter>
  )
}

describe('Applications Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the page header with title and add button', () => {
    vi.mocked(applicationService.getAllApplications).mockResolvedValue(mockApplications)
    
    renderApplications()
    
    expect(screen.getByText('All Applications')).toBeInTheDocument()
    expect(screen.getByText('Add Application')).toBeInTheDocument()
  })

  it('should fetch and display applications using ApplicationsView', async () => {
    vi.mocked(applicationService.getAllApplications).mockResolvedValue(mockApplications)
    
    renderApplications()
    
    await waitFor(() => {
      expect(screen.getByTestId('applications-view')).toBeInTheDocument()
      expect(screen.getByText('Applications View with 2 applications')).toBeInTheDocument()
    })

    expect(applicationService.getAllApplications).toHaveBeenCalledTimes(1)
  })

  it('should show loading state while fetching applications', () => {
    vi.mocked(applicationService.getAllApplications).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockApplications), 100))
    )
    
    renderApplications()
    
    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByText('Loading applications...')).toBeInTheDocument()
  })

  it('should show error state when fetching fails', async () => {
    const errorMessage = 'Failed to fetch applications'
    vi.mocked(applicationService.getAllApplications).mockRejectedValue(new Error(errorMessage))
    
    renderApplications()
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('should navigate to add application when button is clicked', () => {
    vi.mocked(applicationService.getAllApplications).mockResolvedValue(mockApplications)
    
    renderApplications()
    
    const addButton = screen.getByText('Add Application')
    addButton.click()
    
    expect(mockNavigate).toHaveBeenCalledWith('/add-application')
  })

  it('should have proper layout structure', () => {
    vi.mocked(applicationService.getAllApplications).mockResolvedValue(mockApplications)
    
    renderApplications()
    
    // Check for main layout elements
    const mainContainer = screen.getByText('All Applications').closest('.max-w-7xl')
    expect(mainContainer).toBeInTheDocument()
    expect(mainContainer).toHaveClass('mx-auto', 'py-6')
  })
}) 