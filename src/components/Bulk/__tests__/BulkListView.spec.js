/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import storeCreator from '../../../store/createStore';
import BulkListView from '../BulkListView';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) BulkListView', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => { return 'testFunction'; }
    const dummyArray = [];

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <BulkListView fetchBulkUpdates={dummyFunction} push={dummyFunction} bulkUpdates={dummyArray} />
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const bulkListView = _wrapper.find('BulkListView');
        expect(bulkListView).toBeDefined();
    })
});