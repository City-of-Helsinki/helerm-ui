/* eslint-disable consistent-return */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import includes from 'lodash/includes';
import capitalize from 'lodash/capitalize';
import sortBy from 'lodash/sortBy';

import DropdownInput from '../DropdownInput/DropdownInput';
import { validateConditionalRules } from '../../../utils/validators';
import { getDisplayLabelForAttribute } from '../../../utils/attributeHelper';
import './EditorForm.scss';

const EditorForm = (props) => {
  const {
    attributeTypes,
    attributes,
    editorConfig,
    elementConfig,
    closeEditorForm: propCloseEditorForm,
    targetId,
    displayMessage,
    editMetaDataWithForm,
    onShowMore,
    onShowMoreForm,
    additionalFields,
    complementRecordAdd,
  } = props;

  const initializeAttributes = useCallback(
    (attrTypes) => {
      let initialState = {};
      Object.keys(attrTypes).forEach((key) => {
        if (Object.hasOwn(attrTypes, key)) {
          initialState = {
            ...initialState,
            [key]: {
              value: attributes[key] || null,
              checked: true,
            },
          };
        }
      });
      return initialState;
    },
    [attributes],
  );

  const initialAttributes = initializeAttributes(attributeTypes);
  const [newAttributes, setNewAttributes] = useState(initialAttributes);
  const [initialAttrState] = useState(initialAttributes);

  const filterAttributes = useCallback((attrs) => {
    const filteredAttributes = { ...attrs };
    Object.keys(filteredAttributes).forEach((key) => {
      if (Object.hasOwn(filteredAttributes, key) && !filteredAttributes[key].checked) {
        delete filteredAttributes[key];
      }
    });
    return filteredAttributes;
  }, []);

  const editMetaData = useCallback(
    (stopEditing) => {
      editMetaDataWithForm(filterAttributes(newAttributes), stopEditing);
    },
    [editMetaDataWithForm, filterAttributes, newAttributes],
  );

  const handleVersionAction = useCallback(
    (action, stopEditing, messageHandler) => {
      if (action === 'edit') {
        editMetaData(stopEditing);
        messageHandler({
          title: 'Version tiedot',
          body: 'Tietojen muokkaus onnistui!',
        });
      }
    },
    [editMetaData],
  );

  const handleFunctionAction = useCallback(
    (action, stopEditing, messageHandler) => {
      if (action === 'edit' || action === 'complement') {
        editMetaData(stopEditing);
        messageHandler({
          title: 'Käsittelyprosessin tiedot',
          body: 'Tietojen muokkaus onnistui!',
        });
      }
    },
    [editMetaData],
  );

  const editElement = useCallback(
    (e, targetId, stopEditing = true) => {
      if (!elementConfig) {
        return;
      }
      elementConfig.editWithForm(filterAttributes(newAttributes), targetId, stopEditing);
    },
    [elementConfig, filterAttributes, newAttributes],
  );

  const handlePhaseAction = useCallback(
    (action, e, targetId, stopEditing, messageHandler) => {
      if (action === 'edit' || action === 'complement') {
        editElement(e, targetId, stopEditing);
        messageHandler({
          title: 'Käsittelyvaihe',
          body: 'Käsittelyvaiheen muokkaus onnistui!',
        });
      }
    },
    [editElement],
  );

  const handleActionAction = useCallback(
    (action, e, targetId, stopEditing, messageHandler) => {
      if (action === 'edit' || action === 'complement') {
        editElement(e, targetId, stopEditing);
        messageHandler({
          title: 'Toimenpide',
          body: 'Toimenpiteen muokkaus onnistui!',
        });
      }
    },
    [editElement],
  );

  const addRecord = useCallback(
    (e, targetId) => {
      const shouldCreateRecord = !!e && e.type === 'submit';
      if (!shouldCreateRecord) {
        return;
      }
      if (e) {
        e.preventDefault();
      }

      if (!elementConfig) {
        return;
      }

      elementConfig.createRecord(filterAttributes(newAttributes), targetId);
      displayMessage({
        title: 'Asiakirja',
        body: 'Asiakirjan lisäys onnistui!',
      });
    },
    [elementConfig, filterAttributes, newAttributes, displayMessage],
  );

  const handleRecordAction = useCallback(
    (action, e, targetId, stopEditing, messageHandler, from) => {
      if (action === 'add' || from === 'newRecord') {
        addRecord(e, targetId);
      }
      if (action === 'edit' || from === 'editRecord') {
        editElement(e, targetId, stopEditing);
        messageHandler({
          title: 'Asiakirja',
          body: 'Asiakirjan muokkaus onnistui!',
        });
      }
    },
    [addRecord, editElement],
  );

  const resolveOnSubmit = useCallback(
    (e, targetId, stopEditing = true) => {
      if (e) {
        e.preventDefault();
      }

      if (!targetId) return;

      const { action, type, from } = editorConfig;
      const messageHandler = stopEditing ? displayMessage : () => {};

      switch (type) {
        case 'version':
          handleVersionAction(action, stopEditing, messageHandler);
          break;
        case 'function':
          handleFunctionAction(action, stopEditing, messageHandler);
          break;
        case 'phase':
          handlePhaseAction(action, e, targetId, stopEditing, messageHandler);
          break;
        case 'action':
          handleActionAction(action, e, targetId, stopEditing, messageHandler);
          break;
        case 'record':
          handleRecordAction(action, e, targetId, stopEditing, messageHandler, from);
          break;
        default:
          break;
      }
    },
    [
      editorConfig,
      displayMessage,
      handleVersionAction,
      handleFunctionAction,
      handlePhaseAction,
      handleActionAction,
      handleRecordAction,
    ],
  );

  const onBlur = useCallback(
    (value, key, field) => {
      if (key && field) {
        setNewAttributes((prevState) => {
          const newState = { ...prevState };
          if (field === 'checked' && !value) {
            newState[key] = {
              ...newState[key],
              [field]: value,
              value: null,
            };
          } else {
            newState[key] = {
              ...newState[key],
              [field]: value,
            };
          }
          return newState;
        });

        resolveOnSubmit(null, targetId, false);
      }
    },
    [targetId, resolveOnSubmit],
  );

  const onChange = useCallback(
    (value, key, field) => {
      onBlur(value, key, field);
    },
    [onBlur],
  );

  const onFormInputChange = useCallback(() => {
    onBlur();
  }, [onBlur]);

  const getActiveValue = useCallback(
    (key) => {
      if (newAttributes[key]?.value) {
        return newAttributes[key].value;
      }
      return undefined;
    },
    [newAttributes],
  );

  const getCheckedState = useCallback(
    (key) => {
      if (editorConfig.action === 'edit' && !newAttributes[key]?.value) {
        return false;
      }
      return newAttributes[key]?.checked;
    },
    [editorConfig.action, newAttributes],
  );

  const prepareAttributes = useCallback(
    (attributesToShow) => {
      const attrToShow = [...attributesToShow];

      if (includes(attrToShow, `${capitalize(editorConfig.type)}Type`)) {
        attrToShow.splice(attrToShow.indexOf(`${capitalize(editorConfig.type)}Type`), 1);
      }
      if (includes(attrToShow, 'TypeSpecifier')) {
        attrToShow.splice(attrToShow.indexOf('TypeSpecifier'), 1);
      }

      return sortBy(attrToShow, (attribute) => attributeTypes[attribute].index);
    },
    [attributeTypes, editorConfig.type],
  );

  const getAttributesToShow = useCallback(
    (attrTypes, attrs) => {
      const getAttributeKeys = (attr) => Object.keys(attr);

      const attributesToShow = Object.keys(attrTypes)
        .filter((key) => Object.hasOwn(attrTypes, key) && includes(attrTypes[key].allowedIn, editorConfig.type))
        .filter((key) => {
          if (
            (attrTypes[key].requiredIf.length && validateConditionalRules(key, attrTypes, newAttributes)) ||
            newAttributes[key]?.value
          ) {
            return true;
          }

          if (attrTypes[key].required || includes(getAttributeKeys(attrs), key)) {
            return true;
          }

          return !!includes(attrTypes[key].defaultIn, editorConfig.type);
        });

      return prepareAttributes(attributesToShow);
    },
    [prepareAttributes, editorConfig.type, newAttributes],
  );

  const getComplementAttributes = useCallback(
    (attrTypes) => {
      const complementAttributes = [];
      Object.keys(attrTypes).forEach((key) => {
        if (Object.hasOwn(attrTypes, key) && includes(attrTypes[key].allowedIn, editorConfig.type)) {
          if (attrTypes[key].requiredIf.length) {
            if (validateConditionalRules(key, attrTypes, newAttributes) || newAttributes[key]?.value) {
              complementAttributes.push(key);
            }
          } else {
            complementAttributes.push(key);
          }
        }
      });

      return prepareAttributes(complementAttributes);
    },
    [newAttributes, editorConfig.type, prepareAttributes],
  );

  const mapOptions = (array) => {
    return array.map((item) => ({
      value: item.value,
      label: getDisplayLabelForAttribute({
        attributeValue: item.value,
        id: item.id,
      }),
    }));
  };

  const generateAttributeElements = useCallback(
    (attrTypes) => {
      const attributesToShow =
        editorConfig.action === 'complement'
          ? getComplementAttributes(attrTypes)
          : getAttributesToShow(attrTypes, attributes);

      if (!attributesToShow.length) {
        return [<div key='no-fields' />];
      }

      return attributesToShow
        .filter((key) => Object.hasOwn(attrTypes, key))
        .map((key) => {
          if (attrTypes[key].values.length) {
            const options = mapOptions(attrTypes[key].values);

            return (
              <div key={key} className='col-xs-12 col-lg-6 form-group'>
                <input
                  type='checkbox'
                  checked={getCheckedState(key)}
                  value={newAttributes[key]?.checked}
                  onChange={() => onChange(!newAttributes[key]?.checked, key, 'checked')}
                />
                <label className='editor-form__label'>{attrTypes[key].name}</label>
                <DropdownInput
                  keyValue={key}
                  type='form'
                  selectClassName='Select form-control editor-form__select'
                  inputClassName='form-control edit-attribute__input'
                  disabled={!newAttributes[key]?.checked}
                  valueState={getActiveValue(key)}
                  options={options}
                  onChange={onChange}
                  onInputChange={onFormInputChange}
                  onSubmit={() => null}
                  multi={includes(attrTypes[key].multiIn, editorConfig.type)}
                />
              </div>
            );
          }

          return (
            <div key={key} className='col-xs-12 col-lg-6 form-group'>
              <input
                type='checkbox'
                checked={getCheckedState(key)}
                value={newAttributes[key]?.checked}
                onChange={() => onChange(!newAttributes[key]?.checked, key, 'checked')}
              />
              <label className='editor-form__label'>{attrTypes[key].name}</label>
              {key === 'AdditionalInformation' ? (
                <textarea
                  className='form-control edit-record__input additional-information'
                  value={getActiveValue(key)}
                  placeholder={attrTypes[key].name}
                  onChange={(e) => onChange(e.target.value, key, 'value')}
                  disabled={!newAttributes[key]?.checked}
                />
              ) : (
                <input
                  className='form-control edit-record__input'
                  value={getActiveValue(key)}
                  placeholder={attrTypes[key].name}
                  onChange={(e) => onChange(e.target.value, key, 'value')}
                  disabled={!newAttributes[key]?.checked}
                />
              )}
            </div>
          );
        })
        .filter(Boolean);
    },
    [
      editorConfig.action,
      editorConfig.type,
      getComplementAttributes,
      getAttributesToShow,
      attributes,
      onChange,
      onFormInputChange,
      getActiveValue,
      getCheckedState,
      newAttributes,
    ],
  );

  const generateDropdown = useCallback(
    (elementTypes) => {
      if (!elementTypes) {
        return null;
      }

      const type = `${capitalize(editorConfig.type)}Type`;
      const elementTypesAsOptions = mapOptions(Object.values(elementTypes));
      return (
        <DropdownInput
          keyValue={type}
          type='form'
          formType={editorConfig.type}
          selectClassName='Select form-control editor-form__select'
          inputClassName='form-control edit-attribute__input'
          valueState={newAttributes[type] ? newAttributes[type].value : ''}
          options={elementTypesAsOptions}
          onChange={onChange}
          onInputChange={onFormInputChange}
          onSubmit={() => null}
        />
      );
    },
    [editorConfig.type, newAttributes, onChange, onFormInputChange],
  );

  const resolveLabel = useCallback(() => {
    const { type, action } = editorConfig;

    switch (type) {
      case 'version': {
        return 'Version tiedot';
      }
      case 'function': {
        return 'Käsittelyprosessin tiedot';
      }
      case 'phase': {
        if (action === 'add') {
          return 'Uusi käsittelyvaihe';
        }
        if (action === 'edit' || action === 'complement') {
          return 'Muokkaa käsittelyvaihetta';
        }
        break;
      }
      case 'action': {
        if (action === 'add') {
          return 'Uusi toimenpide';
        }
        if (action === 'edit' || action === 'complement') {
          return 'Muokkaa toimenpidettä';
        }
        break;
      }
      case 'record': {
        if (action === 'add' || action === 'complement') {
          return 'Uusi asiakirja';
        }
        if (action === 'edit') {
          return 'Muokkaa asiakirjaa';
        }
        break;
      }
      default: {
        return '';
      }
    }
  }, [editorConfig]);

  const resolveTypeDescription = useCallback(() => {
    const { type } = editorConfig;

    switch (type) {
      case 'phase':
        return 'Käsittelyvaihe';
      case 'record':
        return 'Asiakirjatyyppi';
      default:
        return '';
    }
  }, [editorConfig]);

  const resolveSpecifier = useCallback(() => {
    const { type } = editorConfig;

    switch (type) {
      case 'phase':
        return 'Muu käsittelyvaihe';
      case 'action':
        return 'Toimenpide';
      case 'record':
        return 'Asiakirjatyypin tarkenne';
      default:
        return '';
    }
  }, [editorConfig]);

  const closeEditorForm = useCallback(
    (e) => {
      e.preventDefault();

      setNewAttributes(initialAttrState);
      propCloseEditorForm();
    },
    [initialAttrState, propCloseEditorForm],
  );

  const renderDescriptions = useCallback(() => {
    const dropdownInput = generateDropdown(elementConfig?.elementTypes);

    return (
      <div className='descriptions'>
        {editorConfig.type !== 'action' && (
          <div className='col-xs-12 col-lg-6 form-group'>
            <label className='editor-form__label'>{resolveTypeDescription()}</label>
            {dropdownInput}
          </div>
        )}
        <div className='col-xs-12 col-lg-6 form-group'>
          <label className='editor-form__label'>{resolveSpecifier()}</label>
          <input
            data-testid='editor-form-type-specifier'
            className='col-xs-6 form-control edit-record__input'
            placeholder={resolveSpecifier()}
            value={newAttributes.TypeSpecifier?.value || ''}
            onChange={(e) => onChange(e.target.value, 'TypeSpecifier', 'value')}
          />
        </div>
      </div>
    );
  }, [
    editorConfig.type,
    generateDropdown,
    elementConfig?.elementTypes,
    resolveTypeDescription,
    resolveSpecifier,
    newAttributes.TypeSpecifier,
    onChange,
  ]);

  let showMoreLabel;

  if (editorConfig.action === 'edit') {
    showMoreLabel = 'Näytä lisää';
  } else if (editorConfig.action === 'complement') {
    showMoreLabel = 'Näytä vähemmän';
  } else if (editorConfig.action === 'add') {
    showMoreLabel = 'Näytä lisää';
  }

  const attributeElements = generateAttributeElements(attributeTypes);

  const testId = `editor-form-${editorConfig.type}-${editorConfig.action}`;

  return (
    <div data-testid={testId} className='add-box col-xs-12'>
      <h4>{resolveLabel()}</h4>
      <form onSubmit={(e) => resolveOnSubmit(e, targetId)} className='editor-form'>
        {!includes(['function', 'version'], editorConfig.type) ? renderDescriptions() : null}
        {additionalFields || null}
        {attributeElements}
        <div className='col-xs-12'>
          <button
            data-testid='editor-form-submit'
            className='btn btn-success pull-right editor-form__submit'
            type='submit'
          >
            OK
          </button>
          <button
            data-testid='editor-form-cancel'
            type='button'
            className='btn btn-danger pull-right editor-form__cancel'
            onClick={(e) => closeEditorForm(e)}
          >
            Peruuta
          </button>
          {editorConfig.type !== 'version' && (
            <button
              data-testid='editor-form-show-more'
              type='button'
              className={showMoreLabel ? 'btn btn-primary pull-right editor-form__cancel' : 'non-display'}
              onClick={(e) =>
                editorConfig.action === 'add' || (editorConfig.action === 'complement' && complementRecordAdd)
                  ? onShowMoreForm(e, newAttributes)
                  : onShowMore(e, { newAttributes, initialAttributes: initialAttrState })
              }
            >
              {showMoreLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

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
    from: PropTypes.string,
  }),
  elementConfig: PropTypes.shape({
    editWithForm: PropTypes.func,
    elementTypes: PropTypes.object,
    createRecord: PropTypes.func, // only records created with editorform
  }),
  onShowMore: PropTypes.func,
  onShowMoreForm: PropTypes.func,
  targetId: PropTypes.string,
};

export default EditorForm;
