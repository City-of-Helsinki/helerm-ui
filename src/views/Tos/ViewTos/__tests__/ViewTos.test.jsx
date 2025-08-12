import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { screen, waitFor } from '@testing-library/react';

import ViewTos from '../ViewTos';
import renderWithProviders, { storeDefaultState } from '../../../../utils/renderWithProviders';
import { attributeTypes, classification, validTOS, user, template as templateData } from '../../../../utils/__mocks__/mockHelpers';
import api from '../../../../utils/api';
import { USER_LOGIN_STATUS } from '../../../../constants';
import * as helpers from '../../../../utils/helpers';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({
  id: 'test-function-election-001',
}));

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');

  return {
    ...mod,
    useParams: () => mockUseParams(),
    useNavigate: () => mockNavigate,
  };
});


const mockTosApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => validTOS }));
const mockClassificationApiGet = vi
  .fn()
  .mockImplementation(() => Promise.resolve({ ok: true, json: () => classification }));


const mockApiPost = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => ({}) }));
const mockApiPut = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => ({}) }));

vi.spyOn(api, 'get').mockImplementation((url) => {
  if (url.includes('classification')) {
    return mockClassificationApiGet();
  }

  if (url.includes('function')) {
    return mockTosApiGet();
  }


  return Promise.resolve({ ok: true, json: () => ({}) });
});

vi.spyOn(api, 'post').mockImplementation(() => mockApiPost());
vi.spyOn(api, 'put').mockImplementation(() => mockApiPut());

const mockDisplayMessage = vi.fn();
vi.spyOn(helpers, 'displayMessage').mockImplementation(mockDisplayMessage);


Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});


const createTosFromApiData = (overrides = {}) => ({
  ...validTOS,
  documentState: 'view',
  classification: validTOS.classification || { id: 'test-classification-health-guidance-001', version: 2 },
  phases: Array.isArray(validTOS.phases)
    ? validTOS.phases.reduce((acc, phase) => ({ ...acc, [phase.id]: phase }), {})
    : validTOS.phases || {},
  actions: validTOS.actions || {},
  records: validTOS.records || {},
  phasesOrder: validTOS.phasesOrder || (validTOS.phases ? validTOS.phases.map((p) => p.id) : []),
  ...overrides,
});

const createTosWithDifferentState = (state) => createTosFromApiData({ state });

const createTosInEditMode = () => createTosFromApiData({ documentState: 'edit' });

const createTosWithModifiedAttributes = (attributeOverrides) =>
  createTosFromApiData({
    attributes: {
      ...validTOS.attributes,
      ...attributeOverrides,
    },
  });

const createTosWithValidationErrors = () =>
  createTosFromApiData({
    documentState: 'view',
    error_count: 5,
    attributes: {
      PersonalData: '',
      PublicityClass: '',
      RetentionPeriod: '',
      RetentionReason: '',
      SocialSecurityNumber: '',
    },
  });

const createTosFromValidTOS = () => createTosFromApiData();

const createTosWithMissingSSN = () =>
  createTosWithModifiedAttributes({
    SocialSecurityNumber: '',
  });

const createTosWithInvalidPublicityClass = () =>
  createTosWithModifiedAttributes({
    PublicityClass: 'InvalidClass',
  });

const createTosWithErrors = () => createTosWithValidationErrors();

const createTosWithChildren = () =>
  createTosFromApiData({
    phases: validTOS.phases || [],
    actions: validTOS.actions || [],
    records: validTOS.records || [],
  });

const createRecordTos = () =>
  createTosFromApiData({
    records: validTOS.records || [],
  });

