/* eslint-disable consistent-return */
import React from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';
import { find, forEach, includes, isEmpty, map } from 'lodash';

import KeyStrokeSupport from '../../../decorators/key-stroke-support';
import './AddElementInput.scss';
import { resolveSelectValues } from '../../../utils/helpers';
import { getDisplayLabelForAttribute } from '../../../utils/attributeHelper';

function onPromptCreate(label) {
  return `Lisää "${label}"`;
}

function resolveHeader(type) {
  if (type === 'phase') {
    return 'Uusi käsittelyvaihe';
  }
  if (type === 'action') {
    return 'Uusi toimenpide';
  }
}

function resolveTypePlaceHolder(type) {
  if (type === 'phase') {
    return 'Käsittelyvaiheen tyyppi';
  }
  if (type === 'action') {
    return 'Toimenpiteen tyyppi';
  }
}

function resolveSpecifierPlaceHolder(type) {
  if (type === 'phase') {
    return 'Muu käsittelyvaihe';
  }
  if (type === 'action') {
    return 'Toimenpide';
  }
}

function resolveSelectPlaceHolder(type) {
  if (type === 'phase') {
    return 'Valitse käsittelyvaihe...';
  }
  if (type === 'action') {
    return 'Valitse toimenpide...';
  }
}

function resolvePlaceHolder(fieldName) {
  return `Valitse ${fieldName.toLowerCase()}...`;
}

function resolveSelectOptions(values, fieldValue) {
  const options = [];
  Object.keys(values).forEach((key) => {
    options.push({
      label: getDisplayLabelForAttribute({
        attributeValue: values[key].value,
        id: values[key].id,
      }),
      value: values[key].value,
    });
  });
  if (fieldValue) {
    const valueArray = fieldValue instanceof Array ? fieldValue : [fieldValue];
    forEach(valueArray, (value) => {
      if (!find(options, (option) => option.value === value)) {
        options.push({
          label: value,
          value,
        });
      }
    });
  }
  return options;
}

function resolveSelectedOption(option) {
  if (option instanceof Array) {
    return option.length ? map(option, 'value') : null;
  }
  return option?.value ? option?.value : option;
}

function renderInput(defaultAttributes, newDefaultAttributes, key, onDefaultAttributeChange, type, submit) {
  if (defaultAttributes[key].values.length !== 0) {
    return (
      <CreatableSelect
        key={key}
        openMenuOnFocus
        isClearable
        className={`form-control edit-${type}-type__input`}
        value={resolveSelectValues(
          resolveSelectOptions(defaultAttributes[key].values, newDefaultAttributes[key]),
          newDefaultAttributes[key],
          includes(defaultAttributes[key].multiIn, type),
        )}
        onChange={(option) => onDefaultAttributeChange(key, resolveSelectedOption(option))}
        isMulti={includes(defaultAttributes[key].multiIn, type)}
        options={resolveSelectOptions(defaultAttributes[key].values, newDefaultAttributes[key])}
        placeholder={resolvePlaceHolder(defaultAttributes[key].name)}
        formatCreateLabel={onPromptCreate}
        delimiter=';'
      />
    );
  }
  return (
    <input
      type='text'
      className='form-control'
      key={key}
      value={newDefaultAttributes[key] || ''}
      onChange={(e) => onDefaultAttributeChange(key, e.target.value)}
      onSubmit={submit}
      placeholder={defaultAttributes[key].name}
    />
  );
}

const AddElementInput = ({
  type,
  submit,
  defaultAttributes,
  typeOptions,
  newDefaultAttributes,
  newTypeSpecifier,
  newType,
  onDefaultAttributeChange,
  onTypeSpecifierChange,
  onTypeInputChange,
  onTypeChange,
  cancel,
  onAddFormShowMore,
  showMoreOrLess,
}) => (
  <form onSubmit={submit} className='row add-element'>
    <h5 className='col-xs-12'>{resolveHeader(type)}</h5>
    {/* ActionType disabled for now. */}
    {type !== 'action' && (
      <div className='col-xs-12 col-md-6 add-element-col'>
        {typeOptions.length !== 0 ? (
          <CreatableSelect
            openMenuOnFocus
            className={`form-control edit-${type}-type__input`}
            isClearable
            value={resolveSelectOptions(typeOptions, newType).find(({ value }) => value === newType)}
            onChange={(option) => onTypeChange(option ? option.value : null)}
            autoFocus={false}
            options={resolveSelectOptions(typeOptions, newType)}
            placeholder={resolveSelectPlaceHolder(type)}
            formatCreateLabel={onPromptCreate}
          />
        ) : (
          <input
            type='text'
            className='form-control'
            value={newType}
            onChange={onTypeInputChange}
            onSubmit={submit}
            placeholder={resolveTypePlaceHolder(type)}
          />
        )}
      </div>
    )}
    <div className='col-xs-12 col-md-6 add-element-col'>
      <input
        type='text'
        className='form-control'
        value={newTypeSpecifier}
        onChange={onTypeSpecifierChange}
        onSubmit={submit}
        placeholder={resolveSpecifierPlaceHolder(type)}
      />
    </div>
    {!isEmpty(defaultAttributes) &&
      Object.keys(defaultAttributes).map((key) => (
        <div className='col-xs-12 col-md-6' key={`${type}_${key}`}>
          {renderInput(defaultAttributes, newDefaultAttributes, key, onDefaultAttributeChange, type, submit)}
        </div>
      ))}
    <div className='add-element-buttons'>
      <button type='button' className='btn btn-success' onClick={onAddFormShowMore}>
        {showMoreOrLess ? 'Näytä vähemmän' : 'Näytä lisää'}
      </button>
      <button type='button' className='btn btn-danger' onClick={cancel}>
        Peruuta
      </button>
      <button className='btn btn-primary' type='submit'>
        OK
      </button>
    </div>
  </form>
);

AddElementInput.propTypes = {
  cancel: PropTypes.func.isRequired,
  defaultAttributes: PropTypes.object.isRequired,
  newDefaultAttributes: PropTypes.object.isRequired,
  newType: PropTypes.string.isRequired,
  newTypeSpecifier: PropTypes.string.isRequired,
  onAddFormShowMore: PropTypes.func.isRequired,
  onDefaultAttributeChange: PropTypes.func.isRequired,
  onTypeChange: PropTypes.func.isRequired,
  onTypeInputChange: PropTypes.func.isRequired,
  onTypeSpecifierChange: PropTypes.func.isRequired,
  showMoreOrLess: PropTypes.bool,
  submit: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  typeOptions: PropTypes.array.isRequired,
};

export default KeyStrokeSupport(AddElementInput);
