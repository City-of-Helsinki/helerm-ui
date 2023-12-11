import React from 'react';
import { createBrowserHistory } from 'history';
import * as mockLogin from 'hds-react';

import renderWithProviders from '../../utils/renderWithProviders';
import AppContainer from '../AppContainer';
import routes from '../../routes';
import storeCreator from '../../store/createStore';
import mockUser from '../../utils/mocks/user.json';
import api from '../../utils/api';

const getUserMock = vitest.fn().mockImplementation(() => ({ profile: { sub: 'user123' } }));
const isAuthenticatedMock = vitest.fn().mockImplementation(() => true);
const mockToken = 'mockToken';
const mockApiGet = vitest.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => mockUser }));

vitest.spyOn(mockLogin, 'useOidcClient').mockImplementation(() => ({
  getUser: getUserMock,
  isAuthenticated: isAuthenticatedMock,
}));
vitest.spyOn(mockLogin, 'getApiTokenFromStorage').mockImplementation(() => mockToken);
vitest.spyOn(api, 'get').mockImplementation(mockApiGet);

const renderComponent = (history) => {
  const mockState = {};
  const mockStore = storeCreator(history, mockState);
  const mockRoutes = routes(mockStore);

  return renderWithProviders(
    <AppContainer
      history={history}
      routes={mockRoutes}
      store={mockStore}
      dispatchFetchAttributeTypes={vitest.fn()}
      dispatchFetchTemplates={vitest.fn()}
      dispatchRetrieveUserFromSession={vitest.fn()}
    />,
    {
      history,
      store: mockStore,
    },
  );
};

describe('<AppContainer />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    const { container } = renderComponent(history);

    expect(container).toMatchSnapshot();
  });

  it('should authenticate', () => {
    const history = createBrowserHistory();

    renderComponent(history);

    expect(getUserMock).toHaveBeenCalled();
    expect(isAuthenticatedMock).toHaveBeenCalled();
    expect(mockApiGet).toHaveBeenCalled();
  });

  it('should not fetch user if not authenticated', () => {
    const storageSpy = vitest.spyOn(mockLogin, 'getApiTokenFromStorage').mockImplementationOnce(() => undefined);

    vitest.spyOn(mockLogin, 'useOidcClient').mockImplementationOnce(() => ({
      getUser: vitest.fn().mockImplementation(() => undefined),
      isAuthenticated: vitest.fn().mockImplementation(() => false),
    }));

    const history = createBrowserHistory();

    renderComponent(history);

    expect(storageSpy).not.toHaveBeenCalled();
  });
});
