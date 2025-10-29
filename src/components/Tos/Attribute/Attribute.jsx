/* eslint-disable jsx-a11y/no-static-element-interactions */
import classnames from 'classnames';
import { find, forEach, includes, map } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';

import { getDisplayLabelForAttribute } from '../../../utils/attributeHelper';
import { resolveReturnValues, resolveSelectValues } from '../../../utils/helpers';
import './Attribute.scss';

const Attribute = ({
  attribute: initialAttribute,
  attributeIndex,
  attributeKey,
  attributeTypes,
  documentState,
  editable,
  elementId,
  parentType,
  showAttributes,
  tosAttribute,
  type,
  typeOptions,
  updateAttribute,
  updateFunctionAttribute,
  updateType,
  updateTypeSpecifier,
}) => {
  const [attribute, setAttribute] = useState(initialAttribute);
  const [mode, setMode] = useState('view');

  useEffect(() => {
    setAttribute(initialAttribute);
  }, [initialAttribute]);

  const onPromptCreate = (label) => {
    return `Lisää "${label}"`;
  };

  const onChange = (option) => {
    if (option instanceof Array) {
      const values = option.length ? map(option, 'value') : null;

      setAttribute(values && values.length === 1 ? values[0] : values);
    } else {
      setAttribute(option?.value ? option?.value : option);
    }
  };

  const changeState = (newState) => {
    if (documentState === 'edit') {
      setMode(newState);
    }
  };

  const activateEditMode = () => {
    if (mode !== 'edit') {
      changeState('edit');
    }
  };

  const submit = (event) => {
    if (event) {
      event.preventDefault();
    }

    if (attributeIndex === '') {
      updateTypeSpecifier(attribute, elementId);
    } else if (attributeIndex === initialAttribute) {
      updateType(attribute, elementId);
    } else if (tosAttribute) {
      updateFunctionAttribute(attribute, attributeIndex);
    } else {
      updateAttribute(attribute, attributeIndex, elementId);
    }

    setTimeout(() => changeState('view'), 150);
  };

  const resolveBaseAttributePlaceholder = () => {
    switch (parentType) {
      case 'phase':
        return 'Valitse käsittelyvaihe...';
      case 'record':
        return 'Valitse asiakirjatyyppi...';
      default:
        return null;
    }
  };

  const resolvePlaceHolder = (fieldName) => {
    return `Valitse ${fieldName.toLowerCase()}...`;
  };

  const generateAttributeInput = (attributeConfig, currentAttribute) => {
    if (attributeConfig?.values.length) {
      const options = attributeConfig?.values.map((option) => ({
        value: option.value,
        label: getDisplayLabelForAttribute({
          attributeValue: option.value,
          id: option.id,
        }),
      }));

      if (currentAttribute) {
        const valueArray = currentAttribute instanceof Array ? currentAttribute : [currentAttribute];

        forEach(valueArray, (value) => {
          if (!find(options, (option) => option.value === value)) {
            options.push({
              label: value,
              value,
            });
          }
        });
      }

      const multi = includes(attributeConfig.multiIn, parentType);

      return (
        <CreatableSelect
          openMenuOnFocus
          className='form-control edit-attribute__input'
          isClearable
          value={resolveSelectValues(options, attribute, multi)}
          onChange={(emittedValue) => onChange(resolveReturnValues(emittedValue, multi))}
          onBlur={submit}
          autoFocus
          options={options}
          isMulti={multi}
          placeholder={resolvePlaceHolder(attributeConfig.name)}
          formatCreateLabel={onPromptCreate}
          delimiter=';'
        />
      );
    }

    if (attributeConfig.values.length === 0 || attributeConfig.type) {
      return (
        <form onSubmit={submit}>
          <input
            className='col-xs-6 form-control edit-attribute__input'
            value={attribute}
            onChange={({ target: { value } }) => onChange(value)}
            onBlur={submit}
            autoFocus
          />
        </form>
      );
    }

    return null;
  };

  const generateBasicAttributeInput = (typeValue) => {
    if (typeValue === '') {
      return (
        <form onSubmit={submit}>
          <input
            className='col-xs-6 form-control edit-attribute__input'
            value={attribute || ''}
            onChange={({ target: { value } }) => onChange(value)}
            onBlur={submit}
            autoFocus
          />
        </form>
      );
    }
    return generateBasicAttributeDropdown(typeOptions);
  };

  const generateBasicAttributeDropdown = (options) => {
    const selectOptions = [];

    Object.keys(options).forEach((key) => {
      if (Object.hasOwn(options, key)) {
        selectOptions.push({
          label: options[key].value,
          value: options[key].value,
        });
      }
    });

    if (attribute) {
      const valueArray = attribute instanceof Array ? attribute : [attribute];

      forEach(valueArray, (value) => {
        if (!find(selectOptions, (option) => option.value === value)) {
          selectOptions.push({
            label: value,
            value,
          });
        }
      });
    }

    return (
      <form onSubmit={submit}>
        <CreatableSelect
          openMenuOnFocus
          isClearable
          autoFocus
          className='col-xs-6 form-control edit-attribute__input'
          value={resolveSelectValues(selectOptions, attribute)}
          onChange={(option) => onChange(option ? option.value : null)}
          onBlur={submit}
          options={selectOptions}
          placeholder={resolveBaseAttributePlaceholder() || 'Valitse...'}
          formatCreateLabel={onPromptCreate}
          delimiter=';'
        />
      </form>
    );
  };

  const getAttributeValue = (attributeValue, attrIndex, attrTypes, typeValue) => {
    if (mode === 'view') {
      const resolveDisplayName = (attr) => {
        if (!attr) return '';

        const safeAttr = getSafeDisplayValue(attr);

        return getDisplayLabelForAttribute({
          attributeValue: safeAttr,
          identifier: attrIndex,
        });
      };

      return (
        <div className='table-value'>
          {attribute instanceof Array
            ? attribute.map((attr) => resolveDisplayName(attr)).join(', ')
            : resolveDisplayName(attribute)}
        </div>
      );
    }

    if (mode === 'edit') {
      if (typeValue === 'attribute') {
        return generateAttributeInput(attrTypes[attrIndex], attribute);
      }
      if (typeValue === 'basic') {
        return generateBasicAttributeInput(attrIndex);
      }
    }

    return null;
  };

  if (initialAttribute === null || (initialAttribute !== null && !(type === 'basic' || type === 'attribute'))) {
    return null;
  }

  const getSafeDisplayValue = (attr) => {
    if (attr === null || attr === undefined) return '';

    if (typeof attr === 'object') {
      if ('value' in attr) {
        return attr.value || '';
      }

      return String(attr) || '';
    }

    return attr;
  };

  if (editable === false && initialAttribute !== null) {
    const displayValue = getSafeDisplayValue(initialAttribute);

    return (
      <span className='list-group-item col-xs-6 attribute-basic'>
        <strong>{attributeIndex}:</strong>
        <div>{displayValue || '\u00A0'}</div>
      </span>
    );
  }

  let attributeValue;

  attributeValue = getAttributeValue(initialAttribute, attributeIndex, attributeTypes, type);

  if (attributeValue && typeof attributeValue === 'object' && !React.isValidElement(attributeValue)) {
    attributeValue = <div className='table-value'>—</div>;
  }

  const testId = `attribute-${type}-${attributeIndex || 'unnamed'}`;

  return (
    <span
      data-testid={testId}
      onClick={() => activateEditMode()}
      onKeyUp={(e) => {
        if (e.key === 'Enter') {
          activateEditMode();
        }
      }}
      className={classnames([
        'list-group-item col-xs-6 attribute',
        showAttributes ? 'visible' : 'hidden',
        type === 'basic' ? 'attribute-basic' : '',
      ])}
    >
      <span className='table-key' data-testid={`${testId}-key`}>
        {attributeKey}
      </span>
      <span data-testid={`${testId}-value`}>{attributeValue}</span>
    </span>
  );
};

Attribute.propTypes = {
  attribute: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  attributeIndex: PropTypes.string,
  attributeKey: PropTypes.string.isRequired,
  attributeTypes: PropTypes.object,
  documentState: PropTypes.string.isRequired,
  editable: PropTypes.bool.isRequired,
  elementId: PropTypes.string,
  parentType: PropTypes.string,
  showAttributes: PropTypes.bool.isRequired,
  tosAttribute: PropTypes.bool,
  type: PropTypes.string.isRequired,
  typeOptions: PropTypes.object,
  updateAttribute: PropTypes.func,
  updateFunctionAttribute: PropTypes.func,
  updateType: PropTypes.func,
  updateTypeSpecifier: PropTypes.func,
};

export default Attribute;
