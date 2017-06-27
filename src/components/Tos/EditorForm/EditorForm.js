import React from 'react';
import './EditorForm.scss';
import update from 'immutability-helper';
import includes from 'lodash/includes';
import capitalize from 'lodash/capitalize';
import sortBy from 'lodash/sortBy';

import DropdownInput from '../DropdownInput/DropdownInput';
import { validateConditionalRules } from '../../../utils/validators';

export class EditorForm extends React.Component {
  constructor (props) {
    super(props);
    this.generateAttributeElements = this.generateAttributeElements.bind(this);
    this.getActiveValue = this.getActiveValue.bind(this);
    this.getCheckedState = this.getCheckedState.bind(this);
    this.closeEditorForm = this.closeEditorForm.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onFormInputChange = this.onFormInputChange.bind(this);
    this.state = {
      newAttributes: this.initializeAttributes(this.props.attributeTypes)
    };
  }

  initializeAttributes (attributeTypes) {
    const { attributes } = this.props;
    let initialState = {};
    for (const key in attributeTypes) {
      if (attributeTypes.hasOwnProperty(key)) {
        initialState = Object.assign({}, initialState, {
          [key]: {
            value: attributes[key] ? attributes[key] : null,
            checked: true
          }
        });
      }
    }
    return initialState;
  }

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

