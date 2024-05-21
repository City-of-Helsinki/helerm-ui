import React from 'react';
import { render, screen } from '@testing-library/react';

import CloneView from '../CloneView';

const renderComponent = () =>
  render(
    <CloneView
      {...{
        templates: [],
        setNavigationVisibility: vi.fn(),
      }}
    />,
  );

describe('<CloneView />', () => {
  it('Renders an unordered list', () => {
    renderComponent();

    const ul = screen.getByRole('list');

    expect(ul).toBeInTheDocument();
  });
});
