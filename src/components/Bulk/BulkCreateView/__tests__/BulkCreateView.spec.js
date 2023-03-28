/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import storeCreator from '../../../../store/createStore';
import BulkCreateView from '../BulkCreateView';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) BulkCreateView', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => { return 'testFunction'; }
    const dummyArray = [];
    const dummyObject = {};

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <BulkCreateView 
                displayMessage={dummyFunction}
                fetchNavigation={dummyFunction}
                getAttributeName={dummyFunction}
                saveBulkUpdate={dummyFunction}
                items={dummyArray}
                history={dummyObject}/>

        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const element = _wrapper.find('BulkCreateView');
        expect(element).toBeDefined();
    })
});