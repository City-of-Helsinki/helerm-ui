/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
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

class SearchTerm extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeAttribute = this.onChangeAttribute.bind(this);
    this.onChangeEquals = this.onChangeEquals.bind(this);
    this.onChangeTarget = this.onChangeTarget.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
  }

  onChangeTarget(option) {
    const { searchTerm } = this.props;
    this.props.onChangeSearchTerm({
      ...searchTerm,
      target: option.value,
      attribute: BULK_UPDATE_SEARCH_TERM_DEFAULT.attribute,
      value: BULK_UPDATE_SEARCH_TERM_DEFAULT.value,
    });
  }

  onChangeAttribute(option) {
    const { searchTerm } = this.props;
    this.props.onChangeSearchTerm({
      ...searchTerm,
      attribute: option.value,
      value: BULK_UPDATE_SEARCH_TERM_DEFAULT.value,
    });
  }

  onChangeEquals(option) {
    const { searchTerm } = this.props;
    this.props.onChangeSearchTerm({
      ...searchTerm,
      equals: option.value,
    });
  }

  onChangeValue(option) {
    const { searchTerm } = this.props;
    if (option?.value) {
      const value =
        startsWith(option?.value, '[') && endsWith(option?.value, ']') ? JSON.parse(option?.value) : option?.value;
      this.props.onChangeSearchTerm({
        ...searchTerm,
        value,
      });
    }
  }

  getAttributeOptions(attributeTypes, target) {
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
  }

  getValueOptions(attributeValues, searchTerm) {
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
  }

  render() {
    const { attributeTypes, attributeValues, searchTerm, showAdd } = this.props;
    const attributeOptions = this.getAttributeOptions(attributeTypes, searchTerm.target);
    const valueOptions = this.getValueOptions(attributeValues, searchTerm);
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
      <div className='search-term'>
        <div>
          <strong>Taso</strong>
          <Select
            isClearable={false}
            value={BULK_UPDATE_SEARCH_TARGET.find(({ value }) => value === searchTerm.target)}
            onChange={this.onChangeTarget}
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
            onChange={this.onChangeAttribute}
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
            onChange={this.onChangeEquals}
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
            onChange={this.onChangeValue}
            options={valueOptions}
            placeholder='Valitse...'
          />
        </div>
        <div className='search-term-action'>
          <button type='button' className='btn btn-primary' onClick={this.props.onRemoveSearchTerm}>
            <i className='fa-solid fa-minus' />
          </button>
        </div>
        <div className='search-term-action'>
          {showAdd && (
            <button type='button' className='btn btn-primary' onClick={this.props.onAddSearchTerm}>
              <i className='fa-solid fa-plus' />
            </button>
          )}
        </div>
      </div>
    );
  }
}

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
