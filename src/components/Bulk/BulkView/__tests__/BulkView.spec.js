/* eslint-disable no-underscore-dangle */
import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';

import storeCreator from '../../../../store/createStore';
import BulkView from '../BulkView';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) SearchTerm', () => {

    let _wrapper;

    const history = mockHistory();
    const store = storeCreator(history, {});
    const dummyFunction = () => 'testFunction'

    beforeEach(() => {
    _wrapper = mount(<Provider store={store}>
        <Router history={history}>
            <BulkView
                approveBulkUpdate={dummyFunction}
                clearSelectedBulkUpdate={dummyFunction}
                deleteBulkUpdate={dummyFunction}
                displayMessage={dummyFunction}
                fetchBulkUpdate={dummyFunction}
                fetchNavigation={dummyFunction}
                getAttributeName={dummyFunction}
                // isFetchingNavigation: PropTypes.bool,
                // isUpdating: PropTypes.bool,
                items={[]}
                // itemsIncludeRelated: PropTypes.bool,
                match={{}}
                push={dummyFunction}
                // selectedBulk: PropTypes.object,
                updateBulkUpdate={dummyFunction}
            />
        </Router>
    </Provider>);
    });

    it('renders without crashing', () => {
        const element = _wrapper.find('BulkView');
        expect(element).toBeDefined();
    })
});