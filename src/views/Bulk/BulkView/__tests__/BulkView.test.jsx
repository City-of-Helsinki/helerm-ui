import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BulkView from '../BulkView';
import renderWithProviders from '../../../../utils/renderWithProviders';
import { attributeTypes, validTOS, user, bulkUpdate } from '../../../../utils/__mocks__/mockHelpers';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock useParams hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

// Mock navigation item with function
const createMockNavigationItem = (overrides = {}) => ({
  ...validTOS,
  function: 'test-function-election-001', // This must match the base ID from bulk changes
  function_attributes: validTOS.attributes, // Function attributes for component logic
  function_valid_from: validTOS.valid_from,
  function_valid_to: validTOS.valid_to,
  path: ['Test', 'Classification'],
  phases: [
    {
      id: 'phase-1',
      name: 'Test Phase',
      attributes: {
        PhaseType: 'Valmistelu',
      },
      actions: [
        {
          id: 'action-1',
          name: 'Test Action',
          attributes: {
            ActionType: 'Selvitys',
          },
          records: [
            {
              id: 'record-1',
              name: 'Test Record',
              attributes: {
                RecordType: 'Sopimus',
              },
            },
          ],
        },
      ],
    },
  ],
  ...overrides,
});

const renderComponent = (storeOverrides = {}) => {
  const mockBulkUpdate = {
    ...bulkUpdate,
    is_approved: false, // Ensure button is not disabled due to already approved
    ...storeOverrides.bulkOverrides
  };
  const mockNavigationItem = createMockNavigationItem({
    id: 'test-function-election-001', // Match the ID from bulk changes
    name: 'Kuntavaalit ja kunnalliset kansanäänestykset', // Match expected name
  });

  const defaultStore = {
    ui: {
      actionTypes: {},
      attributeTypes: attributeTypes,
      phaseTypes: {},
      recordTypes: {},
      templates: [],
    },
    navigation: {
      includeRelated: true,
      isFetching: false,
      items: [mockNavigationItem],
    },
    bulk: {
      selectedBulk: mockBulkUpdate,
      isUpdating: false,
    },
    user: {
      data: user,
    },
  };

  const store = mockStore({
    ...defaultStore,
    ...storeOverrides,
  });

  return {
    user: userEvent.setup(),
    ...renderWithProviders(
      <MemoryRouter initialEntries={['/bulk/1']}>
        <BulkView />
      </MemoryRouter>,
      { store },
    ),
    store,
  };
};