  onFormInputChange (value, key, field) {
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

  getActiveValue (key) {
    if (this.state.newAttributes[key].value) {
      return this.state.newAttributes[key].value;
    }
  }

  getCheckedState (key) {
    if (this.props.editorConfig.action === 'edit' && !this.state.newAttributes[key].value) {
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
      if (includes(attributeTypes[attributeType].allowedIn, this.props.editorConfig.type)) {
        if (attributeTypes[attributeType].requiredIf.length) {
          if (validateConditionalRules(attributeType, attributeTypes, newAttributes)) {
            attributesToShow.push(attributeType);
            continue;
          }
        }
        if (attributeTypes[attributeType].required ||
          includes(getAttributeKeys(attributes), attributeType)) {
          attributesToShow.push(attributeType);
          continue;
        }
      }
    }

    return this.prepareAttributes(attributesToShow);
  }

  getComplementAttributes (attributeTypes, attributesToShow) {
    const { newAttributes } = this.state;
    const complementAttributes = [];

    for (const key in attributeTypes) {
      if (includes(attributeTypes[key].allowedIn, this.props.editorConfig.type)) {
        if (attributeTypes[key].requiredIf.length) {
          if (validateConditionalRules(key, attributeTypes, newAttributes)) {
            complementAttributes.push(key);
          }
        } else {
          complementAttributes.push(key);
        }
      }
    }

    return this.prepareAttributes(complementAttributes);
  }

  prepareAttributes (attributesToShow) {
    attributesToShow.splice(attributesToShow.indexOf(`${capitalize(this.props.editorConfig.type)}Type`), 1);
    attributesToShow.splice(attributesToShow.indexOf('TypeSpecifier'), 1);

    const sortedAttributes = sortBy(attributesToShow, (attribute) => (
      this.props.attributeTypes[attribute].index
    ));

    return sortedAttributes;
  }

  mapOptions (array) {
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

    if (attributesToShow.length) {
      for (const key of attributesToShow) {
        if (attributeTypes.hasOwnProperty(key)) {
          if (attributeTypes[key].values.length) {
            const options = this.mapOptions(attributeTypes[key].values);
            attributeElements.push(
              <div key={key} className='col-xs-12 col-lg-6 form-group'>
                <input
                  type='checkbox'
                  checked={this.getCheckedState(key)}
                  value={this.state.newAttributes[key].checked}
                  onChange={(e) => this.onChange(!this.state.newAttributes[key].checked, key, 'checked')}/>
                <label className='editor-form__label'>
                  {attributeTypes[key].name}
                  { attributeTypes[key].required &&
                  <span className='fa fa-asterisk required-asterisk'/>
                  }
                </label>
                <DropdownInput
                  keyValue={key}
                  type={'form'}
                  selectClassName={'form-control editor-form__select'}
                  inputClassName={'form-control edit-attribute__input'}
                  disabled={!this.state.newAttributes[key].checked}
                  valueState={this.getActiveValue(key)}
                  options={options}
                  onChange={this.onChange}
                  onInputChange={this.onFormInputChange}
                  onSubmit={() => null}
                />
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
                <label className='editor-form__label'>
                  {attributeTypes[key].name}
                  { attributeTypes[key].required &&
                  <span className='fa fa-asterisk required-asterisk'/>
                  }
                </label>
                { key === 'AdditionalInformation'
                  ? <textarea
                      className='form-control edit-record__input'
                      value={this.getActiveValue(key)}
                      placeholder={attributeTypes[key].name}
                      onChange={(e) => this.onChange(e.target.value, key, 'value')}
                      disabled={!this.state.newAttributes[key].checked}
                    />
                  : <input
                      className='form-control edit-record__input'
                      value={this.getActiveValue(key)}
                      placeholder={attributeTypes[key].name}
                      onChange={(e) => this.onChange(e.target.value, key, 'value')}
                      disabled={!this.state.newAttributes[key].checked}
                    />
                }
              </div>
            );
          }
        }
      }
    } else {
      attributeElements.push(
        // <div key='no-fields' className='no-fields'>Ei täydennettäviä metatietoja</div>
        <div/>
      );
    }

    return attributeElements;
  }

  generateDropdown (elementTypes) {
    const type = `${capitalize(this.props.editorConfig.type)}Type`;

    return (
      <DropdownInput
        keyValue={type}
        type={'form'}
        selectClassName={'form-control col-xs-6'}
        inputClassName={'form-control edit-attribute__input'}
        valueState={this.state.newAttributes[type] ? this.state.newAttributes[type].value : ''}
        options={elementTypes}
        onChange={this.onChange}
        onInputChange={this.onFormInputChange}
        onSubmit={() => null}
      />
    );
  }

  filterAttributes (attributes) {
    const filteredAttributes = Object.assign({}, attributes);
    for (const key in filteredAttributes) {
      if (!filteredAttributes[key].value) {
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
    const { newAttributes } = this.state;

    this.props.elementConfig.createRecord(
      this.filterAttributes(newAttributes),
      targetId
    );
    this.props.displayMessage({
      title: 'Asiakirja',
      body: 'Asiakirjan lisäys onnistui!'
    });
  }

  editElement (e, targetId) {
    e.preventDefault();
    const { newAttributes } = this.state;
    this.props.elementConfig.editWithForm(
      this.filterAttributes(newAttributes),
      targetId
    );
  }

  resolveLabel () {
    const { type, action } = this.props.editorConfig;

    switch (type) {
      case 'function':
        return 'Metatiedot';
      case 'phase':
        if (action === 'add') {
          return 'Uusi käsittelyvaihe';
        }
        if (action === 'edit') {
          return 'Muokkaa käsittelyvaihetta';
        }
        if (action === 'complement') {
          return 'Täydennä käsittelyvaihetta';
        }
        break;
      case 'action':
        if (action === 'add') {
          return 'Uusi toimenpide';
        }
        if (action === 'edit') {
          return 'Muokkaa toimenpidettä';
        }
        if (action === 'complement') {
          return 'Täydennä toimenpidettä';
        }
        break;
      case 'record':
        if (action === 'add') {
          return 'Uusi asiakirja';
        }
        if (action === 'edit') {
          return 'Muokkaa asiakirjaa';
        }
        if (action === 'complement') {
          return 'Täydennä asiakirjaa';
        }
        break;
    }
  }

  resolveOnSubmit (e, targetId) {
    const { action, type } = this.props.editorConfig;
    switch (type) {
      case 'function':
        if (action === 'edit' || action === 'complement') {
          this.editMetaData(e);
        }
        break;
      case 'phase':
        if (action === 'edit' || action === 'complement') {
          this.editElement(e, targetId);
          this.props.displayMessage({
            title: 'Käsittelyvaihe',
            body: 'Käsittelyvaiheen muokkaus onnistui!'
          });
        }
        break;
      case 'action':
        if (action === 'edit' || action === 'complement') {
          this.editElement(e, targetId);
          this.props.displayMessage({
            title: 'Toimenpide',
            body: 'Toimenpiteen muokkaus onnistui!'
          });
        }
        break;
      case 'record':
        if (action === 'add') {
          this.addRecord(e, targetId);
        }
        if (action === 'edit' || action === 'complement') {
          this.editElement(e, targetId);
          this.props.displayMessage({
            title: 'Asiakirja',
            body: 'Asiakirjan muokkaus onnistui!'
          });
        }
    }
  }

  closeEditorForm (e) {
    e.preventDefault();
    this.props.closeEditorForm();
  }

  renderDescriptions () {
    const { attributeTypes } = this.props;
    const typeName = attributeTypes
      ? attributeTypes[`${capitalize(this.props.editorConfig.type)}Type`].name
      : '';
    const dropdownInput = this.generateDropdown(this.props.elementConfig.elementTypes);

    return (
      <div>
        <div className='col-xs-12 col-lg-6 form-group'>
          <label className='editor-form__label'>{typeName}</label>
          <span className='fa fa-asterisk required-asterisk'/>
          { dropdownInput }
        </div>
        <div className='col-xs-12 col-lg-6 form-group'>
          <label className='editor-form__label'>{attributeTypes ? attributeTypes.TypeSpecifier.name : ''}</label>
          <span className='fa fa-asterisk required-asterisk'/>
          <input
            className='col-xs-6 form-control edit-attribute__input'
            placeholder='Tarkenne'
            value={this.state.newAttributes.TypeSpecifier.value || ''}
            onChange={(e) => this.onChange(e.target.value, 'TypeSpecifier', 'value')}/>
          </div>
      </div>
    );
  }

  render () {
    const { attributeTypes, targetId } = this.props;
    const attributeElements = this.generateAttributeElements(attributeTypes);

    return (
      <div className='add-box col-xs-12'>
        <h4>{this.resolveLabel()}</h4>
        <form onSubmit={(e) => this.resolveOnSubmit(e, targetId)}
              className='editor-form'>
          { this.props.editorConfig.type !== 'function' ? this.renderDescriptions() : null }
          { attributeElements }
          <div className='col-xs-12'>
            <button
              className='btn btn-primary pull-right editor-form__submit'
              type='submit'>
              Valmis
            </button>
            <button
              className='btn btn-danger pull-right editor-form__cancel'
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
  elementConfig: React.PropTypes.shape({
    editWithForm: React.PropTypes.func,
    elementTypes: React.PropTypes.object.isRequired,
    createRecord: React.PropTypes.func // only records created with editorform
  }),
  targetId: React.PropTypes.string
};

export default EditorForm;
