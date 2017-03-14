import React from 'react';
import './EditorForm.scss';
import update from 'immutability-helper';
// import find from 'lodash/find';

export class EditorForm extends React.Component {
  constructor (props) {
    super(props);
    this.generateAttributeElements = this.generateAttributeElements.bind(this);
    this.getActiveValue = this.getActiveValue.bind(this);
    this.getCheckedState = this.getCheckedState.bind(this);
    this.closeEditorForm = this.closeEditorForm.bind(this);
    this.state = {
      newAttributes: this.initializeState(this.props.attributeTypes),
      recordName: {
        value: this.props.record.name
          ? this.props.record.name
          : '',
        checked: true
      },
      recordType: {
        value: this.props.record.attributes.RecordType
          ? this.props.record.attributes.RecordType
          : '',
        checked: true
      }
    };
  }

  initializeState (attributeTypes) {
    const { attributes } = this.props.record;
    let initialState = {};
    for (const key in attributeTypes) {
      if (attributeTypes.hasOwnProperty(key)) {
        initialState = Object.assign({}, initialState, {
          [key]: {
            name: attributes[key] ? attributes[key] : null,
            checked: true
          }
        });
      }
    };
    return initialState;
  }

  // findRecordTypeFromList (recordType) {
  //   const correctType = find(this.props.recordTypes, (type) => (
  //     type.name === recordType
  //   ));
  //   return correctType;
  // }

  onChange (e, key, field) {
    const newValue = e;
    this.setState(update(this.state, {
      newAttributes: {
        [key]: {
          [field]: {
            $set: newValue
          }
        }
      }
    }));
  }

  onBaseAttributeChange (e, key, field) {
    const newValue = e;
    this.setState(update(this.state, {
      [key]: {
        [field]: {
          $set: newValue
        }
      }
    }));
  }

  getActiveValue (key) {
    if (this.state.newAttributes[key].name) {
      return this.state.newAttributes[key].name;
    }
  }

  getCheckedState (key) {
    if (this.props.editorConfig.action === 'edit' && !this.state.newAttributes[key].name) {
      return false;
    } else {
      return this.state.newAttributes[key].checked;
    }
  }

  generateAttributeElements (attributeTypes) {
    const attributeElements = [];
    for (const key in attributeTypes) {
      if (attributeTypes.hasOwnProperty(key)) {
        if (attributeTypes[key].values.length) {
          const options = attributeTypes[key].values.map((option, index) => (
            <option key={index} value={option.value}>{option.value}</option>
          ));
          attributeElements.push(
            <div key={key} className='col-xs-12 col-lg-6 form-group'>
              <input
                type='checkbox'
                checked={this.getCheckedState(key)}
                value={this.state.newAttributes[key].checked}
                onChange={(e) => this.onChange(!this.state.newAttributes[key].checked, key, 'checked')}/>
              <label className='edit-record__label'>
                {attributeTypes[key].name}
                { attributeTypes[key].required &&
                <span className='fa fa-asterisk required-asterisk'/>
                }
              </label>
              <select
                value={this.getActiveValue(key)}
                className='form-control edit-record__select'
                onChange={(e) => this.onChange(e.target.value, key, 'name')}
                disabled={!this.state.newAttributes[key].checked}>
                <option value={null}>[ Tyhjä ]</option>
                { options }
              </select>
            </div>
          );
        } else if (attributeTypes[key].values.length === 0) {
          attributeElements.push(
            <div key={key} className='col-xs-12 col-lg-6 form-group'>
              <input
                type='checkbox'
                checked={this.getCheckedState(key)}
                value={this.state.newAttributes[key].checked}
                onChange={(e) => this.onChange(!this.state.newAttributes[key].checked, key, 'checked')}
              />
              <label className='edit-record__label'>
                {attributeTypes[key].name}
                { attributeTypes[key].required &&
                <span className='fa fa-asterisk required-asterisk'/>
                }
              </label>
              <input
                className='form-control edit-record__input'
                value={this.getActiveValue(key)}
                placeholder={attributeTypes[key].name}
                onChange={(e) => this.onChange(e.target.value, key, 'name')}
                disabled={!this.state.newAttributes[key].checked}
              />
            </div>
          );
        }
      }
    }
    return attributeElements;
  }

