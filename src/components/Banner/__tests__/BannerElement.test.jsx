/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';

import storeCreator from '../../../store/createStore';
import BannerElement from '../BannerElement';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) BannerElement', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <BannerElement color="black">
                <p className="test">Test string</p>
            </BannerElement>
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const bannerElement = _wrapper.find('BannerElement');
        expect(bannerElement).toBeDefined();
    })
    it('has the default props overwritten properly', () => {
        const bannerElement = _wrapper.find('BannerElement');
        expect(bannerElement.props().color).toBeDefined();
        expect(bannerElement.props().color).toEqual("black");
    })
});