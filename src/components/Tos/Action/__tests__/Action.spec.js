/* eslint-disable no-underscore-dangle */
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';

import Action from '../Action';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) Action', () => {
    let _wrapper;
    const attributeTypes = { TypeSpecifier: {defaultIn: []} }
    const actionRecords = {
        row1: 'testi1',
        row2: 'testi2',
        row3: 'testi3',
    }
    const records = {
        testi1: {},
        testi2: {}
    }
    const testFunc = () => true
    beforeEach(() => {
        _wrapper = mount(
        <Action
            action={{attributes: {showAttributes: false}, is_open: true, records: []}}
            actionTypes={{}}
            actions={{records}}
            addRecord={testFunc}
            attributeTypes={attributeTypes}
            changeOrder={testFunc}
            displayMessage={testFunc}
            documentState="test"
            editAction={testFunc}
            editActionAttribute={testFunc}
            editRecord={testFunc}
            editRecordAttribute={testFunc}
            importItems={testFunc}
            phases={{}}
            phasesOrder={[]}
            recordTypes={{}}
            records={records}
            removeAction={testFunc}
            removeRecord={testFunc}
            setActionVisibility={testFunc}
            setRecordVisibility={testFunc}
        />
        );
    });

    it('should render without crashing', () => {
        expect(_wrapper).toBeDefined()
    });
    
    it('should have correct state when creating or canceling new record creation', () => {
        const inst = _wrapper.instance();
        expect(inst.state.creatingRecord).toEqual(false);
        inst.createNewRecord();
        expect(inst.state.creatingRecord).toEqual(true);
        inst.cancelRecordCreation();
        expect(inst.state.creatingRecord).toEqual(false);
    })

    it('should be able to generate record elements', () => {
        const inst = _wrapper.instance();
        const generatedRecords = inst.generateRecords(actionRecords);
        expect(generatedRecords.length).toBeGreaterThan(0);
        expect(generatedRecords.length).toEqual(2);
    });
});