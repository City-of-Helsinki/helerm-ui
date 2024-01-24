/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';

import storeCreator from '../../../../store/createStore';
import SearchTerms from '../SearchTerms';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) SearchTerms', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => 'testFunction'

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <SearchTerms
                attributeValues={{}}
                onSearch={dummyFunction}
                resetSearchResults={dummyFunction}
                searchTerms={[]}
            />
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const element = _wrapper.find('SearchTerms');
        expect(element).toBeDefined();
    })
});
