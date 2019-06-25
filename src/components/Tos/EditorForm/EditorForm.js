import React from 'react';
import PropTypes from 'prop-types';
import './EditorForm.scss';
import update from 'immutability-helper';
import includes from 'lodash/includes';
import capitalize from 'lodash/capitalize';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';

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
    const initialAttributes = this.initializeAttributes(props.attributeTypes);
    this.state = {
      newAttributes: initialAttributes,
      initialAttributes
    };
  }

  initializeAttributes (attributeTypes) {
    const { attributes } = this.props;
    let initialState = {};
    for (const key in attributeTypes) {
      if (attributeTypes.hasOwnProperty(key)) {
        initialState = Object.assign({}, initialState, {
          [key]: {
            value: attributes[key] || null,
            checked: true
          }
        });
      }
    }
    return initialState;
  }

  createUpdate = (value, key, field) => ({
    newAttributes: {
      [key]: {
        [field]: {
          $set: value
        }
      }
    }
  });

  /**
   * Updates the value to the local state and redux state.
   * @param  {*} value
   * @param  {string} key
   * @param  {string} field
   * @return {void}
   */
  onBlur (value, key, field) {
    this.setState(
      state => update(state, this.createUpdate(value, key, field)),
      () =>
        this.resolveOnSubmit(
          null,
          this.props.targetId,
          false
        )
    );
  }

  /**
   * @param  {*} value
   * @param  {string} key
   * @param  {string} field
   * @return {void}
   */
  onChange = this.onBlur;

  onFormInputChange = this.onBlur;

  getActiveValue (key) {
    if (this.state.newAttributes[key].value) {
      return this.state.newAttributes[key].value;
    }
  }

  /**
   * @param  {string} key
   * @return {boolean}
   */
  getCheckedState (key) {
    if (
      this.props.editorConfig.action === 'edit' &&
      !get(this.state, `newAttributes[${key}].value`)
    ) {
      return false;
    } else {
      return this.state.newAttributes[key].checked;
    }
  }

  getAttributesToShow (attributeTypes, attributes) {
    const { newAttributes } = this.state;
    const attributesToShow = [];
    const getAttributeKeys = attributes => {
      const attributeKeys = [];
      for (const key in attributes) {
        attributeKeys.push(key);
      }
      return attributeKeys;
    };

    for (const attributeType in attributeTypes) {
      if (
        includes(
          attributeTypes[attributeType].allowedIn,
          this.props.editorConfig.type
        )
      ) {
        if (attributeTypes[attributeType].requiredIf.length) {
          if (
            validateConditionalRules(
              attributeType,
              attributeTypes,
              newAttributes
            ) ||
            newAttributes[attributeType].value
          ) {
            attributesToShow.push(attributeType);
            continue;
          }
        }
        if (
          attributeTypes[attributeType].required ||
          includes(getAttributeKeys(attributes), attributeType)
        ) {
          attributesToShow.push(attributeType);
          continue;
        }
        if (includes(attributeTypes[attributeType].defaultIn, this.props.editorConfig.type)) {
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
      if (
        includes(attributeTypes[key].allowedIn, this.props.editorConfig.type)
      ) {
        if (attributeTypes[key].requiredIf.length) {
          if (
            validateConditionalRules(key, attributeTypes, newAttributes) ||
            newAttributes[key].value
          ) {
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
    if (
      includes(
        attributesToShow,
        `${capitalize(this.props.editorConfig.type)}Type`
      )
    ) {
      attributesToShow.splice(
        attributesToShow.indexOf(
          `${capitalize(this.props.editorConfig.type)}Type`
        ),
        1
      );
    }
    if (includes(attributesToShow, 'TypeSpecifier')) {
      attributesToShow.splice(attributesToShow.indexOf('TypeSpecifier'), 1);
    }

    const sortedAttributes = sortBy(
      attributesToShow,
      attribute => this.props.attributeTypes[attribute].index
    );

    return sortedAttributes;
  }

  mapOptions (array) {
    return array.map(item => ({
      value: item.value,
      label: item.value
    }));
  }

  generateAttributeElements (attributeTypes) {
    let attributesToShow = this.getAttributesToShow(
      attributeTypes,
      this.props.attributes
    );
    if (this.props.editorConfig.action === 'complement') {
      attributesToShow = this.getComplementAttributes(attributeTypes);
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
                  onChange={e =>
                    this.onChange(
                      !this.state.newAttributes[key].checked,
                      key,
                      'checked'
                    )
                  }
                />
                <label className='editor-form__label'>
                  {attributeTypes[key].name}
                  {/* { attributeTypes[key].required &&
                  <span className='fa fa-asterisk required-asterisk'/>
                  } */}
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
                  multi={includes(
                    attributeTypes[key].multiIn,
                    this.props.editorConfig.type
                  )}
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
                  onChange={e =>
                    this.onChange(
                      !this.state.newAttributes[key].checked,
                      key,
                      'checked'
                    )
                  }
                />
                <label className='editor-form__label'>
                  {attributeTypes[key].name}
                  {/* { attributeTypes[key].required &&
                  <span className='fa fa-asterisk required-asterisk'/>
                  } */}
                </label>
                {key === 'AdditionalInformation' ? (
                  <textarea
                    className='form-control edit-record__input additional-information'
                    value={this.getActiveValue(key)}
                    placeholder={attributeTypes[key].name}
                    onChange={e => this.onChange(e.target.value, key, 'value')}
                    disabled={!this.state.newAttributes[key].checked}
                  />
                ) : (
                  <input
                    className='form-control edit-record__input'
                    value={this.getActiveValue(key)}
                    placeholder={attributeTypes[key].name}
                    onChange={e => this.onChange(e.target.value, key, 'value')}
                    disabled={!this.state.newAttributes[key].checked}
                  />
                )}
              </div>
            );
          }
        }
      }
    } else {
      attributeElements.push(
        // <div key='no-fields' className='no-fields'>Ei täydennettäviä metatietoja</div>
        <div key='no-fields' />
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
        formType={this.props.editorConfig.type}
        selectClassName={'form-control col-xs-6'}
        inputClassName={'form-control edit-attribute__input'}
        valueState={
          this.state.newAttributes[type]
            ? this.state.newAttributes[type].value
            : ''
        }
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

  /**
   * @param  {boolean} stopEditing
   * @return {void}
   */
  editMetaData (stopEditing) {
    const { newAttributes } = this.state;
    this.props.editMetaDataWithForm(
      this.filterAttributes(newAttributes),
      stopEditing
    );
  }

  addRecord (e, targetId) {
    const shouldCreateRecord = !!e && e.type === 'submit';
    if (!shouldCreateRecord) {
      return;
    }
    if (e) {
      e.preventDefault();
    }
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

  editElement (e, targetId, stopEditing = true) {
    const { newAttributes } = this.state;
    this.props.elementConfig.editWithForm(
      this.filterAttributes(newAttributes),
      targetId,
      stopEditing
    );
  }

  resolveLabel () {
    const { type, action } = this.props.editorConfig;

    switch (type) {
      case 'version':
        return 'Version tiedot';
      case 'function':
        return 'Käsittelyprosessin tiedot';
      case 'phase':
        if (action === 'add') {
          return 'Uusi käsittelyvaihe';
        }
        if (action === 'edit' || action === 'complement') {
          return 'Muokkaa käsittelyvaihetta';
        }
        // if (action === 'complement') {
        //   return 'Täydennä käsittelyvaihetta';
        // }
        break;
      case 'action':
        if (action === 'add') {
          return 'Uusi toimenpide';
        }
        if (action === 'edit' || action === 'complement') {
          return 'Muokkaa toimenpidettä';
        }
        // if (action === 'complement') {
        //   return 'Täydennä toimenpidettä';
        // }
        break;
      case 'record':
        if (action === 'add' && 'complement') {
          return 'Uusi asiakirja';
        }
        if (action === 'edit' && 'complement') {
          return 'Muokkaa asiakirjaa';
        }
        // if (action === 'complement') {
        //   return 'Täydennä asiakirjaa';
        // }
        break;
    }
  }

  resolveTypeDescription () {
    const { type } = this.props.editorConfig;

    switch (type) {
      case 'phase':
        return 'Käsittelyvaihe';
      // case 'action':
      //   return '';
      case 'record':
        return 'Asiakirjatyyppi';
    }
  }

  resolveSpecifierDescription () {
    const { type } = this.props.editorConfig;

    switch (type) {
      case 'phase':
        return 'Muu käsittelyvaihe';
      case 'action':
        return 'Toimenpide';
      case 'record':
        return 'Asiakirjatyypin tarkenne';
    }
  }

  resolveSpecifierPlaceholder () {
    const { type } = this.props.editorConfig;

    switch (type) {
      case 'phase':
        return 'Muu käsittelyvaihe';
      case 'action':
        return 'Toimenpide';
      case 'record':
        return 'Asiakirjatyypin tarkenne';
    }
  }

  /**
   * @param  {Event}  e
   * @param  {string}  targetId
   * @param  {boolean} [stopEditing=true]
   * @return {void}
   */
  resolveOnSubmit (e, targetId, stopEditing = true) {
    if (e) {
      e.preventDefault();
    }
    const { action, type, from } = this.props.editorConfig;

    const displayMessage = stopEditing ? this.props.displayMessage : () => {};
    if (targetId) {
      switch (type) {
        case 'version':
          if (action === 'edit') {
            this.editMetaData(stopEditing);
            displayMessage({
              title: 'Version tiedot',
              body: 'Tietojen muokkaus onnistui!'
            });
          }
          break;
        case 'function':
          if (action === 'edit' || action === 'complement') {
            this.editMetaData(stopEditing);
            displayMessage({
              title: 'Käsittelyprosessin tiedot',
              body: 'Tietojen muokkaus onnistui!'
            });
          }
          break;
        case 'phase':
          if (action === 'edit' || action === 'complement') {
            this.editElement(e, targetId, stopEditing);
            displayMessage({
              title: 'Käsittelyvaihe',
              body: 'Käsittelyvaiheen muokkaus onnistui!'
            });
          }
          break;
        case 'action':
          if (action === 'edit' || action === 'complement') {
            this.editElement(e, targetId, stopEditing);
            displayMessage({
              title: 'Toimenpide',
              body: 'Toimenpiteen muokkaus onnistui!'
            });
          }
          break;
        case 'record':
          if (action === 'add' || from === 'newRecord') {
            this.addRecord(e, targetId);
          }
          if (action === 'edit' || from === 'editRecord') {
            this.editElement(e, targetId, stopEditing);
            displayMessage({
              title: 'Asiakirja',
              body: 'Asiakirjan muokkaus onnistui!'
            });
          }
      }
    }
  }

  /**
   * Reset data the form has edited.
   * @param  {Event} e
   * @return {void}
   */
  closeEditorForm (e) {
    e.preventDefault();
    // Reset local state
    this.setState(
      ({ initialAttributes }) => ({ newAttributes: initialAttributes }),
      () => {
        const { targetId, closeEditorForm } = this.props;
        this.resolveOnSubmit(null, targetId, false);
        closeEditorForm();
      }
    );
  }

  renderDescriptions () {
    // const { attributeTypes } = this.props;
    // const typeName = attributeTypes ? attributeTypes[`${capitalize(this.props.editorConfig.type)}Type`].name : '';
    // const specifierName = attributeTypes ? attributeTypes.TypeSpecifier.name : '';
    const dropdownInput = this.generateDropdown(
      this.props.elementConfig.elementTypes
    );

    return (
      <div className='descriptions'>
        {this.props.editorConfig.type !== 'action' && (
          <div className='col-xs-12 col-lg-6 form-group'>
            <label className='editor-form__label'>
              {this.resolveTypeDescription()}
            </label>
            {/* <span className='fa fa-asterisk required-asterisk'/> */}
            {dropdownInput}
          </div>
        )}
        <div className='col-xs-12 col-lg-6 form-group'>
          <label className='editor-form__label'>
            {this.resolveSpecifierDescription()}
          </label>
          {/* <span className='fa fa-asterisk required-asterisk'/> */}
          <input
            className='col-xs-6 form-control edit-record__input'
            placeholder={this.resolveSpecifierPlaceholder()}
            value={this.state.newAttributes.TypeSpecifier.value || ''}
            onChange={e => this.onChange(e.target.value, 'TypeSpecifier', 'value')}
          />
        </div>
      </div>
    );
  }

  render () {
    const { attributeTypes, editorConfig, targetId, onShowMore, onShowMoreForm } = this.props;
    const attributeElements = this.generateAttributeElements(attributeTypes);

    let showMoreLabel;
    if (this.props.editorConfig.action === 'edit') {
      showMoreLabel = 'Näytä lisää';
    } else if (this.props.editorConfig.action === 'complement') {
      showMoreLabel = 'Näytä vähemmän';
    } else if (this.props.editorConfig.action === 'add') {
      showMoreLabel = 'Näytä lisää';
    }

    return (
      <div className='add-box col-xs-12'>
        <h4>{this.resolveLabel()}</h4>
        <form
          onSubmit={e => this.resolveOnSubmit(e, targetId)}
          className='editor-form'
        >
          {!includes(['function', 'version'], this.props.editorConfig.type)
            ? this.renderDescriptions()
            : null}
          {this.props.additionalFields || null}
          {attributeElements}
          <div className='col-xs-12'>
            <button
              className='btn btn-success pull-right editor-form__submit'
              type='submit'
            >
              OK
            </button>
            <button
              className='btn btn-danger pull-right editor-form__cancel'
              onClick={e => this.closeEditorForm(e)}
            >
              Peruuta
            </button>
            {editorConfig.type !== 'version' && (
              <button
                className={showMoreLabel ? 'btn btn-primary pull-right editor-form__cancel' : 'non-display'}
                onClick={(e) => (this.props.editorConfig.action === 'add' || (this.props.editorConfig.action === 'complement' && this.props.complementRecordAdd)) ? onShowMoreForm(e, this.state.newAttributes) : onShowMore(e, this.state)}
              >
                {showMoreLabel}
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }
}

EditorForm.propTypes = {
  additionalFields: PropTypes.array,
  attributeTypes: PropTypes.object.isRequired,
  attributes: PropTypes.object.isRequired,
  closeEditorForm: PropTypes.func.isRequired,
  complementRecordAdd: PropTypes.func,
  displayMessage: PropTypes.func.isRequired,
  editMetaDataWithForm: PropTypes.func,
  editorConfig: PropTypes.shape({
    type: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
    from: PropTypes.string
  }),
  elementConfig: PropTypes.shape({
    editWithForm: PropTypes.func,
    elementTypes: PropTypes.object.isRequired,
    createRecord: PropTypes.func // only records created with editorform
  }),
  onShowMore: PropTypes.func,
  onShowMoreForm: PropTypes.func,
  targetId: PropTypes.string
};

export default EditorForm;
