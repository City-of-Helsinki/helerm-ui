import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import CloneView from '../CloneView';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const initialState = {
  navigation: {
    items: [],
    loading: false,
    error: null,
  },
  user: {
    data: { username: 'testuser' },
  },
};

// Mock Navigation component to focus on CloneView functionality
vi.mock('../../../Navigation/Navigation', () => ({
  default: vi.fn(({ onLeafMouseClick }) => (
    <div data-testid='navigation'>
      <button
        onClick={(event) =>
          onLeafMouseClick &&
          onLeafMouseClick(event, {
            name: 'Test Template',
            function: 'test-template-123',
          })
        }
      >
        Select Test Template
      </button>
    </div>
  )),
}));

const renderComponent = (props = {}, storeState = initialState) => {
  const store = mockStore(storeState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <CloneView
          templates={[]}
          setNavigationVisibility={vi.fn()}
          toggleCloneView={vi.fn()}
          cloneFromTemplate={vi.fn()}
          {...props}
        />
      </BrowserRouter>
    </Provider>,
  );
};

describe('<CloneView />', () => {
  it('Renders an unordered list', () => {
    renderComponent();

    const ul = screen.getByRole('list');
    expect(ul).toBeInTheDocument();
  });

  it('should switch to function method and show navigation', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Initially should be on template method (no navigation visible)
    expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();

    // Click on function tab to switch
    const functionTab = screen.getByText('Tuo kuvaus toisesta kuvauksesta');
    await user.click(functionTab);

    // Should show the navigation component
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('should handle navigation leaf click for selecting items', async () => {
    const user = userEvent.setup();
    const mockCloneFromTemplate = vi.fn();
    renderComponent({ cloneFromTemplate: mockCloneFromTemplate });

    // Switch to function method first
    const functionTab = screen.getByText('Tuo kuvaus toisesta kuvauksesta');
    await user.click(functionTab);

    // Now should see navigation and button
    const selectButton = screen.getByText('Select Test Template');
    await user.click(selectButton);

    // Should show selected item info
    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('Tuotava kuvaus:')).toBeInTheDocument();

    // Should show the "Tuo" (Import) button
    const cloneButton = screen.getByText('Tuo', { selector: 'button.btn-success' });
    expect(cloneButton).toBeInTheDocument();
    expect(cloneButton).toHaveClass('btn-success');

    // Click the clone button to trigger the actual cloning
    await user.click(cloneButton);

    // Should trigger the clone functionality with method and id
    expect(mockCloneFromTemplate).toHaveBeenCalledWith('function', 'test-template-123');
  });

  it('should render tabs correctly', async () => {
    renderComponent();

    // Should show both tabs
    expect(screen.getByText('Tuo kuvaus moduulista')).toBeInTheDocument();
    expect(screen.getByText('Tuo kuvaus toisesta kuvauksesta')).toBeInTheDocument();

    // Template tab should be active by default (based on HTML output)
    const templateTab = screen.getByText('Tuo kuvaus moduulista');
    expect(templateTab.parentElement).toHaveClass('active');

    // Function tab should not be active initially
    const functionTab = screen.getByText('Tuo kuvaus toisesta kuvauksesta');
    expect(functionTab.parentElement).not.toHaveClass('active');
  });

  it('should handle template cloning workflow', async () => {
    const user = userEvent.setup();
    const mockCloneFromTemplate = vi.fn();

    const templates = [
      { id: 'template-1', name: 'Test Template 1' },
      { id: 'template-2', name: 'Test Template 2' },
    ];

    renderComponent({
      cloneFromTemplate: mockCloneFromTemplate,
      templates,
    });

    // Should be on template tab by default
    const templateTab = screen.getByText('Tuo kuvaus moduulista');
    expect(templateTab.parentElement).toHaveClass('active');

    // Should show template list
    expect(screen.getByText('Test Template 1')).toBeInTheDocument();
    expect(screen.getByText('Test Template 2')).toBeInTheDocument();

    // Click on a template to select it
    const template1 = screen.getByText('Test Template 1');
    await user.click(template1);

    // Should show selected template info
    expect(screen.getByText('Test Template 1')).toBeInTheDocument();
    expect(screen.getByText('Tuotava kuvaus:')).toBeInTheDocument();

    // Should show the "Tuo" (Import) button
    const cloneButton = screen.getByText('Tuo', { selector: 'button.btn-success' });
    expect(cloneButton).toBeInTheDocument();

    // Click the clone button to trigger template cloning
    await user.click(cloneButton);

    // Should call cloneFromTemplate with 'template' method and template id
    expect(mockCloneFromTemplate).toHaveBeenCalledWith('template', 'template-1');
  });

  it('should allow switching between template and function methods', async () => {
    const user = userEvent.setup();
    const templates = [{ id: 'template-1', name: 'Test Template 1' }];

    renderComponent({ templates });

    // Initially on template tab
    const templateTab = screen.getByText('Tuo kuvaus moduulista');
    const functionTab = screen.getByText('Tuo kuvaus toisesta kuvauksesta');

    expect(templateTab.parentElement).toHaveClass('active');
    expect(functionTab.parentElement).not.toHaveClass('active');

    // Should show template list
    expect(screen.getByText('Test Template 1')).toBeInTheDocument();

    // Switch to function tab
    await user.click(functionTab);

    // Should now show navigation instead of template list
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.queryByText('Test Template 1')).not.toBeInTheDocument();

    // Function tab should now be active
    expect(functionTab.parentElement).toHaveClass('active');
    expect(templateTab.parentElement).not.toHaveClass('active');

    // Switch back to template tab
    await user.click(templateTab);

    // Should show template list again
    expect(screen.getByText('Test Template 1')).toBeInTheDocument();
    expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
  });
});