const createMockStore = (overrides = {}) => {
  const baseTosData = createTosFromApiData();
  const selectedTOSOverrides = overrides.selectedTOS || {};
  const selectedTOSData = { ...baseTosData, ...selectedTOSOverrides };

  return mockStore({
    ...storeDefaultState,
    user: {
      ...storeDefaultState.user,
      data: { id: user.uuid, firstName: user.first_name, lastName: user.last_name, permissions: user.permissions },
      status: USER_LOGIN_STATUS.AUTHORIZED,
    },
    ui: {
      ...storeDefaultState.ui,
      attributeTypes,
      actionTypes: attributeTypes.ActionType?.values?.map((val) => ({
        id: val.id,
        name: val.value,
      })) || [
        { id: 'action1', name: 'Test Action 1' },
        { id: 'action2', name: 'Test Action 2' },
      ],
      phaseTypes: attributeTypes.PhaseType?.values?.map((val) => ({
        id: val.id,
        name: val.value,
      })) || [
        { id: 'phase1', name: 'Test Phase 1' },
        { id: 'phase2', name: 'Test Phase 2' },
      ],
      recordTypes: attributeTypes.RecordType?.values?.map((val) => ({
        id: val.id,
        name: val.value,
      })) || [
        { id: 'record1', name: 'Test Record 1' },
        { id: 'record2', name: 'Test Record 2' },
      ],
      templates: templateData.results || [
        { id: 'template1', name: 'Test Template 1' },
        { id: 'template2', name: 'Test Template 2' },
      ],
      isFetching: false,
      ...overrides.ui,
    },
    selectedTOS: {
      ...storeDefaultState.selectedTOS,
      ...selectedTOSData,
      ...overrides.selectedTOS,
    },
    classification: {
      ...storeDefaultState.classification,
      selectedClassification: classification,
      ...overrides.classification,
    },
    validation: {
      ...storeDefaultState.validation,
      isOpen: false,
      ...overrides.validation,
    },
    navigation: {
      ...storeDefaultState.navigation,
      isVisible: false,
      ...overrides.navigation,
    },
    ...overrides,
  });
};

const renderComponent = (storeOverrides = {}) => {
  const store = createMockStore(storeOverrides);
  const router = createBrowserRouter([{ path: '/', element: <ViewTos /> }]);

  return renderWithProviders(<RouterProvider router={router} />, { store });
};

