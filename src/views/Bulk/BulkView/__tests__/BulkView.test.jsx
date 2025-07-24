import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import BulkViewContainer from '../BulkViewContainer';
import BulkView from '../BulkView';
import renderWithProviders from '../../../../utils/renderWithProviders';

const mockProps = {
  approveBulkUpdate: vi.fn(),
  clearSelectedBulkUpdate: vi.fn(),
  deleteBulkUpdate: vi.fn(),
  displayMessage: vi.fn(),
  fetchBulkUpdate: vi.fn(),
  fetchNavigation: vi.fn(),
  getAttributeName: vi.fn((key) => key),
  isFetchingNavigation: false,
  isUpdating: false,
  items: [],
  itemsIncludeRelated: true,
  params: { id: '123' },
  navigate: vi.fn(),
  selectedBulk: null,
  updateBulkUpdate: vi.fn(),
};

const renderComponent = () => {
  const history = createBrowserHistory();
  return renderWithProviders(
    <BrowserRouter>
      <BulkViewContainer />
    </BrowserRouter>,
    { history },
  );
};

const renderBulkView = (props = {}) => {
  const history = createBrowserHistory();
  const combinedProps = { ...mockProps, ...props };
  return renderWithProviders(
    <BrowserRouter>
      <BulkView {...combinedProps} />
    </BrowserRouter>,
    { history },
  );
};

describe('<BulkView /> Enhanced Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the container correctly', () => {
    renderComponent();
  });

  it('displays the main heading', () => {
    renderBulkView();
    expect(screen.getByText('Massamuutos esikatselu')).toBeInTheDocument();
  });

  it('displays back button with correct link', () => {
    renderBulkView();
    const backLink = screen.getByRole('link', { name: /takaisin/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/bulk');
  });

  it('shows empty state when no selectedBulk provided', () => {
    renderBulkView({ selectedBulk: null });
    expect(screen.queryByText(/Paketti ID:/)).not.toBeInTheDocument();
  });

  it('calls fetchNavigation when items are empty', () => {
    const mockFetchNavigation = vi.fn();
    renderBulkView({ 
      fetchNavigation: mockFetchNavigation,
      items: [],
      itemsIncludeRelated: false
    });
    expect(mockFetchNavigation).toHaveBeenCalledWith(true);
  });

  it('displays bulk update details when selectedBulk is provided', () => {
    const mockSelectedBulk = {
      id: '456',
      created_at: '2023-01-01T00:00:00Z',
      modified_at: '2023-01-02T00:00:00Z',
      modified_by: 'test-user',
      state: 'active',
      description: 'Test bulk update description',
      is_approved: false,
      changes: {
        'func1__v1': { attributes: { test_attr: 'new_value' } }
      }
    };

    renderBulkView({ selectedBulk: mockSelectedBulk });
    
    expect(screen.getByText('Paketti ID: 456')).toBeInTheDocument();
    expect(screen.getByText(/Luotu:/)).toBeInTheDocument();
    expect(screen.getByText(/Muutettu:/)).toBeInTheDocument();
    expect(screen.getByText('Muokkaaja: test-user')).toBeInTheDocument();
    expect(screen.getByText('Muutokset: Test bulk update description')).toBeInTheDocument();
    expect(screen.getByText('Hyväksytty: Ei')).toBeInTheDocument();
  });

  it('shows approval status correctly', () => {
    const approvedBulk = {
      id: '123',
      is_approved: true,
      changes: {}
    };
    
    renderBulkView({ selectedBulk: approvedBulk });
    expect(screen.getByText('Hyväksytty: Kyllä')).toBeInTheDocument();
  });

  it('displays correct changes count', () => {
    const bulkWithChanges = {
      id: '123',
      is_approved: false,
      changes: {
        'func1__v1': { attributes: {} },
        'func2__v2': { attributes: {} }
      }
    };
    
    renderBulkView({ selectedBulk: bulkWithChanges });
    expect(screen.getByText('Tehdyt muutokset (2)')).toBeInTheDocument();
  });

  it('handles empty changes object', () => {
    const bulkWithNoChanges = {
      id: '123',
      is_approved: false,
      changes: {}
    };
    
    renderBulkView({ selectedBulk: bulkWithNoChanges });
    expect(screen.getByText('Tehdyt muutokset (0)')).toBeInTheDocument();
  });
});
