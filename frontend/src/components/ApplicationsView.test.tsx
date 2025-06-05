import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ApplicationsView from './ApplicationsView'
import { JobApplication } from '../services/applicationService'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockApplications: JobApplication[] = [
  {
    id: '1',
    company: 'Tech Corp',
    jobTitle: 'Frontend Developer',
    status: 'Applied',
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
    status: 'Interviewing',
    applicationDate: '2024-01-10',
    location: 'Remote',
    url: 'https://example.com/job2',
    description: 'Remote React position',
    compensation: 95000,
  },
  {
    id: '3',
    company: 'BigTech Inc',
    jobTitle: 'Senior Frontend Engineer',
    status: 'Offered',
    applicationDate: '2024-01-05',
    location: 'New York, NY',
    url: 'https://example.com/job3',
    description: 'Senior level position',
    compensation: 150000,
  },
  {
    id: '4',
    company: 'Old Corp',
    jobTitle: 'Web Developer',
    status: 'Rejected',
    applicationDate: '2023-12-20',
    location: 'Chicago, IL',
    url: 'https://example.com/job4',
    description: 'Entry level position',
    compensation: 80000,
  },
]

const renderApplicationsView = (props = {}) => {
  const defaultProps = {
    applications: mockApplications,
    isLoading: false,
    error: null,
    ...props,
  }
  
  return render(
    <BrowserRouter>
      <ApplicationsView {...defaultProps} />
    </BrowserRouter>
  )
}

