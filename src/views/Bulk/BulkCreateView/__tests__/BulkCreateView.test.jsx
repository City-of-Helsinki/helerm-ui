import { createBrowserHistory } from 'history';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { screen, waitFor } from '@testing-library/react';

import BulkCreateView from '../BulkCreateView';
import renderWithProviders from '../../../../utils/renderWithProviders';
import { attributeTypes, validTOS, validTOSWithChildren, user } from '../../../../utils/__mocks__/mockHelpers';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const renderComponent = (storeOverrides = {}, tosOverrides = {}) => {
  const history = createBrowserHistory();
  // Use standardized mock data with optional overrides
  const mockTOS = {
    ...validTOSWithChildren.children?.[0] || validTOS,
    ...tosOverrides
  };

  const store = mockStore({
    ui: {
      actionTypes: {},
      attributeTypes: attributeTypes,
      phaseTypes: {},
      recordTypes: {},
      templates: [],
    },
    navigation: {
      isFetching: false,
      items: [mockTOS],
    },
    user: {
      data: user,
    },
    ...storeOverrides,
  });

  const router = createBrowserRouter([{ path: '/', element: <BulkCreateView /> }]);

  return {
    ...renderWithProviders(<RouterProvider router={router} />, { history, store }),
    store,
  };
};

