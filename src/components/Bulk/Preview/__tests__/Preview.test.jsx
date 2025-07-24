import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import Preview from '../Preview';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter history={history}>
      <Preview conversions={[]} />
    </BrowserRouter>,
    { history },
  );
};

describe('<Preview />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('renders with empty conversions', () => {
    const { container } = renderComponent();
    expect(container.querySelector('.preview')).toBeTruthy();
  });

  it('renders back button', () => {
    const { container } = renderComponent();
    const backButton = container.querySelector('.btn-link');
    expect(backButton).toBeTruthy();
    expect(backButton.textContent).toContain('Takaisin');
  });

  it('renders preview title', () => {
    const { container } = renderComponent();
    const title = container.querySelector('h3');
    expect(title).toBeTruthy();
    expect(title.textContent).toBe('Massamuutos esikatselu');
  });

  it('renders with conversions data', () => {
    const history = createBrowserHistory();
    const conversions = [
      { type: 'test', value: 'testValue', attribute: 'testAttribute' }
    ];

    const { container } = renderWithProviders(
      <BrowserRouter history={history}>
        <Preview 
          conversions={conversions}
          getAttributeName={vi.fn().mockReturnValue('Test Attribute')}
          getTypeName={vi.fn().mockReturnValue('Test Type')}
          isFinalPreview={false}
          items={{}}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          onSelect={vi.fn()}
        />
      </BrowserRouter>,
      { history },
    );

    expect(container.querySelector('.preview')).toBeTruthy();
  });

  it('calls onClose when back button is clicked', () => {
    const mockOnClose = vi.fn();
    const history = createBrowserHistory();

    const { container } = renderWithProviders(
      <BrowserRouter history={history}>
        <Preview 
          conversions={[]}
          getAttributeName={vi.fn()}
          getTypeName={vi.fn()}
          isFinalPreview={false}
          items={{}}
          onClose={mockOnClose}
          onConfirm={vi.fn()}
          onSelect={vi.fn()}
        />
      </BrowserRouter>,
      { history },
    );

    const backButton = container.querySelector('.btn-link');
    backButton.click();
    expect(mockOnClose).toHaveBeenCalled();
  });
});

