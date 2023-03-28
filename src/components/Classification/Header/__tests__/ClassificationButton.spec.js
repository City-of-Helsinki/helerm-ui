/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import storeCreator from '../../../../store/createStore';
import ClassificationButton from '../ClassificationButton';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) ClassificationButton', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => { return 'testFunction'; }

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <ClassificationButton 
                label='test'
                action={dummyFunction}
            />
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const element = _wrapper.find('ClassificationButton');
        expect(element).toBeDefined();
    })
});