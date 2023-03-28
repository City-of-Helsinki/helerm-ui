/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import storeCreator from '../../../../../store/createStore';
import Preview from '../Preview';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) Preview', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => { return 'testFunction'; }

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <Preview 
                conversions={[]}
                getAttributeName={dummyFunction}
                getTypeName={dummyFunction}
                isFinalPreview={true}
                items={{}}
                onClose={dummyFunction}
                onConfirm={dummyFunction}
                onSelect={dummyFunction}
            />
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const element = _wrapper.find('Preview');
        expect(element).toBeDefined();
    })
});