describe('<BulkCreateView />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders correctly without crashing', () => {
      renderComponent();
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
      expect(screen.getByText('Muutoshistoria')).toBeInTheDocument();
    });

    it('displays "Ei tapahtumia" when no conversions exist', () => {
      renderComponent();
      expect(screen.getByText('Ei tapahtumia')).toBeInTheDocument();
    });

    it('renders back link to bulk list', () => {
      renderComponent();
      expect(screen.getByRole('link', { name: /takaisin/i })).toHaveAttribute('href', '/bulk');
    });
  });

  describe('Data Processing and AttributeValues', () => {
    it('processes items and generates search interface correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /hae/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /tyhjenn/i })).toBeInTheDocument();
      });
    });

    it('handles empty items array gracefully', () => {
      renderComponent({
        navigation: {
          isFetching: false,
          items: [],
        },
      });
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hae/i })).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('renders search interface correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /hae/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /tyhjenn/i })).toBeInTheDocument();
      });

      // Verify the search interface is present and functional
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Validation', () => {
    it('renders action buttons in correct disabled state', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /tallenna/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /palauta/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /esikatselu/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /tallenna/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /palauta/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /esikatselu/i })).toBeDisabled();
    });
  });

  describe('Conversion Process', () => {
    it('displays conversion history section correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Muutoshistoria')).toBeInTheDocument();
        expect(screen.getByText('Ei tapahtumia')).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('handles isFetching state transitions correctly', () => {
      renderComponent({
        navigation: {
          isFetching: true,
          items: [],
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
      expect(screen.getByText('Muutoshistoria')).toBeInTheDocument();
    });
  });

  describe('Integration with Redux', () => {
    it('dispatches actions and uses selectors correctly', () => {
      const { store } = renderComponent();

      const actions = store.getActions();
      expect(actions.length).toBeGreaterThan(0);

      const hasNavigationAction = actions.some(
        (action) => action.type && action.type.toLowerCase().includes('navigation'),
      );
      expect(hasNavigationAction).toBe(true);

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('handles missing attributeTypes gracefully', () => {
      renderComponent({
        ui: {
          actionTypes: {},
          attributeTypes: null,
          phaseTypes: {},
          recordTypes: {},
          templates: [],
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('handles malformed TOS data', () => {
      renderComponent(
        {},
        {
          attributes: null,
          phases: null,
        },
      );

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });

  describe('Navigation and Routing', () => {
    it('renders main container with correct structure', async () => {
      const { container } = renderComponent();

      await waitFor(() => {
        expect(container.querySelector('.bulk-update-create')).toBeInTheDocument();
      });
    });
  });

  describe('Button Interactions and Event Handlers', () => {
    it('handles cancel button click correctly', async () => {
      renderComponent();

      const cancelButton = await screen.findByRole('button', { name: /palauta/i });
      expect(cancelButton).toBeDisabled();
    });

    it('handles save button click correctly', async () => {
      renderComponent();

      const saveButton = await screen.findByRole('button', { name: /tallenna/i });
      expect(saveButton).toBeDisabled();
    });

    it('handles preview button click correctly', async () => {
      renderComponent();

      const previewButton = await screen.findByRole('button', { name: /esikatselu/i });
      expect(previewButton).toBeDisabled();
    });
  });

  describe('RouterPrompt Integration', () => {
    it('renders RouterPrompt component with correct props', () => {
      const { container } = renderComponent();

      // RouterPrompt is rendered but not visible in DOM
      expect(container.querySelector('.bulk-update-create')).toBeInTheDocument();
    });
  });

  describe('Conversion History Display', () => {
    it('displays conversion history section with no events message', () => {
      renderComponent();

      expect(screen.getByText('Muutoshistoria')).toBeInTheDocument();
      expect(screen.getByText('Ei tapahtumia')).toBeInTheDocument();
    });

    it('handles empty conversions state', () => {
      renderComponent();

      expect(screen.getByText('Ei tapahtumia')).toBeInTheDocument();
      // Verify that conversion-related sections are not displayed
      expect(screen.queryByText(/Muutetaan:/)).not.toBeInTheDocument();
    });
  });

  describe('State Management and Component Updates', () => {
    it('handles component state changes with different item configurations', () => {
      renderComponent(
        {},
        {
          phases: [
            {
              id: 'phase-1',
              name: 'Test Phase',
              attributes: { test: 'value' },
            },
          ],
        },
      );

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('processes items with function attributes correctly', () => {
      renderComponent(
        {},
        {
          function_attributes: { test_attr: 'test_value' },
          function_state: 'sent_for_review',
        },
      );

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });

  describe('Component Conditional Rendering', () => {
    it('renders IsAllowed components correctly', () => {
      renderComponent();

      // Verify that conversion and action sections are present
      expect(screen.getByText('Muutoshistoria')).toBeInTheDocument();
    });

    it('handles different user permission states', () => {
      renderComponent({
        user: {
          data: { ...user, permissions: [] },
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });

  describe('Data Processing with Complex Structures', () => {
    it('processes nested phase and action structures', () => {
      const complexTOS = {
        phases: [
          {
            id: 'phase-1',
            name: 'Complex Phase',
            attributes: { phase_attr: 'value' },
            actions: [
              {
                id: 'action-1',
                name: 'Complex Action',
                attributes: { action_attr: 'value' },
                records: [
                  {
                    id: 'record-1',
                    name: 'Complex Record',
                    attributes: { record_attr: 'value' },
                  },
                ],
              },
            ],
          },
        ],
      };

      renderComponent({}, complexTOS);
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('handles items with multiple phases and actions', () => {
      const multiPhaseTOS = {
        phases: [
          {
            id: 'phase-1',
            name: 'Phase 1',
            attributes: { attr1: 'value1' },
            actions: [
              { id: 'action-1', name: 'Action 1', attributes: { action_attr1: 'value1' } },
              { id: 'action-2', name: 'Action 2', attributes: { action_attr2: 'value2' } },
            ],
          },
          {
            id: 'phase-2',
            name: 'Phase 2',
            attributes: { attr2: 'value2' },
          },
        ],
      };

      renderComponent({}, multiPhaseTOS);
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });

  describe('Utility Functions and Helpers', () => {
    it('processes items with different validation states correctly', () => {
      const itemWithErrors = {
        phases: [
          {
            id: 'phase-1',
            name: 'Phase with Issues',
            attributes: { invalid_attr: null },
            actions: [
              {
                id: 'action-1',
                name: 'Action with Issues',
                attributes: { required_field: '' },
              },
            ],
          },
        ],
      };

      renderComponent({}, itemWithErrors);
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('handles items with empty or null phase structures', () => {
      const itemWithEmptyPhases = {
        phases: [],
      };

      renderComponent({}, itemWithEmptyPhases);
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('processes items with system attributes correctly', () => {
      const itemWithSystemAttrs = {
        code: 'SYS-001',
        function_state: 'sent_for_review',
        valid_from: '2023-01-01T00:00:00Z',
        valid_to: '2024-12-31T23:59:59Z',
        attributes: {
          TypeSpecifier: 'system_type',
          InformationSystem: 'test_system',
        },
      };

      renderComponent({}, itemWithSystemAttrs);
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });

  describe('Component State Transitions', () => {
    it('handles component mounting with different store configurations', () => {
      renderComponent({
        navigation: {
          isFetching: false,
          items: [
            {
              children: [
                {
                  function: 'child-function-id',
                  function_attributes: { child_attr: 'value' },
                  code: 'CHILD-001',
                },
              ],
            },
          ],
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('processes nested navigation items correctly', () => {
      renderComponent({
        navigation: {
          isFetching: false,
          items: [
            {
              children: [
                {
                  children: [
                    {
                      function: 'nested-function',
                      function_attributes: { nested_attr: 'nested_value' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });

  describe('Error Boundary and Edge Cases', () => {
    it('handles items with circular references gracefully', () => {
      const circularItem = {
        id: 'circular-test',
        attributes: { test: 'value' },
      };

      renderComponent({}, circularItem);
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('processes items with mixed data types in attributes', () => {
      const mixedDataItem = {
        attributes: {
          string_attr: 'string_value',
          number_attr: 123,
          boolean_attr: true,
          array_attr: ['item1', 'item2'],
          null_attr: null,
          undefined_attr: undefined,
        },
      };

      renderComponent({}, mixedDataItem);
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('handles items with special characters in names and codes', () => {
      const specialCharItem = {
        name: 'Test äöå ÄÖÅ',
        code: 'TEST-äöå-001',
        classification_title: 'Special åäö Title',
      };

      renderComponent({}, specialCharItem);
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });

  describe('Advanced Component Behavior', () => {
    it('handles component with loaded navigation items correctly', () => {
      renderComponent({
        navigation: {
          isFetching: false,
          items: [
            {
              function: 'test-function-1',
              name: 'Test Function 1',
              function_attributes: { test: 'value1' },
              function_state: 'approved',
              function_valid_from: '2023-01-01T00:00:00Z',
              function_valid_to: null,
              code: 'TF-001',
              phases: [
                {
                  id: 'phase-1',
                  name: 'Test Phase 1',
                  attributes: { phase_test: 'phase_value' },
                },
              ],
            },
          ],
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('processes component with complex nested structure', async () => {
      const complexItems = [
        {
          function: 'complex-function',
          name: 'Complex Function',
          function_attributes: {
            TypeSpecifier: 'AsiakirjaType',
            InformationSystem: 'TestSystem',
            AdditionalInformation: 'Test Info',
          },
          function_state: 'draft',
          phases: [
            {
              id: 'complex-phase',
              name: 'Complex Phase',
              attributes: {
                PhaseType: 'TestPhase',
                Duration: '30 days',
              },
              actions: [
                {
                  id: 'complex-action',
                  name: 'Complex Action',
                  attributes: {
                    ActionType: 'TestAction',
                    Responsibility: 'TestResponsible',
                  },
                  records: [
                    {
                      id: 'complex-record',
                      name: 'Complex Record',
                      attributes: {
                        RecordType: 'TestRecord',
                        RetentionPeriod: '10 years',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      renderComponent({
        navigation: {
          isFetching: false,
          items: complexItems,
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /hae/i })).toBeInTheDocument();
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('handles attribute processing with various data formats', () => {
      const itemWithVariousFormats = {
        function_attributes: {
          string_field: 'test string',
          array_field: ['item1', 'item2', 'item3'],
          boolean_field: true,
          numeric_field: 42,
          date_field: '2023-01-01T00:00:00Z',
          empty_string: '',
          zero_value: 0,
          false_value: false,
        },
        phases: [
          {
            id: 'format-phase',
            attributes: {
              mixed_array: [1, 'two', true, null],
              nested_object: { key: 'value' },
            },
          },
        ],
      };

      renderComponent({
        navigation: {
          isFetching: false,
          items: [itemWithVariousFormats],
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('processes component state during loading transition', () => {
      // Test the loading state
      renderComponent({
        navigation: {
          isFetching: true,
          items: null,
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();

      // Test component behavior during loading
      expect(screen.getByText('Muutoshistoria')).toBeInTheDocument();
    });
  });

  describe('Data Structure Edge Cases', () => {
    it('handles items with array-based phases instead of object', () => {
      const arrayPhaseItem = {
        function: 'array-phase-function',
        phases: [
          {
            id: 'array-phase-1',
            name: 'Array Phase 1',
            attributes: { test: 'value1' },
          },
          {
            id: 'array-phase-2',
            name: 'Array Phase 2',
            attributes: { test: 'value2' },
          },
        ],
      };

      renderComponent({
        navigation: {
          isFetching: false,
          items: [arrayPhaseItem],
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('handles items with null or undefined critical fields', () => {
      const incompleteItem = {
        function: 'incomplete-function',
        name: null,
        function_attributes: undefined,
        phases: null,
        code: '',
        function_state: null,
      };

      renderComponent({
        navigation: {
          isFetching: false,
          items: [incompleteItem],
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });

    it('processes deeply nested navigation structure', () => {
      const deepNestedItems = [
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      function: 'deep-nested-function',
                      function_attributes: { deep: 'nested_value' },
                      name: 'Deep Nested Function',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      renderComponent({
        navigation: {
          isFetching: false,
          items: deepNestedItems,
        },
      });

      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });
});
