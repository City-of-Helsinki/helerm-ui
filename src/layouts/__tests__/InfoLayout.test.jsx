import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';

import InfoLayout from '../InfoLayout/InfoLayout';
import renderWithProviders from '../../utils/renderWithProviders';

const renderComponent = (history) =>
  renderWithProviders(
    <Router history={history}>
      <InfoLayout />
    </Router>,
    {
      history,
    },
  );

describe('<InfoLayout />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    const { container } = renderComponent(history);

    expect(container).toMatchSnapshot();
  });
});
