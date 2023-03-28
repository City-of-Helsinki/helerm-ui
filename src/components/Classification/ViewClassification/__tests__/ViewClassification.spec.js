/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import storeCreator from '../../../../store/createStore';
import ViewClassification from '../ViewClassification';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) ViewClassification', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => { return 'test' };

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <ViewClassification
                clearClassification={dummyFunction}
                createTos={dummyFunction}
                displayMessage={dummyFunction}
                fetchClassification={dummyFunction}
                match={{}}
                push={dummyFunction}
                setNavigationVisibility={dummyFunction}
            />
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const element = _wrapper.find('ViewClassification');
        expect(element).toBeDefined();
    })
});