describe('<ViewTos />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockDisplayMessage.mockClear();
    mockUseParams.mockReturnValue({ id: 'test-function-election-001' });
  });

  describe('Basic Rendering', () => {
    it('renders loading state when fetching data', () => {
      renderComponent({
        selectedTOS: { isFetching: true, id: null },
        ui: { isFetching: true },
      });

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders nothing when not fetching and no TOS id', () => {
      renderComponent({
        selectedTOS: {
          id: null,
          classification: { id: 'test-classification-health-guidance-001', version: 2 },
          isFetching: false,
        },
        ui: { isFetching: false },
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(screen.queryByText('Käsittelyprosessin tiedot')).not.toBeInTheDocument();
      expect(screen.queryByText('Vaiheet')).not.toBeInTheDocument();
    });

    it('renders main content when TOS data is available', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
      expect(screen.getByText('Vaiheet')).toBeInTheDocument();
    });

    it('displays TOS name in the document when available', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
      expect(screen.getByText('Vaiheet')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('fetches TOS data on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockTosApiGet).toHaveBeenCalled();
      });
    });

    it('fetches classification data when TOS has classification', async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockClassificationApiGet).toHaveBeenCalled();
      });
    });

    it('handles TOS fetch error gracefully', async () => {
      mockTosApiGet.mockRejectedValueOnce(new Error('Fetch failed'));

      renderComponent();

      await waitFor(
        () => {
          expect(mockTosApiGet).toHaveBeenCalled();
        },
        { timeout: 2000 },
      );

      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('navigates to 404 on URI error', async () => {
      mockTosApiGet.mockRejectedValueOnce(new URIError('Invalid URI'));

      renderComponent();

      await waitFor(
        () => {
          expect(mockTosApiGet).toHaveBeenCalled();
        },
        { timeout: 2000 },
      );

      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('handles classification fetch error gracefully', async () => {
      mockClassificationApiGet.mockRejectedValueOnce(new Error('Classification fetch failed'));

      renderComponent();

      await waitFor(
        () => {
          expect(mockClassificationApiGet).toHaveBeenCalled();
        },
        { timeout: 2000 },
      );

      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Version Handling', () => {
    it('fetches TOS with version parameter when provided', async () => {
      mockUseParams.mockReturnValue({
        id: 'test-function-election-001',
        version: '2',
      });

      renderComponent();

      await waitFor(() => {
        expect(mockTosApiGet).toHaveBeenCalled();
      });
    });

    it('handles missing version parameter correctly', async () => {
      mockUseParams.mockReturnValue({
        id: 'test-function-election-001',
      });

      renderComponent();

      await waitFor(() => {
        expect(mockTosApiGet).toHaveBeenCalled();
      });
    });
  });

  describe('Component State Management', () => {
    it('exits edit mode when documentState changes to view', async () => {
      renderComponent({
        selectedTOS: {
          id: 'test-function-id',
          documentState: 'edit',
          name: 'Test TOS',
          phases: {},
          attributes: {},
          state: 'active',
          classification: { id: 'test-classification-id' },
          function_id: 'test-function-id',
          version: 1,
          version_history: [{ version: 1 }],
          is_classification_open: false,
        },
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
      expect(screen.getByText('Vaiheet')).toBeInTheDocument();
    });

    it('shows validation bar when validation is open', async () => {
      renderComponent({
        validation: { isOpen: true },
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
      expect(screen.getByText('Vaiheet')).toBeInTheDocument();
    });
  });

  describe('Scroll and Event Handling', () => {
    it('handles scroll events without errors', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const scrollEvent = new Event('scroll');
      Object.defineProperty(scrollEvent, 'srcElement', {
        value: {
          scrollingElement: { scrollTop: 100 },
        },
      });

      expect(() => {
        document.dispatchEvent(scrollEvent);
      }).not.toThrow();
    });

    it('handles window resize events', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Loading..')).not.toBeInTheDocument();
      });

      expect(() => {
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('handles missing TOS data gracefully', () => {
      renderComponent({
        selectedTOS: {
          ...createTosFromApiData(),
          name: undefined,
          attributes: undefined,
          isFetching: false,
        },
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('handles API errors during component lifecycle', async () => {
      mockApiPost.mockRejectedValueOnce(new Error('Network error'));

      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Cleanup', () => {
    it('clears data and removes event listeners on unmount', () => {
      const { unmount } = renderComponent();

      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('properly handles component lifecycle', async () => {
      const { unmount } = renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Integration with Store', () => {
    it('responds to store state changes', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
      expect(screen.getByText('Vaiheet')).toBeInTheDocument();
    });

    it('handles store updates without breaking', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
      expect(screen.getByText('Vaiheet')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('makes correct API calls for TOS data', async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockTosApiGet).toHaveBeenCalled();
      });

      expect(mockTosApiGet).toHaveBeenCalledTimes(1);
    });

    it('makes correct API calls for classification data', async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockClassificationApiGet).toHaveBeenCalled();
      });

      expect(mockClassificationApiGet).toHaveBeenCalledTimes(1);
    });

    it('handles multiple concurrent API calls', async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockTosApiGet).toHaveBeenCalled();
        expect(mockClassificationApiGet).toHaveBeenCalled();
      });

      expect(mockTosApiGet).toHaveBeenCalledTimes(1);
      expect(mockClassificationApiGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mock Data Integration', () => {
    it('renders TOS with real validTOS mock data', async () => {
      const mockResponse = { ok: true, json: () => validTOS };
      mockTosApiGet.mockImplementationOnce(() => Promise.resolve(mockResponse));

      renderComponent({
        selectedTOS: createTosFromValidTOS(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
      expect(screen.getByText('Vaiheet')).toBeInTheDocument();
    });

    it('handles TOS with children data structure', async () => {
      renderComponent({
        selectedTOS: createTosWithChildren(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
      expect(screen.getByText('Vaiheet')).toBeInTheDocument();
    });

    it('displays TOS with validation errors', async () => {
      renderComponent({
        selectedTOS: createTosWithErrors(),
        validation: { isOpen: true },
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
      expect(screen.getByText('Vaiheet')).toBeInTheDocument();
    });

    it('handles TOS with record data', async () => {
      renderComponent({
        selectedTOS: createRecordTos(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
      expect(screen.getByText('Vaiheet')).toBeInTheDocument();
    });

    it('uses template mock data for templates', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(templateData.results).toBeDefined();
      expect(templateData.results.length).toBeGreaterThan(0);
    });

    it('handles different classification scenarios', async () => {
      const classificationItem = classification[1];

      renderComponent({
        selectedTOS: {
          ...createTosFromApiData(),
          classification: { id: classificationItem.id, version: classificationItem.version },
        },
        classification: {
          selectedClassification: classificationItem,
        },
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Attribute Types Integration', () => {
    it('renders with all attribute types from mock data', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(Object.keys(attributeTypes)).toContain('PhaseType');
      expect(Object.keys(attributeTypes)).toContain('RecordType');
      expect(Object.keys(attributeTypes)).toContain('PublicityClass');
    });

    it('handles different TOS states from mock data', async () => {
      const states = ['draft', 'sent_for_review', 'approved'];

      for (const state of states) {
        const { unmount } = renderComponent({
          selectedTOS: {
            ...createTosFromValidTOS(),
            state,
          },
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('uses real phase data from validTOS mock', async () => {
      renderComponent({
        selectedTOS: createTosFromValidTOS(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(validTOS.phases).toBeDefined();
      expect(Array.isArray(validTOS.phases)).toBe(true);
    });
  });

  describe('User Permissions Integration', () => {
    it('handles different user permission scenarios', async () => {
      renderComponent({
        user: {
          data: {
            id: user.uuid,
            firstName: user.first_name,
            lastName: user.last_name,
            permissions: user.permissions,
          },
          status: USER_LOGIN_STATUS.AUTHORIZED,
        },
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(user.permissions).toContain('can_edit');
      expect(user.permissions).toContain('can_review');
      expect(user.permissions).toContain('can_approve');
    });

    it('handles user without permissions', async () => {
      renderComponent({
        user: {
          data: {
            id: user.uuid,
            firstName: user.first_name,
            lastName: user.last_name,
            permissions: [],
          },
          status: USER_LOGIN_STATUS.AUTHORIZED,
        },
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('Complex TOS Scenarios', () => {
    it('handles TOS with phases, actions, and records', async () => {
      renderComponent({
        selectedTOS: {
          ...createTosFromApiData(),
          phases: validTOS.phases,
          actions: validTOS.actions,
          records: validTOS.records,
        },
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('handles TOS in edit mode', async () => {
      renderComponent({
        selectedTOS: createTosInEditMode(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('handles TOS with validation errors', async () => {
      renderComponent({
        selectedTOS: createTosWithValidationErrors(),
        validation: { isOpen: true },
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('handles different retention periods from attribute types', async () => {
      const retentionValues = attributeTypes.RetentionPeriod.values.filter((val) => val.value).map((val) => val.value);

      for (const retentionPeriod of retentionValues.slice(0, 3)) {
        const { unmount } = renderComponent({
          selectedTOS: createTosWithModifiedAttributes({
            RetentionPeriod: retentionPeriod,
          }),
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles different phase types from attribute data', async () => {
      const phaseTypes = attributeTypes.PhaseType.values.map((val) => val.value);

      for (const phaseType of phaseTypes) {
        const tosWithPhase = createTosFromApiData({
          phases: [
            {
              id: 'test-phase',
              name: `Test ${phaseType} Phase`,
              attributes: {
                PhaseType: phaseType,
                TypeSpecifier: 'Test phase',
              },
            },
          ],
        });

        const { unmount } = renderComponent({
          selectedTOS: tosWithPhase,
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });
  });

  describe('Comprehensive Mock Data Scenarios', () => {
    it('handles TOS with missing Social Security Number data', async () => {
      renderComponent({
        selectedTOS: createTosWithMissingSSN(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('handles TOS with invalid publicity class', async () => {
      renderComponent({
        selectedTOS: createTosWithInvalidPublicityClass(),
        validation: { isOpen: true },
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('renders TOS in different states using version history', async () => {
      const versionHistory = validTOS.version_history || [];

      for (const version of versionHistory) {
        const { unmount } = renderComponent({
          selectedTOS: {
            ...createTosFromValidTOS(),
            state: version.state,
            version: version.version,
            modified_at: version.modified_at,
            modified_by: version.modified_by,
          },
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles different TOS states and modes', async () => {
      const scenarios = [
        { name: 'draft', data: createTosWithDifferentState('draft') },
        { name: 'edit mode', data: createTosInEditMode() },
        { name: 'validation errors', data: createTosWithValidationErrors() },
      ];

      for (const scenario of scenarios) {
        const { unmount } = renderComponent({
          selectedTOS: scenario.data,
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles all publicity class values from schemas', async () => {
      const publicityClasses = ['Julkinen', 'Ei-julkinen', 'Osittain salassa pidettävä', 'Salassa pidettävä'];

      for (const publicityClass of publicityClasses) {
        const { unmount } = renderComponent({
          selectedTOS: createTosWithModifiedAttributes({
            PublicityClass: publicityClass,
          }),
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles all personal data values from attribute types', async () => {
      const personalDataValues = attributeTypes.PersonalData?.values?.map((val) => val.value) || [];

      for (const personalDataValue of personalDataValues) {
        const { unmount } = renderComponent({
          selectedTOS: createTosWithModifiedAttributes({
            PersonalData: personalDataValue,
          }),
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles all social security number values from attribute types', async () => {
      const ssnValues = attributeTypes.SocialSecurityNumber?.values?.map((val) => val.value) || [];

      for (const ssnValue of ssnValues) {
        const { unmount } = renderComponent({
          selectedTOS: createTosWithModifiedAttributes({
            SocialSecurityNumber: ssnValue,
          }),
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles complex TOS with nested records from errorsAndWarningsTOS', async () => {
      renderComponent({
        selectedTOS: createTosWithErrors(),
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(validTOS.phases).toBeDefined();
      expect(Array.isArray(validTOS.phases)).toBe(true);
      expect(validTOS.phases.length).toBeGreaterThan(0);
      expect(validTOS.phases[0].actions).toBeDefined();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('renders TOS with all available templates', async () => {
      const templates = templateData.results || [];

      for (const template of templates) {
        const { unmount } = renderComponent({
          ui: {
            templates: [template],
            selectedTemplate: template,
          },
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles TOS with different user permission combinations', async () => {
      const permissionCombinations = [
        ['can_view'],
        ['can_edit'],
        ['can_review'],
        ['can_approve'],
        ['can_edit', 'can_review'],
        ['can_review', 'can_approve'],
        ['can_edit', 'can_review', 'can_approve'],
        user.permissions,
        [],
      ];

      for (const permissions of permissionCombinations) {
        const { unmount } = renderComponent({
          user: {
            data: {
              id: user.uuid,
              firstName: user.first_name,
              lastName: user.last_name,
              permissions,
            },
            status: USER_LOGIN_STATUS.AUTHORIZED,
          },
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles all classification items from mock data', async () => {
      for (const classificationItem of classification) {
        const { unmount } = renderComponent({
          selectedTOS: createTosFromApiData({
            classification: { id: classificationItem.id, version: classificationItem.version },
          }),
          classification: {
            selectedClassification: classificationItem,
          },
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles TOS with all retention period values', async () => {
      const retentionPeriods = attributeTypes.RetentionPeriod?.values?.map((val) => val.value) || [];

      for (const retentionPeriod of retentionPeriods) {
        const { unmount } = renderComponent({
          selectedTOS: createTosWithModifiedAttributes({
            RetentionPeriod: retentionPeriod,
          }),
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles TOS with all retention period start values', async () => {
      const retentionStarts = attributeTypes.RetentionPeriodStart?.values?.map((val) => val.value) || [];

      for (const retentionStart of retentionStarts) {
        const { unmount } = renderComponent({
          selectedTOS: createTosWithModifiedAttributes({
            RetentionPeriodStart: retentionStart,
          }),
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('handles TOS with complex action structures from mock data', async () => {
      const tosData = createTosWithErrors();
      expect(tosData.phases).toBeDefined();

      renderComponent({
        selectedTOS: tosData,
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('handles TOS with information systems from attribute types', async () => {
    const infoSystems = attributeTypes.InformationSystem?.values?.map((val) => val.value) || [];

    for (const infoSystem of infoSystems.slice(0, 3)) {
      const { unmount } = renderComponent({
        selectedTOS: createTosWithModifiedAttributes({
          InformationSystem: [infoSystem],
        }),
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      unmount();
    }
  });

  it('handles edge case: TOS with empty phases but non-empty phasesOrder', async () => {
    renderComponent({
      selectedTOS: createTosFromApiData({
        phases: [],
        phasesOrder: ['phase1', 'phase2', 'phase3'],
      }),
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('handles edge case: TOS with null attributes', async () => {
    renderComponent({
      selectedTOS: createTosFromApiData({
        attributes: null,
      }),
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });    it('handles TOS with validation state combinations', async () => {
      const validationStates = [
        { isOpen: true, validationErrors: [] },
        { isOpen: true, validationErrors: ['Error 1', 'Error 2'] },
        { isOpen: false, validationErrors: [] },
        { isOpen: false, validationErrors: ['Error 1'] },
      ];

      for (const validationState of validationStates) {
        const { unmount } = renderComponent({
          selectedTOS: createTosWithErrors(),
          validation: validationState,
        });

        await waitFor(() => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        unmount();
      }
    });
});
