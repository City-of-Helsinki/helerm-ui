import React from 'react';
import './EditorForm.scss';
import update from 'immutability-helper';
import Select from 'react-select';
import includes from 'lodash/includes';

export class EditorForm extends React.Component {
  constructor (props) {
    super(props);
    this.generateAttributeElements = this.generateAttributeElements.bind(this);
    this.getActiveValue = this.getActiveValue.bind(this);
    this.getCheckedState = this.getCheckedState.bind(this);
    this.closeEditorForm = this.closeEditorForm.bind(this);
    this.state = {
      newAttributes: this.initializeAttributes(this.props.attributeTypes),
      recordName: {
        value: this.props.recordConfig ? this.props.recordConfig.recordName : '',
        checked: true
      },
      recordType: {
        value: this.props.attributes.RecordType || '',
        checked: true
      }
    };
  }

  initializeAttributes (attributeTypes) {
    const { attributes } = this.props;
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
    }
    return initialState;
  }

  // findRecordTypeFromList (recordType) {
  //   const correctType = find(this.props.recordTypes, (type) => (
  //     type.name === recordType
  //   ));
  //   return correctType;
  // }

  onChange (value, key, field) {
    this.setState(update(this.state, {
      newAttributes: {
        [key]: {
          [field]: {
            $set: value
          }
        }
      }
    }));
  }

  onBaseAttributeChange (value, key, field) {
    this.setState(update(this.state, {
      [key]: {
        [field]: {
          $set: value
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

  getAttributesToShow (attributeTypes, attributes) {
    const { newAttributes } = this.state;
    const attributesToShow = [];
    const getAttributeKeys = (attributes) => {
      const attributeKeys = [];
      for (const key in attributes) {
        attributeKeys.push(key);
      }
      return attributeKeys;
    };

    for (const attributeType in attributeTypes) {
      if (attributeTypes[attributeType].required || includes(getAttributeKeys(attributes), attributeType)) {
        attributesToShow.push(attributeType);
      }
      if (attributeTypes[attributeType].requiredIf.length) { // if has requiredIf
        const requiredIf = attributeTypes[attributeType].requiredIf;
        for (const attribute in newAttributes) { // for each attribute
          for (const item in requiredIf) { // for each item in requiredIf
            if (requiredIf[item].key === attribute) { // if requiredIf has attribute
              if (includes(requiredIf[item].values, newAttributes[attribute].name)) { // if requiredIf has same value as attribute
                attributesToShow.push(attributeType);
              }
            }
          }
        }
      }
    }
    return attributesToShow;
  }

  getComplementAttributes (attributeTypes, attributesToShow) {
    const complementAttributes = [];
    const unwantedAttributes = ['PhaseType', 'ActionType', 'RecordType'];

    for (const key in attributeTypes) {
      if (!includes(attributesToShow, key) && !includes(unwantedAttributes, key)) {
        complementAttributes.push(key);
      }
    }
    return complementAttributes;
  }

  generateOptions (array) {
    return array.map(item => ({
      value: item.value,
      label: item.value
    }));
  }

  generateAttributeElements (attributeTypes) {
    let attributesToShow = this.getAttributesToShow(attributeTypes, this.props.attributes);
    if (this.props.editorConfig.action === 'complement') {
      attributesToShow = this.getComplementAttributes(attributeTypes, attributesToShow);
    }
    const attributeElements = [];

    for (const key in attributeTypes) {
      if (attributeTypes.hasOwnProperty(key)) {
        if (includes(attributesToShow, key) && attributeTypes[key].values.length) {
          const options = this.generateOptions(attributeTypes[key].values);

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
              <Select
                placeholder='Valitse...'
                autoBlur={true}
                autofocus={false}
                className='form-control edit-record__select'
                clearable={true}
                disabled={!this.state.newAttributes[key].checked}
                onChange={(option) => this.onChange(option ? option.value : null, key, 'name')}
                openOnFocus={true}
                options={options}
                value={this.getActiveValue(key)}
              />
            </div>
          );
        } else if (includes(attributesToShow, key) && attributeTypes[key].values.length === 0) {
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
    const optionsRaw = Object.keys(recordTypes).map(record => {
      return { value: recordTypes[record].name, label: recordTypes[record].name };
    });
    const options = this.generateOptions(optionsRaw);

    return (
      <Select
        placeholder='Valitse...'
        autoBlur={true}
        autofocus={false}
        className='form-control col-xs-6'
        clearable={true}
        onChange={(option) => this.onBaseAttributeChange(option ? option.value : null, 'recordType', 'value')}
        openOnFocus={true}
        options={options}
        value={this.state.recordType.value}
      />
    );
  }

  filterAttributes (attributes) {
    const filteredAttributes = Object.assign({}, attributes);
    for (const key in filteredAttributes) {
      if (!filteredAttributes[key].name) {
        delete filteredAttributes[key];
      }
    }
    return filteredAttributes;
  }

  editMetaData (e) {
    e.preventDefault();
    const { newAttributes } = this.state;
    this.props.editMetaDataWithForm(this.filterAttributes(newAttributes));
    this.props.displayMessage({
      title: 'Metatiedot',
      body: 'Tietojen muokkaus onnistui!'
    });
  }

  addRecord (e, targetId) {
    e.preventDefault();
    const { recordName, recordType, newAttributes } = this.state;

    this.props.recordConfig.createRecord(
      targetId,
      recordName.value,
      recordType.value,
      this.filterAttributes(newAttributes)
    );
    this.props.displayMessage({
      title: 'Asiakirja',
      body: 'Asiakirjan lisäys onnistui!'
    });
  }

  editRecord (e, targetId) {
    e.preventDefault();
    const { recordName, recordType, newAttributes } = this.state;
    this.props.recordConfig.editRecordWithForm(
      targetId,
      recordName.value,
      recordType.value,
      this.filterAttributes(newAttributes)
    );
    this.props.displayMessage({
      title: 'Asiakirja',
      body: 'Asiakirjan muokkaus onnistui!'
    });
  }

  resolveLabel () {
    const { type, action } = this.props.editorConfig;

    switch (type) {
      case 'tos':
        return 'Muokkaa metatietoja';
      case 'phase':
        return action === 'add' ? 'Uusi käsittelyvaihe' : 'Muokkaa käsittelyvaihetta';
      case 'action':
        return action === 'add' ? 'Uusi toimenpide' : 'Muokkaa toimenpidettä';
      case 'record':
        return action === 'add' ? 'Uusi asiakirja' : 'Muokkaa asiakirjaa';
    }
  }

  resolveOnSubmit (e, targetId) {
    const { action, type } = this.props.editorConfig;

    switch (type) {
      case 'tos':
        if (action === 'edit' || action === 'complement') {
          this.editMetaData(e);
        }
        break;
      case 'phase':
        if (action === 'edit' || action === 'complement') {
          // this.editPhase(e, targetId);
        }
        break;
      case 'action':
        if (action === 'edit' || action === 'complement') {
          // this.editAction(e, targetId);
        }
        break;
      case 'record':
        if (action === 'add') {
          this.addRecord(e, targetId);
        }
        if (action === 'edit' || action === 'complement') {
          this.editRecord(e, targetId);
        }
    }
  }

  closeEditorForm (e) {
    e.preventDefault();
    this.props.closeEditorForm();
  }

  renderDescriptions () {
    const typeDropdown = this.generateDropdown(this.props.recordConfig.recordTypes);

    return (
      <div>
        <div className='col-xs-12 col-lg-6 form-group'>
          <label className='edit-record__label'>Tarkenne</label>
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
      </div>
    );
  }

  render () {
    const { attributeTypes, targetId } = this.props;
    const attributeElements = this.generateAttributeElements(attributeTypes);

    return (
      <div className='action add-box col-xs-12'>
        <h4>{this.resolveLabel()}</h4>
        <form onSubmit={(e) => this.resolveOnSubmit(e, targetId)}
              className='edit-record'>
          { this.props.editorConfig.type !== 'tos' ? this.renderDescriptions() : null }
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
  attributeTypes: React.PropTypes.object.isRequired,
  attributes: React.PropTypes.object.isRequired,
  closeEditorForm: React.PropTypes.func.isRequired,
  displayMessage: React.PropTypes.func.isRequired,
  editMetaDataWithForm: React.PropTypes.func,
  editorConfig: React.PropTypes.shape({
    type: React.PropTypes.string.isRequired,
    action: React.PropTypes.string.isRequired
  }),
  recordConfig: React.PropTypes.shape({
    editRecordWithForm: React.PropTypes.func,
    recordTypes: React.PropTypes.object.isRequired,
    createRecord: React.PropTypes.func,
    recordId: React.PropTypes.string,
    recordName: React.PropTypes.string
  }),
  targetId: React.PropTypes.string
};

export default EditorForm;
