import { BrowserRouter } from 'react-router-dom';

import PrintView from '../PrintView';
import renderWithProviders, { createTestStore } from '../../../../utils/renderWithProviders';
import { validTOS, attributeTypes, classification } from '../../../../utils/__mocks__/mockHelpers';
import * as useAuth from '../../../../hooks/useAuth';

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');

  return {
    ...mod,
    useParams: vi.fn(() => ({
      id: 'test',
      version: '1',
    })),
  };
});

vi.spyOn(useAuth, 'default').mockImplementation(() => ({
  getApiToken: vi.fn(() => 'mock-token'),
  isAuthenticated: true,
  user: { name: 'Test User' },
}));

const renderComponent = (propOverrides) => {
  const store = createTestStore({
    ui: {
      attributeTypes: attributeTypes,
    },
    navigation: {
      items: [validTOS],
    },
    selectedTOS: {
      ...validTOS,
      id: 'test',
      version: '1',
      classification: classification[0],
    },
  });

  const props = {
    fetchTOS: vi.fn().mockImplementation(() => Promise.resolve(validTOS)),
    setNavigationVisibility: vi.fn(),
    ...propOverrides,
  };

  return renderWithProviders(
    <BrowserRouter>
      <PrintView {...props} />
    </BrowserRouter>,
    { store },
  );
};

describe('<PrintView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
