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
    description: 'Exciting frontend role working with React and TypeScript',
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
    description: 'Remote React position with flexible hours',
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
    description: 'Senior level position with leadership opportunities',
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
    description: 'Entry level position for beginners',
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

  describe('Search Functionality', () => {
    it('should render search input', () => {
      renderApplicationsView()
      
      const searchInput = screen.getByTestId('search-input')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('placeholder', 'Search by company, job title, location, or description...')
    })

    it('should filter applications by company name', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'Tech Corp')
      
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.queryByText('StartupXYZ')).not.toBeInTheDocument()
      expect(screen.queryByText('BigTech Inc')).not.toBeInTheDocument()
      expect(screen.queryByText('Old Corp')).not.toBeInTheDocument()
    })

    it('should filter applications by job title', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'React Developer')
      
      expect(screen.getByText('StartupXYZ')).toBeInTheDocument()
      expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument()
      expect(screen.queryByText('BigTech Inc')).not.toBeInTheDocument()
      expect(screen.queryByText('Old Corp')).not.toBeInTheDocument()
    })

    it('should filter applications by location', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'Remote')
      
      expect(screen.getByText('StartupXYZ')).toBeInTheDocument()
      expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument()
      expect(screen.queryByText('BigTech Inc')).not.toBeInTheDocument()
      expect(screen.queryByText('Old Corp')).not.toBeInTheDocument()
    })

    it('should filter applications by description', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'TypeScript')
      
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
      expect(screen.queryByText('StartupXYZ')).not.toBeInTheDocument()
      expect(screen.queryByText('BigTech Inc')).not.toBeInTheDocument()
      expect(screen.queryByText('Old Corp')).not.toBeInTheDocument()
    })

    it('should show clear button when search has text', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'search text')
      
      const clearButton = searchInput.parentElement?.querySelector('button')
      expect(clearButton).toBeInTheDocument()
    })

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'search text')
      
      const clearButton = searchInput.parentElement?.querySelector('button')
      await user.click(clearButton!)
      
      expect(searchInput).toHaveValue('')
    })

    it('should be case insensitive', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'tech corp')
      
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    })
  })

  describe('Collapsible Filters', () => {
    it('should have filters toggle button', () => {
      renderApplicationsView()
      
      const toggleButton = screen.getByTestId('toggle-filters-button')
      expect(toggleButton).toBeInTheDocument()
      expect(toggleButton).toHaveTextContent('Filters')
    })

    it('should hide filters by default', () => {
      renderApplicationsView()
      
      expect(screen.queryByTestId('status-filter')).not.toBeInTheDocument()
      expect(screen.queryByTestId('date-sort-filter')).not.toBeInTheDocument()
    })

    it('should show filters when toggle button is clicked', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const toggleButton = screen.getByTestId('toggle-filters-button')
      await user.click(toggleButton)
      
      expect(screen.getByTestId('status-filter')).toBeInTheDocument()
      expect(screen.getByTestId('date-sort-filter')).toBeInTheDocument()
    })

    it('should hide filters when toggle button is clicked again', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const toggleButton = screen.getByTestId('toggle-filters-button')
      
      // Show filters
      await user.click(toggleButton)
      expect(screen.getByTestId('status-filter')).toBeInTheDocument()
      
      // Hide filters
      await user.click(toggleButton)
      expect(screen.queryByTestId('status-filter')).not.toBeInTheDocument()
    })

    it('should show clear filters button only when filters are active', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      // No filters active initially
      expect(screen.queryByTestId('clear-filters-button')).not.toBeInTheDocument()
      
      // Add a search query
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'test')
      
      // Clear filters button should appear
      expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument()
    })
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
    beforeEach(async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const toggleButton = screen.getByTestId('toggle-filters-button')
      await user.click(toggleButton)
    })

    it('should show all status filter options', () => {
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

  describe('Date Sort Filter', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const toggleButton = screen.getByTestId('toggle-filters-button')
      await user.click(toggleButton)
    })

    it('should show date sort filter options', () => {
      const dateSortFilter = screen.getByTestId('date-sort-filter')
      expect(dateSortFilter).toBeInTheDocument()
      
      expect(screen.getByRole('option', { name: 'No Sorting' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Newest First' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Oldest First' })).toBeInTheDocument()
    })

    it('should sort applications by newest first', async () => {
      const user = userEvent.setup()
      
      const dateSortFilter = screen.getByTestId('date-sort-filter')
      await user.selectOptions(dateSortFilter, 'newest')
      
      // Get all application elements in order
      const applications = screen.getAllByTestId(/^application-/)
      
      // Tech Corp (2024-01-15) should be first, Old Corp (2023-12-20) should be last
      expect(applications[0]).toHaveTextContent('Tech Corp')
      expect(applications[applications.length - 1]).toHaveTextContent('Old Corp')
    })

    it('should sort applications by oldest first', async () => {
      const user = userEvent.setup()
      
      const dateSortFilter = screen.getByTestId('date-sort-filter')
      await user.selectOptions(dateSortFilter, 'oldest')
      
      // Get all application elements in order
      const applications = screen.getAllByTestId(/^application-/)
      
      // Old Corp (2023-12-20) should be first, Tech Corp (2024-01-15) should be last
      expect(applications[0]).toHaveTextContent('Old Corp')
      expect(applications[applications.length - 1]).toHaveTextContent('Tech Corp')
    })
  })

  describe('Combined Filters', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const toggleButton = screen.getByTestId('toggle-filters-button')
      await user.click(toggleButton)
    })

    it('should apply search and status filters simultaneously', async () => {
      const user = userEvent.setup()
      
      const searchInput = screen.getByTestId('search-input')
      const statusFilter = screen.getByTestId('status-filter')
      
      await user.type(searchInput, 'Developer')
      await user.selectOptions(statusFilter, 'Applied')
      
      // Should only show Applied applications that contain "Developer"
      expect(screen.getByText('Tech Corp')).toBeInTheDocument() // Frontend Developer, Applied
      expect(screen.queryByText('StartupXYZ')).not.toBeInTheDocument() // React Developer, but Interviewing
      expect(screen.queryByText('BigTech Inc')).not.toBeInTheDocument() // Senior Frontend Engineer, but Offered
      expect(screen.queryByText('Old Corp')).not.toBeInTheDocument() // Web Developer, but Rejected
    })

    it('should apply all filters together', async () => {
      const user = userEvent.setup()
      
      const searchInput = screen.getByTestId('search-input')
      const statusFilter = screen.getByTestId('status-filter')
      const dateSortFilter = screen.getByTestId('date-sort-filter')
      
      await user.type(searchInput, 'Developer')
      await user.selectOptions(statusFilter, 'Interviewing')
      await user.selectOptions(dateSortFilter, 'newest')
      
      // Should show only Interviewing applications containing "Developer", sorted by date
      expect(screen.getByText('StartupXYZ')).toBeInTheDocument()
      expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument()
      expect(screen.queryByText('BigTech Inc')).not.toBeInTheDocument()
      expect(screen.queryByText('Old Corp')).not.toBeInTheDocument()
    })
  })

  describe('Clear Filters', () => {
    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup()
      renderApplicationsView()
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'test search')
      
      const toggleButton = screen.getByTestId('toggle-filters-button')
      await user.click(toggleButton)
      
      const statusFilter = screen.getByTestId('status-filter')
      const dateSortFilter = screen.getByTestId('date-sort-filter')
      
      await user.selectOptions(statusFilter, 'Applied')
      await user.selectOptions(dateSortFilter, 'newest')
      
      const clearFiltersButton = screen.getByTestId('clear-filters-button')
      await user.click(clearFiltersButton)
      
      expect(searchInput).toHaveValue('')
      expect(statusFilter).toHaveValue('')
      expect(dateSortFilter).toHaveValue('')
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
      
      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'nonexistent search term')
      
      expect(screen.getByText('No applications found matching your search and filters')).toBeInTheDocument()
      expect(screen.getByText('Clear Search and Filters')).toBeInTheDocument()
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