/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';

import storeCreator from '../../../store/createStore';
import SearchInput from '../SearchInput';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) searchInput', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => 'testFunction'

    beforeEach(() => {
    _wrapper = mount(
        <Provider store={store}>
            <Router history={history}>
                <SearchInput setSearchInput={dummyFunction}  />
            </Router>
        </Provider>);
    });

    it('renders without crashing', () => {
        const searchInput = _wrapper.find('SearchInput');
        expect(searchInput).toBeDefined();
    })
    it('has the correct setSearchInput function', () => {
        const searchInput = _wrapper.find('SearchInput');
        expect(searchInput.props().setSearchInput()).toEqual('testFunction');
    })
});