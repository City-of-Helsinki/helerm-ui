/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';

import storeCreator from '../../../../store/createStore';
import Conversion from '../Conversion';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) Conversion', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => 'testFunction'

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <Conversion disabled={false} onConvert={dummyFunction} attributeTypes={{}} />
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const conversion = _wrapper.find('Conversion');
        expect(conversion).toBeDefined();
    })
});
