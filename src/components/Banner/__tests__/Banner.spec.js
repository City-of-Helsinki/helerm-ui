/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';

import storeCreator from '../../../store/createStore';
import Banner from '../Banner';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) Banner', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <Banner>
                <p className="test">Test string</p>
            </Banner>
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const banner = _wrapper.find('.helerm-banner');
        expect(banner).toBeDefined();
        expect(banner.children).toBeDefined();
    })
});