describe('ApplicationsView Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('View Toggle', () => {
    it('should render list view by default', () => {
      renderApplicationsView()
      
      expect(screen.getByTestId('list-view')).toBeInTheDocument()
      expect(screen.queryByTestId('grid-view')).not.toBeInTheDocument()
    })

    it('should toggle to grid view when grid button is clicked', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const gridToggleButton = screen.getByTestId('grid-toggle-button')
      await user.click(gridToggleButton)
      
      expect(screen.getByTestId('grid-view')).toBeInTheDocument()
      expect(screen.queryByTestId('list-view')).not.toBeInTheDocument()
    })

    it('should toggle back to list view when list button is clicked', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const gridToggleButton = screen.getByTestId('grid-toggle-button')
      const listToggleButton = screen.getByTestId('list-toggle-button')
      
      await user.click(gridToggleButton)
      expect(screen.getByTestId('grid-view')).toBeInTheDocument()
      
      await user.click(listToggleButton)
      expect(screen.getByTestId('list-view')).toBeInTheDocument()
    })

    it('should highlight active view toggle button', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const gridToggleButton = screen.getByTestId('grid-toggle-button')
      const listToggleButton = screen.getByTestId('list-toggle-button')
      
      // List should be active by default
      expect(listToggleButton).toHaveClass('bg-primary')
      expect(gridToggleButton).not.toHaveClass('bg-primary')
      
      await user.click(gridToggleButton)
      
      expect(gridToggleButton).toHaveClass('bg-primary')
      expect(listToggleButton).not.toHaveClass('bg-primary')
    })
  })

  describe('Status Filter', () => {
    it('should show all status filter options', () => {
      renderApplicationsView()
      
      const statusFilter = screen.getByTestId('status-filter')
      expect(statusFilter).toBeInTheDocument()
      
      expect(screen.getByRole('option', { name: 'All Status' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Applied' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Interviewing' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Offered' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Rejected' })).toBeInTheDocument()
    })

    it('should filter applications by status when status filter is changed', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const statusFilter = screen.getByTestId('status-filter')
      await user.selectOptions(statusFilter, 'Applied')
      
      // Should only show Applied applications
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.queryByText('StartupXYZ')).not.toBeInTheDocument()
      expect(screen.queryByText('BigTech Inc')).not.toBeInTheDocument()
      expect(screen.queryByText('Old Corp')).not.toBeInTheDocument()
    })

    it('should show all applications when "All Status" is selected', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const statusFilter = screen.getByTestId('status-filter')
      
      // First filter by Applied
      await user.selectOptions(statusFilter, 'Applied')
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.queryByText('StartupXYZ')).not.toBeInTheDocument()
      
      // Then select All Status
      await user.selectOptions(statusFilter, '')
      
      // Should show all applications
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.getByText('StartupXYZ')).toBeInTheDocument()
      expect(screen.getByText('BigTech Inc')).toBeInTheDocument()
      expect(screen.getByText('Old Corp')).toBeInTheDocument()
    })
  })

  describe('Date Filter', () => {
    it('should show date filter inputs', () => {
      renderApplicationsView()
      
      expect(screen.getByTestId('date-from-filter')).toBeInTheDocument()
      expect(screen.getByTestId('date-to-filter')).toBeInTheDocument()
    })

    it('should filter applications by date range', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const dateFromFilter = screen.getByTestId('date-from-filter')
      const dateToFilter = screen.getByTestId('date-to-filter')
      
      await user.clear(dateFromFilter)
      await user.type(dateFromFilter, '2024-01-06')
      await user.clear(dateToFilter)
      await user.type(dateToFilter, '2024-01-12')
      
      // Wait a moment for the filter to be applied
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Should only show applications within date range (StartupXYZ - 2024-01-10)
      expect(screen.getByText('StartupXYZ')).toBeInTheDocument()
      expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument() // 2024-01-15
      expect(screen.queryByText('BigTech Inc')).not.toBeInTheDocument() // 2024-01-05
      expect(screen.queryByText('Old Corp')).not.toBeInTheDocument() // 2023-12-20
    })

    it('should clear date filters when clear button is clicked', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const dateFromFilter = screen.getByTestId('date-from-filter')
      const dateToFilter = screen.getByTestId('date-to-filter')
      const clearFiltersButton = screen.getByTestId('clear-filters-button')
      
      await user.type(dateFromFilter, '2024-01-01')
      await user.type(dateToFilter, '2024-01-12')
      
      expect(dateFromFilter).toHaveValue('2024-01-01')
      expect(dateToFilter).toHaveValue('2024-01-12')
      
      await user.click(clearFiltersButton)
      
      expect(dateFromFilter).toHaveValue('')
      expect(dateToFilter).toHaveValue('')
    })
  })

  describe('Combined Filters', () => {
    it('should apply both status and date filters simultaneously', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const statusFilter = screen.getByTestId('status-filter')
      const dateFromFilter = screen.getByTestId('date-from-filter')
      const dateToFilter = screen.getByTestId('date-to-filter')
      
      await user.selectOptions(statusFilter, 'Applied')
      await user.type(dateFromFilter, '2024-01-01')
      await user.type(dateToFilter, '2024-01-20')
      
      // Should only show Applied applications within date range (Tech Corp)
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.queryByText('StartupXYZ')).not.toBeInTheDocument() // Interviewing status
      expect(screen.queryByText('BigTech Inc')).not.toBeInTheDocument() // Offered status
      expect(screen.queryByText('Old Corp')).not.toBeInTheDocument() // Rejected status
    })
  })

  describe('Application Interaction', () => {
    it('should navigate to application detail when application is clicked', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const applicationCard = screen.getByText('Tech Corp').closest('[data-testid^="application-"]')
      await user.click(applicationCard!)
      
      expect(mockNavigate).toHaveBeenCalledWith('/applications/1')
    })

    it('should open job URL in new tab when job link is clicked', async () => {
      const user = userEvent.setup()
      const mockOpen = vi.fn()
      window.open = mockOpen
      
      renderApplicationsView()
      
      const jobLinks = screen.getAllByText('View Job Posting')
      await user.click(jobLinks[0])
      
      expect(mockOpen).toHaveBeenCalledWith('https://example.com/job1', '_blank')
    })
  })

  describe('Loading and Error States', () => {
    it('should show loading state', () => {
      renderApplicationsView({ isLoading: true })
      
      expect(screen.getByText('Loading applications...')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should show error state', () => {
      renderApplicationsView({ error: 'Failed to fetch applications' })
      
      expect(screen.getByText('Failed to fetch applications')).toBeInTheDocument()
    })

    it('should show empty state when no applications', () => {
      renderApplicationsView({ applications: [] })
      
      expect(screen.getByText('No applications yet. Get started by adding your first application!')).toBeInTheDocument()
      expect(screen.getByText('Add Your First Application')).toBeInTheDocument()
    })

    it('should show no results message when filters return empty', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const statusFilter = screen.getByTestId('status-filter')
      await user.selectOptions(statusFilter, 'Applied')
      
      const dateFromFilter = screen.getByTestId('date-from-filter')
      const dateToFilter = screen.getByTestId('date-to-filter')
      
      // Set date range that excludes all Applied applications
      await user.type(dateFromFilter, '2024-02-01')
      await user.type(dateToFilter, '2024-02-28')
      
      expect(screen.getByText('No applications found matching your filters')).toBeInTheDocument()
    })
  })

  describe('Grid View Layout', () => {
    it('should display applications in grid format when grid view is active', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const gridToggleButton = screen.getByTestId('grid-toggle-button')
      await user.click(gridToggleButton)
      
      const gridContainer = screen.getByTestId('grid-view')
      expect(gridContainer).toHaveClass('grid')
    })

    it('should show all application details in grid cards', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const gridToggleButton = screen.getByTestId('grid-toggle-button')
      await user.click(gridToggleButton)
      
      // Check that all applications are displayed
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText('StartupXYZ')).toBeInTheDocument()
      expect(screen.getByText('React Developer')).toBeInTheDocument()
    })
  })

  describe('List View Layout', () => {
    it('should display applications in list format by default', () => {
      renderApplicationsView()
      
      const listContainer = screen.getByTestId('list-view')
      expect(listContainer).toBeInTheDocument()
      
      // Check that the ul element inside has the divide-y class
      const listElement = listContainer.querySelector('ul')
      expect(listElement).toHaveClass('divide-y')
    })

    it('should show all application details in list items', () => {
      renderApplicationsView()
      
      // Check that all applications are displayed
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText('StartupXYZ')).toBeInTheDocument()
      expect(screen.getByText('React Developer')).toBeInTheDocument()
    })
  })
}) 