describe('<BulkView />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders correctly without crashing', () => {
      renderComponent();

      expect(screen.getByText('Massamuutos esikatselu')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /takaisin/i })).toHaveAttribute('href', '/bulk');
    });

    it('displays bulk update information', () => {
      renderComponent();

      // Check for main title and essential structure
      expect(screen.getByText('Massamuutos esikatselu')).toBeInTheDocument();
      expect(screen.getByText(/Paketti ID:/)).toBeInTheDocument();
      expect(screen.getByText(/Muokkaaja:/)).toBeInTheDocument();
      expect(screen.getByText(/Hyväksytty:/)).toBeInTheDocument();
    });

    it('displays back link to bulk list', () => {
      renderComponent();

      const backLink = screen.getByRole('link', { name: /takaisin/i });
      expect(backLink).toHaveAttribute('href', '/bulk');
    });

    it('shows loading state when navigation is fetching', () => {
      renderComponent({
        navigation: {
          includeRelated: true,
          isFetching: true,
          items: [],
        },
      });

      // Should not show items when fetching
      expect(screen.queryByText('Tehdyt muutokset')).not.toBeInTheDocument();
    });
  });

  describe('Bulk Update Actions', () => {
    it('displays action buttons for authorized users', () => {
      renderComponent();

      // Target buttons specifically in the bulk-view-actions section
      const actionButtons = document.querySelectorAll('.bulk-view-actions button');
      expect(actionButtons).toHaveLength(3);

      const buttonTexts = Array.from(actionButtons).map((btn) => btn.textContent.trim());
      expect(buttonTexts).toContain('Hyväksy');
      expect(buttonTexts).toContain('Hylkää');
      expect(buttonTexts).toContain('Poista');
    });

    it('disables approve button when bulk update is already approved', () => {
      const approvedBulkUpdate = { ...bulkUpdate, is_approved: true };
      renderComponent({
        bulk: {
          selectedBulk: approvedBulkUpdate,
          isUpdating: false,
        },
      });

      const approveButton = screen.getByRole('button', { name: 'Hyväksy' });
      const rejectButton = screen.getByRole('button', { name: 'Hylkää' });

      expect(approveButton).toBeDisabled();
      expect(rejectButton).toBeDisabled();
    });

    it('disables approve button when bulk update is invalid', () => {
      // Create an invalid bulk update (references non-existent phase)
      const invalidBulkUpdate = {
        ...bulkUpdate,
        changes: {
          'test-function-election-001__1': {
            version: '1',
            phases: {
              'non-existent-phase': {
                attributes: {
                  PhaseType: 'Invalid',
                },
              },
            },
          },
        },
      };

      renderComponent({
        bulk: {
          selectedBulk: invalidBulkUpdate,
          isUpdating: false,
        },
      });

      const approveButton = screen.getByRole('button', { name: 'Hyväksy' });
      expect(approveButton).toBeDisabled();
    });

    it('opens approval confirmation popup on approve click', async () => {
      const { user } = renderComponent();

      const approveButton = document.querySelector('.bulk-view-actions .btn-primary');
      await user.click(approveButton);

      expect(screen.getByText('Hyväksytäänkö massamuutos?')).toBeInTheDocument();
      expect(screen.getByTestId('popup-component')).toBeInTheDocument();
    });

    it('opens deletion confirmation popup on delete click', async () => {
      const { user } = renderComponent();

      const deleteButton = document.querySelector('.bulk-view-actions .btn-danger');
      await user.click(deleteButton);

      expect(screen.getByText('Poistetaanko massamuutos?')).toBeInTheDocument();
    });

    it('opens rejection confirmation popup on reject click', async () => {
      const { user } = renderComponent();

      const rejectButton = screen.getByRole('button', { name: 'Hylkää' });
      await user.click(rejectButton);

      expect(screen.getByText('Hylätäänkö massamuutos?')).toBeInTheDocument();
      expect(screen.getByText('HUOM! Hylkäys ei vielä tee mitään.')).toBeInTheDocument();
    });

    it('cancels popup when cancel button is clicked', async () => {
      const { user } = renderComponent();

      const approveButton = screen.getByRole('button', { name: 'Hyväksy' });
      await user.click(approveButton);

      expect(screen.getByText('Hyväksytäänkö massamuutos?')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: 'Peruuta' });
      await user.click(cancelButton);

      expect(screen.queryByText('Hyväksytäänkö massamuutos?')).not.toBeInTheDocument();
    });
  });

  describe('Item Changes Display', () => {
    it('displays changed items and their modifications', () => {
      renderComponent();

      // Should show the changes count
      expect(screen.getByText('Tehdyt muutokset (1)')).toBeInTheDocument();

      // Should show the item path and name
      expect(screen.getByText('Test > Classification')).toBeInTheDocument();
      expect(screen.getByText('Kuntavaalit ja kunnalliset kansanäänestykset')).toBeInTheDocument();
    });

    it('allows removing items from bulk update', async () => {
      const { user } = renderComponent();

      const removeButton = document.querySelector('.bulk-view-item-action .btn-danger');
      await user.click(removeButton);

      expect(screen.getByText(/Poistetaanko käsittelyprosessi.*massamuutoksesta/)).toBeInTheDocument();
    });
  });

  describe('Empty and Error States', () => {
    it('shows validation errors for invalid bulk update', () => {
      const invalidBulkUpdate = {
        ...bulkUpdate,
        changes: {
          'test-function-election-001__1': {
            version: '1',
            phases: {
              'non-existent-phase': {
                attributes: {
                  PhaseType: 'Invalid',
                },
              },
            },
          },
        },
      };

      renderComponent({
        bulk: {
          selectedBulk: invalidBulkUpdate,
          isUpdating: false,
        },
      });

      expect(screen.getByText(/Massamuutospaketissa on käsittelyprosesseja/)).toBeInTheDocument();
      expect(screen.getByText(/Käsittelyvaihetta.*ei löytynyt/)).toBeInTheDocument();
    });

    it('handles navigation items without includeRelated flag', () => {
      renderComponent({
        navigation: {
          includeRelated: false,
          isFetching: false,
          items: [createMockNavigationItem()],
        },
      });

      // Should not process items when includeRelated is false
      expect(screen.getByText('Massamuutos esikatselu')).toBeInTheDocument();
    });
  });

  describe('User Permissions and Access Control', () => {
    it('shows action buttons for users with appropriate permissions', () => {
      renderComponent();

      // User has permissions in mock data, so buttons should be visible
      const actionButtons = document.querySelectorAll('.bulk-view-actions button');
      expect(actionButtons).toHaveLength(3);
    });
  });

  describe('Data Processing and Validation', () => {
    it('processes complex nested changes correctly', () => {
      const complexBulkUpdate = {
        ...bulkUpdate,
        changes: {
          'test-function-election-001__1': {
            version: '1',
            attributes: {
              RetentionPeriod: '10',
              PublicityClass: 'Osittain salassa pidettävä',
            },
            phases: {
              'phase-1': {
                attributes: {
                  PhaseType: 'Päätös',
                },
                actions: {
                  'action-1': {
                    attributes: {
                      ActionType: 'Ratkaisu',
                    },
                    records: {
                      'record-1': {
                        attributes: {
                          RecordType: 'Päätösasiakirja',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      renderComponent({
        bulk: {
          selectedBulk: complexBulkUpdate,
          isUpdating: false,
        },
      });

      expect(screen.getByText('Kuntavaalit ja kunnalliset kansanäänestykset')).toBeInTheDocument();
    });
  });
});
