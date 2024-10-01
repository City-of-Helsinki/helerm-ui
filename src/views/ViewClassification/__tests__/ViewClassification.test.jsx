import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import renderWithProviders from '../../../utils/renderWithProviders';
import classification from '../../../utils/mocks/classification.json';
import ViewClassification from '../ViewClassification';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');

  return {
    ...mod,
    useParams: () => ({
      id: 'test',
    }),
  };
});

const renderComponent = (propOverrides) => {
  const history = createBrowserHistory();

  const props = {
    classification,
    fetchClassification: vi.fn().mockResolvedValue({ data: 'ok' }),
    setNavigationVisibility: vi.fn(),
    clearClassification: vi.fn(),
    createTos: vi.fn(),
    displayMessage: vi.fn(),
    navigate: vi.fn(),
    ...propOverrides,
  };

  const store = mockStore({
    classification,
  });

  return renderWithProviders(
    <BrowserRouter>
      <ViewClassification {...props} />
    </BrowserRouter>,
    { history, store },
  );
};

describe('<ViewClassification />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('fetches classification on mount', async () => {
    const fetchClassificationMock = vi.fn().mockResolvedValue({ data: 'ok' });

    renderComponent({ fetchClassification: fetchClassificationMock });

    expect(fetchClassificationMock).toHaveBeenCalled();
  });

  it('should handle fetch classificitaion error', async () => {
    const fetchClassificationMock = vi.fn().mockRejectedValue(new URIError('ERROR'));

    renderComponent({ fetchClassification: fetchClassificationMock });

    expect(fetchClassificationMock).toHaveBeenCalled();
  });
});
