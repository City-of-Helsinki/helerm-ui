/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import storeCreator from '../../../../store/createStore';
import VersionSelector from '../VersionSelector';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) VersionSelector', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyVersionShape = {
        version: 123,
        state: 'test',
        modified_at: new Date().toISOString(),
    }

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <VersionSelector 
                classificationId='test'
                currentVersion={123}
                history={{}}
                versions={[dummyVersionShape]}
            />
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const element = _wrapper.find('VersionSelector');
        expect(element).toBeDefined();
    })
});