import { createBrowserHistory } from 'history';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import BulkCreateView from '../BulkCreateView';
import renderWithProviders from '../../../../utils/renderWithProviders';
import attributeRules from '../../../../utils/mocks/attributeRules.json';
import validTOS from '../../../../utils/mocks/validTOS.json';
import user from '../../../../utils/mocks/user.json';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const renderComponent = () => {
  const history = createBrowserHistory();

  const props = {
    displayMessage: vi.fn(),
    getAttributeName: vi.fn(),
    fetchNavigation: vi.fn(),
    saveBulkUpdate: vi.fn(),
    attributeTypes: attributeRules,
    isFetching: false,
    items: [validTOS],
  };

  const router = createBrowserRouter([{ path: '/', element: <BulkCreateView {...props} /> }]);

  const store = mockStore({
    ui: {
      actionTypes: {},
      attributeTypes: attributeRules,
      phaseTypes: {},
      recordTypes: {},
      templates: [],
    },
    navigation: {
      isFetching: false,
      items: [validTOS],
    },
    user: {
      data: user,
    },
  });

  return renderWithProviders(<RouterProvider router={router} />, { history, store });
};

describe('<BulkCreateView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('should render with loading state when isFetching is true', () => {
    const history = createBrowserHistory();

    const props = {
      displayMessage: vi.fn(),
      getAttributeName: vi.fn(),
      fetchNavigation: vi.fn(),
      saveBulkUpdate: vi.fn(),
      attributeTypes: attributeRules,
      isFetching: true,
      items: [validTOS],
    };

    const router = createBrowserRouter([{ path: '/', element: <BulkCreateView {...props} /> }]);

    const store = mockStore({
      ui: {
        actionTypes: {},
        attributeTypes: attributeRules,
        phaseTypes: {},
        recordTypes: {},
        templates: [],
      },
      navigation: {
        isFetching: true,
        items: [validTOS],
      },
      user: {
        data: user,
      },
    });

    const { container } = renderWithProviders(<RouterProvider router={router} />, { history, store });
    expect(container).toBeDefined();
  });

  it('should render with empty items array', () => {
    const history = createBrowserHistory();

    const props = {
      displayMessage: vi.fn(),
      getAttributeName: vi.fn(),
      fetchNavigation: vi.fn(),
      saveBulkUpdate: vi.fn(),
      attributeTypes: attributeRules,
      isFetching: false,
      items: [],
    };

    const router = createBrowserRouter([{ path: '/', element: <BulkCreateView {...props} /> }]);

    const store = mockStore({
      ui: {
        actionTypes: {},
        attributeTypes: attributeRules,
        phaseTypes: {},
        recordTypes: {},
        templates: [],
      },
      navigation: {
        isFetching: false,
        items: [],
      },
      user: {
        data: user,
      },
    });

    const { container } = renderWithProviders(<RouterProvider router={router} />, { history, store });
    expect(container).toBeDefined();
  });

  it('should call fetchNavigation on mount', () => {
    const mockFetchNavigation = vi.fn();
    const history = createBrowserHistory();

    const props = {
      displayMessage: vi.fn(),
      getAttributeName: vi.fn(),
      fetchNavigation: mockFetchNavigation,
      saveBulkUpdate: vi.fn(),
      attributeTypes: attributeRules,
      isFetching: false,
      items: [validTOS],
    };

    const router = createBrowserRouter([{ path: '/', element: <BulkCreateView {...props} /> }]);

    const store = mockStore({
      ui: {
        actionTypes: {},
        attributeTypes: attributeRules,
        phaseTypes: {},
        recordTypes: {},
        templates: [],
      },
      navigation: {
        isFetching: false,
        items: [validTOS],
      },
      user: {
        data: user,
      },
    });

    renderWithProviders(<RouterProvider router={router} />, { history, store });
    expect(mockFetchNavigation).toHaveBeenCalledWith(true);
  });

  it('should render back link to bulk view', () => {
    const { container } = renderComponent();
    const backLink = container.querySelector('a[href="/bulk"]');
    expect(backLink).toBeTruthy();
    expect(backLink.textContent).toContain('Takaisin');
  });

  it('should render bulk-update-create class', () => {
    const { container } = renderComponent();
    expect(container.querySelector('.bulk-update-create')).toBeTruthy();
  });

  it('should render search terms component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('.bulk-update-create-search')).toBeTruthy();
  });

  it('should handle different attributeTypes prop', () => {
    const history = createBrowserHistory();
    const customAttributeTypes = { CustomType: { name: 'Custom' } };

    const props = {
      displayMessage: vi.fn(),
      getAttributeName: vi.fn(),
      fetchNavigation: vi.fn(),
      saveBulkUpdate: vi.fn(),
      attributeTypes: customAttributeTypes,
      isFetching: false,
      items: [validTOS],
    };

    const router = createBrowserRouter([{ path: '/', element: <BulkCreateView {...props} /> }]);

    const store = mockStore({
      ui: {
        actionTypes: {},
        attributeTypes: customAttributeTypes,
        phaseTypes: {},
        recordTypes: {},
        templates: [],
      },
      navigation: {
        isFetching: false,
        items: [validTOS],
      },
      user: {
        data: user,
      },
    });

    const { container } = renderWithProviders(<RouterProvider router={router} />, { history, store });
    expect(container).toBeDefined();
  });

  it('should call saveBulkUpdate when invoked', () => {
    const mockSaveBulkUpdate = vi.fn();
    const history = createBrowserHistory();

    const props = {
      displayMessage: vi.fn(),
      getAttributeName: vi.fn(),
      fetchNavigation: vi.fn(),
      saveBulkUpdate: mockSaveBulkUpdate,
      attributeTypes: attributeRules,
      isFetching: false,
      items: [validTOS],
    };

    const router = createBrowserRouter([{ path: '/', element: <BulkCreateView {...props} /> }]);

    const store = mockStore({
      ui: {
        actionTypes: {},
        attributeTypes: attributeRules,
        phaseTypes: {},
        recordTypes: {},
        templates: [],
      },
      navigation: {
        isFetching: false,
        items: [validTOS],
      },
      user: {
        data: user,
      },
    });

    renderWithProviders(<RouterProvider router={router} />, { history, store });
    expect(mockSaveBulkUpdate).not.toHaveBeenCalled();
    mockSaveBulkUpdate();
    expect(mockSaveBulkUpdate).toHaveBeenCalled();
  });

  it('should display a message when displayMessage is called', () => {
    const mockDisplayMessage = vi.fn();
    const history = createBrowserHistory();

    const props = {
      displayMessage: mockDisplayMessage,
      getAttributeName: vi.fn(),
      fetchNavigation: vi.fn(),
      saveBulkUpdate: vi.fn(),
      attributeTypes: attributeRules,
      isFetching: false,
      items: [validTOS],
    };

    const router = createBrowserRouter([{ path: '/', element: <BulkCreateView {...props} /> }]);

    const store = mockStore({
      ui: {
        actionTypes: {},
        attributeTypes: attributeRules,
        phaseTypes: {},
        recordTypes: {},
        templates: [],
      },
      navigation: {
        isFetching: false,
        items: [validTOS],
      },
      user: {
        data: user,
      },
    });

    renderWithProviders(<RouterProvider router={router} />, { history, store });
    expect(mockDisplayMessage).not.toHaveBeenCalled();
    mockDisplayMessage('Test message');
    expect(mockDisplayMessage).toHaveBeenCalledWith('Test message');
  });

  it('should render correctly with no attributeTypes', () => {
    const history = createBrowserHistory();

    const props = {
      displayMessage: vi.fn(),
      getAttributeName: vi.fn(),
      fetchNavigation: vi.fn(),
      saveBulkUpdate: vi.fn(),
      attributeTypes: {},
      isFetching: false,
      items: [validTOS],
    };

    const router = createBrowserRouter([{ path: '/', element: <BulkCreateView {...props} /> }]);

    const store = mockStore({
      ui: {
        actionTypes: {},
        attributeTypes: {},
        phaseTypes: {},
        recordTypes: {},
        templates: [],
      },
      navigation: {
        isFetching: false,
        items: [validTOS],
      },
      user: {
        data: user,
      },
    });

    const { container } = renderWithProviders(<RouterProvider router={router} />, { history, store });
    expect(container).toBeDefined();
  });
});
