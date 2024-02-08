/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';

import storeCreator from '../../../../store/createStore';
import SearchResults from '../SearchResults';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) SearchResult', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => 'testFunction'
    const dummyArray = [];

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <SearchResults onSelect={dummyFunction} onSelectAll={dummyFunction} searchResults={dummyArray} hits={{phases: 0, actions: 0, records: 0}} />
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const searchResult = _wrapper.find('SearchResult');
        expect(searchResult).toBeDefined();
    })
});
