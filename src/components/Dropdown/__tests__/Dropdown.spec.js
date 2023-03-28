/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import storeCreator from '../../../store/createStore';
import Dropdown from '../Dropdown';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) Dropdown', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => { return 'test' };
    const dummyItems = [
        {action: dummyFunction},
        {action: dummyFunction}
    ]

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <Dropdown
                items={dummyItems}
            />
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const element = _wrapper.find('Dropdown');
        expect(element).toBeDefined();
    })
});