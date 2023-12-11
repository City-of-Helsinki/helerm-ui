import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import CoreLayout from '../CoreLayout/CoreLayout';
import renderWithProviders from '../../utils/renderWithProviders';

const renderComponent = (history) =>
  renderWithProviders(
    <Router history={history}>
      <CoreLayout />
    </Router>,
    {
      history,
    },
  );

describe('<CoreLayout />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    const { container } = renderComponent(history);

    expect(container).toMatchSnapshot();
  });
});
