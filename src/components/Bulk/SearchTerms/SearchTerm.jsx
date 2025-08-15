/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { endsWith, find, includes, isArray, isEmpty, keys, sortBy, startsWith, trimEnd } from 'lodash';

import {
  BULK_UPDATE_SEARCH_UNEDITABLE_FUNCTION_ATTRIBUTES,
  BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES,
  BULK_UPDATE_SEARCH_COMPARISON,
  BULK_UPDATE_SEARCH_TARGET,
  BULK_UPDATE_SEARCH_TERM_DEFAULT,
} from '../../../constants';
import './SearchTerms.scss';
import { getDisplayLabelForAttribute } from '../../../utils/attributeHelper';

const SearchTerm = ({
  attributeTypes,
  attributeValues,
  searchTerm,
  showAdd,
  onAddSearchTerm,
  onChangeSearchTerm,
  onRemoveSearchTerm,
}) => {
  const onChangeTarget = useCallback(
    (option) => {
      onChangeSearchTerm({
        ...searchTerm,
        target: option.value,
        attribute: BULK_UPDATE_SEARCH_TERM_DEFAULT.attribute,
        value: BULK_UPDATE_SEARCH_TERM_DEFAULT.value,
      });
    },
    [searchTerm, onChangeSearchTerm],
  );

  const onChangeAttribute = useCallback(
    (option) => {
      onChangeSearchTerm({
        ...searchTerm,
        attribute: option.value,
        value: BULK_UPDATE_SEARCH_TERM_DEFAULT.value,
      });
    },
    [searchTerm, onChangeSearchTerm],
  );

  const onChangeEquals = useCallback(
    (option) => {
      onChangeSearchTerm({
        ...searchTerm,
        equals: option.value,
      });
    },
    [searchTerm, onChangeSearchTerm],
  );

  const onChangeValue = useCallback(
    (option) => {
      if (option?.value) {
        const value =
          startsWith(option?.value, '[') && endsWith(option?.value, ']') ? JSON.parse(option?.value) : option?.value;
        onChangeSearchTerm({
          ...searchTerm,
          value,
        });
      }
    },
    [searchTerm, onChangeSearchTerm],
  );

  const getAttributeOptions = useCallback((attributeTypes, target) => {
    const attributeTarget = trimEnd(target, 's');
    const attributes =
      target === 'function'
        ? [...BULK_UPDATE_SEARCH_UNEDITABLE_FUNCTION_ATTRIBUTES, ...BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES]
        : [];
    return sortBy(
      keys(attributeTypes).reduce((acc, key) => {
        const attribute = attributeTypes[key];
        if (!!attribute.allowedIn && includes(attribute.allowedIn, attributeTarget)) {
          acc.push({
            label: attribute.name,
            value: key,
          });
        }
        return acc;
      }, attributes),
      ['label'],
    );
  }, []);

  const getValueOptions = useCallback((attributeValues, searchTerm) => {
    const attributeTarget = trimEnd(searchTerm.target, 's');
    let valueOptions = [];
    if (
      !isEmpty(searchTerm.attribute) &&
      !isEmpty(attributeValues) &&
      attributeValues[attributeTarget] &&
      attributeValues[attributeTarget][searchTerm.attribute]
    ) {
      valueOptions = attributeValues[attributeTarget][searchTerm.attribute].map((value) => {
        const displayLabel = isArray(value)
          ? value
              .map((v) =>
                getDisplayLabelForAttribute({
                  attributeValue: v,
                  identifier: searchTerm.attribute,
                }),
              )
              .join(', ')
          : getDisplayLabelForAttribute({
              attributeValue: value,
              identifier: searchTerm.attribute,
            });
        return {
          label: displayLabel,
          value: isArray(value) ? JSON.stringify(value) : value,
        };
      });
    }
    return valueOptions;
  }, []);

  const attributeOptions = getAttributeOptions(attributeTypes, searchTerm.target);
  const valueOptions = getValueOptions(attributeValues, searchTerm);
  if (!find(valueOptions, { value: searchTerm.value }) && !isEmpty(searchTerm.value)) {
    const displayLabel = isArray(searchTerm.value)
      ? searchTerm.value
          .map((v) =>
            getDisplayLabelForAttribute({
              attributeValue: v,
              identifier: searchTerm.attribute,
            }),
          )
          .join(', ')
      : getDisplayLabelForAttribute({
          attributeValue: searchTerm.value,
          identifier: searchTerm.attribute,
        });
    valueOptions.push({
      label: displayLabel,
      value: searchTerm.value,
    });
  }
  const attributeValue = attributeOptions.find(({ value }) => value === searchTerm.attribute);

  return (
    <div className='search-term' data-testid='search-term'>
      <div>
        <strong>Taso</strong>
        <Select
          isClearable={false}
          value={BULK_UPDATE_SEARCH_TARGET.find(({ value }) => value === searchTerm.target)}
          onChange={onChangeTarget}
          options={BULK_UPDATE_SEARCH_TARGET}
          placeholder='Valitse...'
        />
      </div>
      <div>
        <strong>Kenttä</strong>
        <Select
          isDisabled={isEmpty(searchTerm.target)}
          isClearable={false}
          value={attributeValue || ''}
          onChange={onChangeAttribute}
          autoFocus
          options={attributeOptions}
          placeholder='Valitse...'
        />
      </div>
      <div>
        <strong>Vertaus</strong>
        <Select
          isClearable={false}
          value={BULK_UPDATE_SEARCH_COMPARISON.find(({ value }) => value === searchTerm.equals)}
          onChange={onChangeEquals}
          options={BULK_UPDATE_SEARCH_COMPARISON}
          placeholder='Valitse...'
        />
      </div>
      <div>
        <strong>Arvo</strong>
        <CreatableSelect
          isDisabled={isEmpty(searchTerm.attribute)}
          isClearable={false}
          value={valueOptions.find(({ value }) => value === searchTerm.value) || ''}
          onChange={onChangeValue}
          options={valueOptions}
          placeholder='Valitse...'
        />
      </div>
      <div className='search-term-action'>
        <button type='button' className='btn btn-primary' onClick={onRemoveSearchTerm}>
          <i className='fa-solid fa-minus' />
        </button>
      </div>
      <div className='search-term-action'>
        {showAdd && (
          <button type='button' className='btn btn-primary' onClick={onAddSearchTerm}>
            <i className='fa-solid fa-plus' />
          </button>
        )}
      </div>
    </div>
  );
};

SearchTerm.propTypes = {
  attributeTypes: PropTypes.object,
  attributeValues: PropTypes.object.isRequired,
  onAddSearchTerm: PropTypes.func.isRequired,
  onChangeSearchTerm: PropTypes.func.isRequired,
  onRemoveSearchTerm: PropTypes.func.isRequired,
  searchTerm: PropTypes.shape({
    attribute: PropTypes.string.isRequired,
    equals: PropTypes.bool.isRequired,
    target: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.array.isRequired]),
  }),
  showAdd: PropTypes.bool.isRequired,
};

export default SearchTerm;
