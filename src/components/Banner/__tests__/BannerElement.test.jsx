import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import storeCreator from '../../../store/createStore';
import BannerElement from '../BannerElement';

const renderComponent = () => {
  const history = mockHistory();
  const store = storeCreator(history, {});

  return render(
    <Provider store={store}>
      <Router history={history}>
        <BannerElement color='black'>
          <p className='test'>Test string</p>
        </BannerElement>
      </Router>
    </Provider>,
  );
};

describe('<BannerElement />', () => {
  it('renders without crashing', () => {
    renderComponent();

    const bannerElement = screen.getByRole('banner');
    expect(bannerElement).toBeInTheDocument();

    expect(bannerElement).toHaveStyle({ color: 'rgb(0, 0, 0)' });
  });
});
