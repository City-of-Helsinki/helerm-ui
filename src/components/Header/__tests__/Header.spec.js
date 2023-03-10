/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import Header from '../Header';
import storeCreator from '../../../store/createStore';

// a quick fix before the official enzyme adapter for React 17 is out
// https://github.com/enzymejs/enzyme/issues/2429
Enzyme.configure({ adapter: new Adapter() });

describe('(Component) Header', () => {
  let _wrapper;

  const history = mockHistory();
  const store = storeCreator(history, {});

  beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
      <Router history={history}>
        <Header isFetching={false} />
      </Router>
    </Provider>);
  });

  it('Renders a nav bar with correct title', () => {
    const nav = _wrapper.find('nav');
    const title = nav.find('Link');
    expect(nav).toBeDefined();
    expect(title).toBeDefined();

    expect(title.children().at(1).text()).toMatch(/Tiedonohjaus/);
  });
});