  generateDropdown (recordTypes) {
    const options = [];
    for (const key in recordTypes) {
      if (recordTypes.hasOwnProperty(key)) {
        options.push(
          <option key={key} value={recordTypes[key].name}>
            {recordTypes[key].name}
          </option>
        );
      }
    }
    return (
      <select
        value={this.state.recordType.value}
        className='form-control col-xs-6'
        onChange={(e) => this.onBaseAttributeChange(e.target.value, 'recordType', 'value')}>
        <option value={null}>[ Tyhjä ]</option>
        {options}
      </select>
    );
  }

  addRecord (e, actionId) {
    e.preventDefault();
    const { recordName, recordType, newAttributes } = this.state;
    this.props.createRecord(actionId, recordName.value, recordType.value, newAttributes);
    this.props.displayMessage({
      text: 'Asiakirjan lisäys onnistui!',
      success: true
    });
  }

  editRecord (e, actionId) {
    e.preventDefault();
    const { recordName, recordType, newAttributes } = this.state;
    this.props.editRecordWithForm(this.props.record.id, recordName.value, recordType.value, newAttributes);
    this.props.displayMessage({
      text: 'Asiakirjan muokkaus onnistui!',
      success: true
    });
  }

  resolveOnSubmit (e, actionId) {
    const { action, type } = this.props.editorConfig;

    switch (type) {
      case 'tos':
        if (action === 'edit') {
          // this.editMetaData(e, actionId);
        }
        break;
      case 'phase':
        if (action === 'add') {
          // this.addPhase(e, actionId);
        }
        if (action === 'edit') {
          // this.editPhase(e, actionId);
        }
        break;
      case 'action':
        if (action === 'add') {
          // this.addAction(e, actionId);
        }
        if (action === 'edit') {
          // this.editAction(e, actionId);
        }
        break;
      case 'record':
        if (action === 'add') {
          this.addRecord(e, actionId);
        }
        if (action === 'edit') {
          this.editRecord(e, actionId);
        }
    }
  }

  closeEditorForm (e) {
    e.preventDefault();
    this.props.closeEditorForm();
  }

  render () {
    const { attributeTypes, recordTypes, actionId } = this.props;
    const attributeElements = this.generateAttributeElements(attributeTypes);
    const typeDropdown = this.generateDropdown(recordTypes);
    return (
      <div className='action add-box col-xs-12'>
        <h4>{ this.props.editRecordWithForm ? 'Muokkaa asiakirjaa' : 'Uusi asiakirja' }</h4>
        <form onSubmit={(e) => this.resolveOnSubmit(e, actionId)}
              className='edit-record'>
          <div className='col-xs-12 col-lg-6 form-group'>
            <label className='edit-record__label'>Asiakirjatyypin tarkenne</label>
            <span className='fa fa-asterisk required-asterisk'/>
            <input
              className='col-xs-6 form-control edit-record__input'
              placeholder='Tarkenne'
              value={this.state.recordName.value}
              onChange={(e) => this.onBaseAttributeChange(e.target.value, 'recordName', 'value')}/>
          </div>
          <div className='col-xs-12 col-lg-6 form-group'>
            <label className='edit-record__label'>Tyyppi</label>
            <span className='fa fa-asterisk required-asterisk'/>
            { typeDropdown }
          </div>
          { attributeElements }
          <div className='col-xs-12'>
            <button className='btn btn-primary pull-right edit-record__submit' type='submit'>Valmis</button>
            <button
              className='btn btn-danger pull-right edit-record__cancel'
              onClick={(e) => this.closeEditorForm(e)}>
              Peruuta
            </button>
          </div>
        </form>
      </div>
    );
  }
}

EditorForm.propTypes = {
  actionId: React.PropTypes.string,
  attributeTypes: React.PropTypes.object.isRequired,
  closeEditorForm: React.PropTypes.func.isRequired,
  createRecord: React.PropTypes.func,
  displayMessage: React.PropTypes.func.isRequired,
  editRecordWithForm: React.PropTypes.func,
  editorConfig: React.PropTypes.shape({
    type: React.PropTypes.string.isRequired,
    action: React.PropTypes.string.isRequired
  }),
  record: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    attributes: React.PropTypes.object.isRequired
  }),
  recordTypes: React.PropTypes.object.isRequired
};

export default EditorForm;
