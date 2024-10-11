import React from 'react';
import { createBrowserHistory } from 'history';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fireEvent, screen } from '@testing-library/react';

import ViewTos from '../ViewTos';
import renderWithProviders from '../../../../utils/renderWithProviders';
import attributeRules from '../../../../utils/mocks/attributeRules.json';
import classification from '../../../../utils/mocks/classification.json';
import validTOS from '../../../../utils/mocks/validTOS.json';
import user from '../../../../utils/mocks/user.json';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');

  return {
    ...mod,
    useParams: () => ({
      id: 'test',
      version: '1',
    }),
  };
});

const renderComponent = (propOverrides) => {
  const history = createBrowserHistory();

  const props = {
    actionTypes: {},
    attributeTypes: attributeRules,
    classification,
    isFetching: false,
    items: [validTOS],
    phaseTypes: {},
    recordTypes: {},
    selectedTOS: { ...validTOS, documentState: 'view', is_open: true, is_classification_open: true, classification },
    showValidationBar: false,
    templates: [],
    addAction: vi.fn(),
    addPhase: vi.fn(),
    addRecord: vi.fn(),
    changeOrder: vi.fn(),
    changeStatus: vi.fn(),
    clearClassification: vi.fn(),
    clearTOS: vi.fn(),
    cloneFromTemplate: vi.fn(),
    displayMessage: vi.fn(),
    editAction: vi.fn(),
    editActionAttribute: vi.fn(),
    editMetaData: vi.fn(),
    editPhase: vi.fn(),
    editPhaseAttribute: vi.fn(),
    editRecord: vi.fn(),
    editRecordAttribute: vi.fn(),
    editValidDates: vi.fn(),
    fetchClassification: vi.fn(),
    fetchTOS: vi.fn().mockImplementation(() => Promise.resolve(validTOS)),
    importItems: vi.fn(),
    removeAction: vi.fn(),
    removePhase: vi.fn(),
    removeRecord: vi.fn(),
    resetTOS: vi.fn(),
    saveDraft: vi.fn(),
    setActionVisibility: vi.fn(),
    setClassificationVisibility: vi.fn(),
    setDocumentState: vi.fn(),
    setMetadataVisibility: vi.fn(),
    setNavigationVisibility: vi.fn(),
    setPhaseAttributesVisibility: vi.fn(),
    setPhaseVisibility: vi.fn(),
    setRecordVisibility: vi.fn(),
    setTosVisibility: vi.fn(),
    setValidationVisibility: vi.fn(),
    setVersionVisibility: vi.fn(),
    navigate: vi.fn(),
    ...propOverrides,
  };

  const store = mockStore({
    ui: {
      actionTypes: {},
      attributeTypes: attributeRules,
      isFetching: false,
      phaseTypes: {},
      recordTypes: {},
      templates: [],
    },
    classification,
    navigation: {
      items: [validTOS],
    },
    selectedTOS: {
      ...validTOS,
      documentState: 'view',
      isFetching: false,
      is_open: true,
      is_classification_open: true,
      classification,
    },
    validation: {
      is_open: false,
    },
    user: {
      data: user,
    },
  });

  const router = createBrowserRouter([{ path: '/', element: <ViewTos {...props} /> }]);

  return renderWithProviders(<RouterProvider router={router} />, { history, store });
};

describe('<ViewTos />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('should fetch TOS', () => {
    const fetchTOSMock = vi.fn().mockImplementation(() => Promise.resolve(validTOS));

    renderComponent({ fetchTOS: fetchTOSMock });

    expect(fetchTOSMock).toHaveBeenCalled();
  });

  it('handles scroll event', () => {
    renderComponent();

    fireEvent.scroll(window, { target: { scrollY: 100 } });

    expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
  });

  it('should fetch TOS error', () => {
    const fetchTOSMock = vi.fn().mockImplementation(() => Promise.reject(new URIError('ERROR')));

    renderComponent({ fetchTOS: fetchTOSMock });

    expect(fetchTOSMock).toHaveBeenCalled();
  });
});
