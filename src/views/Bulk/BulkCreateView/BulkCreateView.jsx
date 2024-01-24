/* eslint-disable react/forbid-prop-types */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter, Prompt } from 'react-router-dom';
import {
  cloneDeep,
  endsWith,
  every,
  filter,
  find,
  includes,
  isArray,
  isEmpty,
  isEqual,
  isString,
  keys,
  mapKeys,
  merge,
  pickBy,
  slice,
  some,
  startsWith,
  trim,
  trimEnd,
} from 'lodash';
import Select from 'react-select';

import {
  CHANGE_BULKUPDATE,
  BULK_UPDATE_CONVERSION_TYPES,
  BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES,
  BULK_UPDATE_SEARCH_TERM_DEFAULT,
  BULK_UPDATE_SEARCH_UNEDITABLE_FUNCTION_ATTRIBUTES,
  statusFilters,
} from '../../../constants';
import { validateTOS, validatePhase, validateAction, validateRecord } from '../../../utils/validators';
import IsAllowed from '../../../components/IsAllowed/IsAllowed';
import Popup from '../../../components/Popup';
import Conversion from '../../../components/Bulk/Conversion/Conversion';
import Preview from '../../../components/Bulk/Preview/Preview';
import SearchResults from '../../../components/Bulk/SearchResults/SearchResults';
import SearchTerms from '../../../components/Bulk/SearchTerms/SearchTerms';
import './BulkCreateView.scss';

const PATH_EMPTY_NAME_REPLACEMENT = '---';

class BulkCreateView extends React.Component {
  constructor(props) {
    super(props);

    this.getAttributeName = this.getAttributeName.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onCancelSave = this.onCancelSave.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
    this.onClosePreview = this.onClosePreview.bind(this);
    this.onConfirmConvert = this.onConfirmConvert.bind(this);
    this.onConfirmSave = this.onConfirmSave.bind(this);
    this.onConvert = this.onConvert.bind(this);
    this.onPreview = this.onPreview.bind(this);
    this.resetSearch = this.resetSearch.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onSelectAllSearchResults = this.onSelectAllSearchResults.bind(this);
    this.onSelectPreviewItem = this.onSelectPreviewItem.bind(this);
    this.onSelectSearchResult = this.onSelectSearchResult.bind(this);

    this.state = {
      attributeValues: {},
      conversion: null,
      conversions: null,
      conversionItems: null,
      isDirty: false,
      isFinalPreview: false,
      isSaving: false,
      isValid: false,
      itemList: [],
      preview: null,
      previewItems: null,
      searchResults: [],
      searchResultHits: {
        actions: 0,
        phases: 0,
        records: 0,
      },
      searchTerms: [{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() }],
      state: 'draft',
    };
  }

  componentDidMount() {
    this.props.fetchNavigation(true);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { isFetching: wasFetching } = this.props;
    const { isFetching, items } = nextProps;
    if (wasFetching && !isFetching && items) {
      const flattenItems = (obj) => {
        const array = Array.isArray(obj) ? obj : [obj];
        return array.reduce((acc, item) => {
          if (item.children) {
            acc = acc.concat(flattenItems(item.children));
          } else if (item.function) {
            const clonedItem = cloneDeep(item);
            clonedItem.attributes = clonedItem.function_attributes;
            clonedItem.valid_from = clonedItem.function_valid_from;
            clonedItem.valid_to = clonedItem.function_valid_to;
            acc.push(clonedItem);
          }
          return acc;
        }, []);
      };
      const itemList = flattenItems(items);
      const attributeValues = this.getAttributeValues(itemList);
      this.setState({ attributeValues, itemList });
    }
  }

  onConvert(conversion) {
    const { searchResults, searchTerms } = this.state;
    const items = {};
    let isValid = true;

    // eslint-disable-next-line sonarjs/cognitive-complexity
    filter(searchResults, (result) => result.selected).forEach((result) => {
      const changed = {};
      let isChanged = false;
      if (conversion.type === 'function') {
        if (
          find(BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES, {
            value: conversion.attribute,
          })
        ) {
          changed[conversion.attribute] = conversion.value;
        } else {
          changed.attributes = {
            [conversion.attribute]: conversion.value,
          };
        }
        isChanged = true;
      } else if (!isEmpty(result.hit.phases)) {
        changed.phases = {};
        keys(result.hit.phases).forEach((phase) => {
          changed.phases[phase] = {};
          if (conversion.type === 'phase') {
            changed.phases[phase].attributes = {
              [conversion.attribute]: conversion.value,
            };
            isChanged = true;
          } else if (!isEmpty(result.hit.phases[phase].actions)) {
            changed.phases[phase].actions = {};
            keys(result.hit.phases[phase].actions).forEach((action) => {
              changed.phases[phase].actions[action] = {};
              if (conversion.type === 'action') {
                changed.phases[phase].actions[action] = {
                  attributes: {
                    [conversion.attribute]: conversion.value,
                  },
                };
                isChanged = true;
              } else if (!isEmpty(result.hit.phases[phase].actions[action].records)) {
                changed.phases[phase].actions[action].records = {};
                keys(result.hit.phases[phase].actions[action].records).forEach((record) => {
                  changed.phases[phase].actions[action].records[record] = {
                    attributes: {
                      [conversion.attribute]: conversion.value,
                    },
                  };
                  isChanged = true;
                });
              }
            });
          }
        });
      } else {
        changed.phases = {};
        if (!isEmpty(result.item.phases)) {
          result.item.phases.forEach((phase) => {
            if (conversion.type === 'phase') {
              changed.phases[phase.id] = {
                attributes: {
                  [conversion.attribute]: conversion.value,
                },
              };
              isChanged = true;
            } else if (!isEmpty(phase.actions)) {
              changed.phases[phase.id] = { actions: {} };
              phase.actions.forEach((action) => {
                if (conversion.type === 'action') {
                  changed.phases[phase.id].actions[action.id] = {
                    attributes: {
                      [conversion.attribute]: conversion.value,
                    },
                  };
                  isChanged = true;
                } else if (!isEmpty(action.records)) {
                  changed.phases[phase.id].actions[action.id] = { records: {} };
                  action.records.forEach((record) => {
                    changed.phases[phase.id].actions[action.id].records[record.id] = {
                      attributes: {
                        [conversion.attribute]: conversion.value,
                      },
                    };
                    isChanged = true;
                  });
                }
              });
            }
          });
        }
      }
      if (isChanged) {
        const errors = this.validateChangedItem(result.item, changed);
        if (!isEmpty(errors)) {
          isValid = false;
        }
        items[result.item.function] = {
          item: result.item,
          hit: result.hit,
          paths: result.paths,
          selected: true,
          changed,
          errors,
        };
      }
    });
    this.setState({
      conversion,
      isValid,
      preview: {
        conversion: [conversion],
        items,
        searchTerms,
      },
      previewItems: items,
    });
  }

  onSelectPreviewItem(id) {
    const { conversionItems, isFinalPreview, previewItems } = this.state;
    if (previewItems?.[id]) {
      this.setState({
        previewItems: {
          ...previewItems,
          [id]: { ...previewItems?.[id], selected: !previewItems?.[id].selected },
        },
      });
    }
    if (isFinalPreview && conversionItems && conversionItems[id]) {
      this.setState({
        conversionItems: {
          ...conversionItems,
          [id]: {
            ...conversionItems[id],
            selected: !conversionItems[id].selected,
          },
        },
      });
    }
  }

  onConfirmConvert() {
    const { conversions, conversionItems, preview, previewItems } = this.state;
    const selectedItems = pickBy(previewItems, (item) => item.selected);
    const mergedItems = conversionItems ? merge(conversionItems, selectedItems) : selectedItems;

    this.setState({
      conversion: null,
      conversions: {
        conversion: !isEmpty(conversions) ? [...conversions.conversion, ...preview.conversion] : preview.conversion,
        searchTerms: !isEmpty(conversions) ? [...conversions.searchTerms, ...preview.searchTerms] : preview.searchTerms,
      },
      conversionItems: mergedItems,
      isDirty: true,
      preview: null,
      previewItems: null,
      searchResults: [],
      searchTerms: [{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() }],
    });
  }

  onCancel() {
    this.setState({
      conversions: null,
      conversionItems: null,
      isDirty: false,
    });
  }

  onSave() {
    if (this.state.conversions) {
      const { conversionItems } = this.state;
      const isErrors = some(
        keys(conversionItems),
        (id) => conversionItems[id].selected && !isEmpty(conversionItems[id].errors),
      );
      this.setState({ isSaving: true, state: 'draft', isValid: !isErrors });
    }
  }

  onCancelSave() {
    this.setState({ isSaving: false });
  }

  onConfirmSave() {
    if (this.state.conversions) {
      const {
        conversionItems,
        conversions: { conversion },
        state,
      } = this.state;
      const description = conversion
        .map((conv) => `${this.getTypeName(conv.type)}: ${this.getAttributeName(conv.attribute)} = ${conv.value}`)
        .join(', ');
      const changes = keys(conversionItems).reduce((acc, id) => {
        if (conversionItems[id].selected) {
          const { item } = conversionItems[id];
          acc[`${id}__${item.function_version}`] = conversionItems[id].changed;
        }
        return acc;
      }, {});
      const bulkUpdate = {
        description,
        changes,
        state,
      };
      this.props
        .saveBulkUpdate(bulkUpdate)
        .then(() => {
          this.setState({
            conversion: null,
            conversions: null,
            conversionItems: null,
            isDirty: false,
            preview: null,
            previewItems: null,
            searchResults: [],
            searchTerms: [{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() }],
          });
          this.props.history.push('/bulk');
          this.props.fetchNavigation(true);
          return this.props.displayMessage({
            title: 'Massamuutos',
            body: 'Massamuutos tallennettu!',
          });
        })
        .catch((err) =>
          this.props.displayMessage(
            {
              title: 'Virhe',
              body: `"${err.message}"`,
            },
            { type: 'error' },
          ),
        );
    }
  }

  onChangeState(state) {
    this.setState({
      state: state.value,
    });
  }

  onPreview() {
    const { conversions, conversionItems } = this.state;
    this.setState({
      preview: conversions,
      previewItems: conversionItems,
      isFinalPreview: true,
    });
  }

  onClosePreview() {
    this.setState({
      preview: null,
      previewItems: null,
      isFinalPreview: false,
    });
  }

  onSearch(searchTerms) {
    const { itemList } = this.state;
    const combinedSearchTerms = searchTerms.reduce(
      (acc, searchTerm) => {
        const { attribute, equals, target, value } = searchTerm;
        const trimmedTarget = endsWith(target, 's') ? trimEnd(target, 's') : target;
        const isEndsWith = isString(value) && startsWith(value, '*');
        const isStartsWith = isString(value) && endsWith(value, '*');
        const trimmedValue = isEndsWith || isStartsWith ? trim(value, '*') : value;
        acc[trimmedTarget].attributes[attribute] = {
          equals,
          isEndsWith,
          isStartsWith,
          value: trimmedValue,
        };
        if (endsWith(target, 's')) {
          acc[trimmedTarget].all = true;
        }
        return acc;
      },
      {
        action: { all: false, attributes: {} },
        function: { attributes: {} },
        phase: { all: false, attributes: {} },
        record: { all: false, attributes: {} },
      },
    );

    // eslint-disable-next-line sonarjs/cognitive-complexity
    const searchResults = itemList.reduce((acc, item) => {
      const paths = [];
      let hit = {
        function: item.function,
        attributes: {},
        phases: {},
      };
      let actionsSuccess = isEmpty(combinedSearchTerms.action.attributes);
      let functionsSuccess = isEmpty(combinedSearchTerms.function.attributes);
      const phasesSuccess = isEmpty(combinedSearchTerms.phase.attributes);
      const recordsSuccess = isEmpty(combinedSearchTerms.record.attributes);
      const isSubSearch = !actionsSuccess || !phasesSuccess || !recordsSuccess;

      if (!functionsSuccess) {
        functionsSuccess = every(keys(combinedSearchTerms.function.attributes), (attribute) => {
          const { equals, isEndsWith, isStartsWith, value } = combinedSearchTerms.function.attributes[attribute];
          if (item[attribute] && this.isMatch(item[attribute], value, isEndsWith, isStartsWith, equals)) {
            const functionAttribute = find(
              [
                ...BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES,
                ...BULK_UPDATE_SEARCH_UNEDITABLE_FUNCTION_ATTRIBUTES,
              ],
              { value: attribute },
            );
            paths.push(`${functionAttribute ? functionAttribute.label : attribute}: ${item[attribute]}`);
            hit = merge(hit, { [attribute]: item[attribute] });
            return true;
          }
          if (
            item.attributes[attribute] &&
            this.isMatch(item.attributes[attribute], value, isEndsWith, isStartsWith, equals)
          ) {
            paths.push(`${this.getAttributeName(attribute)}: ${item.attributes[attribute]}`);
            hit = merge(hit, {
              attributes: { [attribute]: item.attributes[attribute] },
            });
            return true;
          }
          return false;
        });
      }

      if (functionsSuccess && isSubSearch) {
        const phasePaths = [];
        let phaseHit = {};
        let phaseCounter = 0;
        item.phases.forEach((phase) => {
          const phaseName = phase.name || PATH_EMPTY_NAME_REPLACEMENT;
          let phaseSuccess = isEmpty(combinedSearchTerms.phase.attributes);
          let actionSuccess = isEmpty(combinedSearchTerms.action.attributes);
          const actionPaths = [];
          let actionHit = {};
          let actionCounter = 0;

          const compared = this.compareNew(phase, combinedSearchTerms.phase);
          if (!isEmpty(compared) && compared.paths.length) {
            phaseSuccess = true;
          }
          if (
            (phaseSuccess && !isEmpty(combinedSearchTerms.action.attributes)) ||
            !isEmpty(combinedSearchTerms.record.attributes)
          ) {
            phase.actions.forEach((action) => {
              const actionName = action.name || PATH_EMPTY_NAME_REPLACEMENT;
              let recordSuccess = isEmpty(combinedSearchTerms.record.attributes);
              const comparedAction = this.compareNew(action, combinedSearchTerms.action);
              if (!isEmpty(comparedAction) && comparedAction.paths.length) {
                actionSuccess = true;
              }
              if (actionSuccess && !isEmpty(combinedSearchTerms.record.attributes)) {
                const recordPaths = [];
                let recordHit = {};
                let recordCounter = 0;
                action.records.forEach((record) => {
                  const comparedRecord = this.compareNew(record, combinedSearchTerms.record);
                  if (!isEmpty(comparedRecord) && comparedRecord.paths.length) {
                    recordPaths.push(...comparedRecord.paths);
                    comparedRecord.hits.forEach((comparedHit) => {
                      recordHit = merge(recordHit, {
                        [comparedHit.id]: { attributes: comparedHit.attributes },
                      });
                    });
                    recordCounter += 1;
                  }
                });
                if (
                  (!isEmpty(recordHit) && combinedSearchTerms.record.all && action.records.length === recordCounter) ||
                  (!combinedSearchTerms.record.all && recordCounter)
                ) {
                  recordPaths.forEach((path) => {
                    actionPaths.push(`${phaseName} > ${actionName} > ${path}`);
                  });
                  actionHit = merge(actionHit, {
                    [action.id]: { records: recordHit },
                  });
                  recordSuccess = true;
                }
              }
              if (recordSuccess) {
                if (!isEmpty(comparedAction) && comparedAction.paths.length) {
                  actionPaths.unshift(...comparedAction.paths);
                  comparedAction.hits.forEach((comparedHit) => {
                    actionHit = merge(actionHit, {
                      [comparedHit.id]: { attributes: comparedHit.attributes },
                    });
                  });
                }
                actionCounter += 1;
                actionSuccess = true;
              }
            });
            if (
              !isEmpty(actionHit) &&
              ((combinedSearchTerms.action.all && phase.actions.length === actionCounter) ||
                (!combinedSearchTerms.action.all && actionCounter))
            ) {
              actionPaths.forEach((path) => {
                phasePaths.push(`${phaseName} > ${path}`);
              });
              phaseHit = merge(phaseHit, {
                [phase.id]: { actions: actionHit },
              });
              actionsSuccess = true;
            }
          }
          if (actionSuccess) {
            if (!isEmpty(compared) && compared.paths.length) {
              phasePaths.unshift(...compared.paths);
              compared.hits.forEach((comparedHit) => {
                phaseHit = merge(phaseHit, {
                  [comparedHit.id]: { attributes: comparedHit.attributes },
                });
              });
            }
            phaseCounter += 1;
          }
        });
        if (
          !isEmpty(phaseHit) &&
          ((combinedSearchTerms.phase.all && item.phases.length === phaseCounter) ||
            (!combinedSearchTerms.phase.all && phaseCounter))
        ) {
          paths.push(...phasePaths);
          hit = merge(hit, { phases: phaseHit });
        }
      }
      if ((functionsSuccess && !isSubSearch) || !isEmpty(hit.phases)) {
        acc.push({
          hit,
          item,
          paths,
          selected: true,
        });
      }
      return acc;
    }, []);

    const searchResultHits = searchResults.reduce(
      (acc, result) => {
        const { hit } = result;
        if (hit.phases) {
          keys(hit.phases).forEach((phaseId) => {
            acc.phases += 1;
            const phase = hit.phases[phaseId];
            if (phase?.actions) {
              keys(phase?.actions).forEach((actionId) => {
                acc.actions += 1;
                const action = phase?.actions[actionId];
                if (action?.records) {
                  acc.records += keys(action?.records).length;
                }
              });
            }
          });
        }
        return acc;
      },
      { phases: 0, actions: 0, records: 0 },
    );

    this.setState({ searchResults, searchResultHits, searchTerms });
  }

  onSelectAllSearchResults(selected) {
    this.setState((prev) => {
      const searchResults = prev.searchResults.map((result) => ({
        ...result,
        selected,
      }));

      return { searchResults };
    });
  }

  onSelectSearchResult(index, selected) {
    const { searchResults } = this.state;
    const searchResult = searchResults[index];
    const start = slice(searchResults, 0, index);
    const end = index + 1 < searchResults.length ? slice(searchResults, index + 1, searchResults.length) : [];
    this.setState({
      searchResults: [...start, { ...searchResult, selected }, ...end],
    });
  }

  getAttributeValues(itemList) {
    const addAttributeValues = (acc, attributes, type) => {
      keys(attributes || {}).forEach((attribute) => {
        if (attributes[attribute]) {
          if (!acc[type][attribute]) {
            acc[type][attribute] = [attributes[attribute]];
          } else if (isArray(attributes[attribute])) {
            const isVal = some(acc[type][attribute], (val) => isEqual(attributes[attribute], val));
            if (!isVal) {
              acc[type][attribute].push(attributes[attribute]);
            }
          } else if (!includes(acc[type][attribute], attributes[attribute])) {
            acc[type][attribute].push(attributes[attribute]);
          }
        }
      });
    };
    return itemList.reduce(
      (acc, item) => {
        addAttributeValues(acc, item.attributes, 'function');
        addAttributeValues(
          acc,
          {
            code: item.code || '',
            function_state: item.function_state || null,
            valid_from: item.valid_from || null,
            valid_to: item.valid_to || null,
          },
          'function',
        );
        item.phases.forEach((phase) => {
          addAttributeValues(acc, phase.attributes, 'phase');
          phase.actions.forEach((action) => {
            addAttributeValues(acc, action.attributes, 'action');
            action.records.forEach((record) => {
              addAttributeValues(acc, record.attributes, 'record');
            });
          });
        });
        return acc;
      },
      {
        action: {},
        function: {},
        phase: {},
        record: {},
      },
    );
  }

  getAttributeName(attribute) {
    const attributeOption = find(
      [...BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES, ...BULK_UPDATE_SEARCH_UNEDITABLE_FUNCTION_ATTRIBUTES],
      { value: attribute },
    );
    if (!isEmpty(attributeOption)) {
      return attributeOption.label;
    }
    return this.props.getAttributeName(attribute);
  }

  getTypeName(type) {
    const typeName = find(BULK_UPDATE_CONVERSION_TYPES, (option) => option.value === type);
    return !isEmpty(typeName) ? typeName.label : type;
  }

  getItemErrors(phases, attributeTypes) {
    const actions = phases.map((phase) => phase.action);
    const records = actions.map((action) => action.records);

    const recordsReduced = records.reduce((acc, record) => {
      const recordErrors = validateRecord(record, attributeTypes);

      if (!isEmpty(recordErrors)) {
        acc[record.id] = {
          attributes: recordErrors,
        };
      }

      return acc;
    }, {});

    const actionsReduced = actions.reduce((acc, action) => {
      const actionErrors = validateAction(action, attributeTypes);

      if (!isEmpty(actionErrors)) {
        acc[action.id] = {
          attributes: actionErrors,
        };
      }

      if (!isEmpty(recordsReduced)) {
        acc = merge(acc, { [action.id]: { recordsReduced } });
      }

      return acc;
    }, {});

    return phases.reduce((acc, phase) => {
      const phaseErrors = validatePhase(phase, attributeTypes);

      if (!isEmpty(phaseErrors)) {
        acc[phase.id] = {
          attributes: phaseErrors,
        };
      }

      if (!isEmpty(actionsReduced)) {
        acc = merge(acc, { [phase.id]: { actionsReduced } });
      }

      return acc;
    }, {});
  }

  validateChangedItem(item, changed) {
    const { attributeTypes } = this.props;

    const clonedItem = cloneDeep(item);
    const changedItem = merge(clonedItem, changed);
    const functionErrors = validateTOS(changedItem, attributeTypes);

    const errors = {};

    if (!isEmpty(functionErrors)) {
      errors.attributes = functionErrors;
    }

    const { phases } = changedItem;

    if (!isEmpty(phases)) {
      const itemErrors = this.getItemErrors(phases, attributeTypes);

      if (!isEmpty(itemErrors)) {
        errors.phases = itemErrors;
      }
    }

    return errors;
  }

  isMatch(value, other, isEndsWith, isStartsWith, equals) {
    return (
      (isStartsWith && isEndsWith && includes(value, other)) ||
      (isStartsWith && startsWith(value, other)) ||
      (isEndsWith && endsWith(value, other)) ||
      equals === isEqual(value, other)
    );
  }

  matchesAll(attributes, searchAttributes) {
    return every(keys(searchAttributes), (attribute) => {
      const { equals, isEndsWith, isStartsWith, value } = searchAttributes[attribute];
      return attributes[attribute]
        ? this.isMatch(attributes[attribute], value, isEndsWith, isStartsWith, equals)
        : false;
    });
  }

  compareNew(item, searchTerm) {
    const paths = [];
    const hits = [];
    if (item.attributes && this.matchesAll(item.attributes, searchTerm.attributes)) {
      mapKeys(searchTerm.attributes, (value, attribute) => {
        paths.push(
          `${item.name || PATH_EMPTY_NAME_REPLACEMENT} > ${this.getAttributeName(attribute)}: ${
            item.attributes[attribute]
          }`,
        );
        hits.push({
          id: item.id,
          attributes: {
            [attribute]: item.attributes[attribute],
          },
        });
      });
    }
    return !isEmpty(hits) ? { hits, paths } : null;
  }

  resetSearch() {
    this.setState({ searchResults: [] });
  }

  render() {
    const { attributeTypes } = this.props;
    const {
      attributeValues,
      conversion,
      conversions,
      conversionItems,
      isFinalPreview,
      isValid,
      preview,
      previewItems,
      searchResults,
      searchResultHits,
      searchTerms,
      state,
    } = this.state;
    const isSelectedResults = searchResults.filter((result) => result.selected).length > 0;
    const selectedCount = filter(conversionItems, { selected: true }).length;

    if (!isEmpty(preview) && previewItems) {
      return (
        <Preview
          conversions={preview.conversion}
          getAttributeName={this.getAttributeName}
          getTypeName={this.getTypeName}
          isFinalPreview={isFinalPreview}
          items={previewItems}
          onClose={this.onClosePreview}
          onConfirm={this.onConfirmConvert}
          onSelect={this.onSelectPreviewItem}
          searchTerms={preview.searchTerms}
        />
      );
    }
    return (
      <div className='bulk-update-create'>
        <Prompt when={this.state.isDirty} message='Muutoksia ei ole tallennettu, haluatko silti jatkaa?' />
        <div className='col-xs-12'>
          <Link className='btn btn-link' to='/bulk'>
            <i className='fa-solid fa-angle-left' /> Takaisin
          </Link>
        </div>
        <div className='col-xs-9 bulk-update-create-search'>
          <SearchTerms
            attributeTypes={attributeTypes}
            attributeValues={attributeValues}
            onSearch={this.onSearch}
            resetSearchResults={this.resetSearch}
            searchTerms={searchTerms}
          />
          <IsAllowed to={CHANGE_BULKUPDATE}>
            <div>
              {!isEmpty(searchResults) && (
                <Conversion
                  conversion={conversion}
                  attributeTypes={attributeTypes}
                  attributeValues={attributeValues}
                  disabled={!isSelectedResults}
                  onConvert={this.onConvert}
                />
              )}
            </div>
          </IsAllowed>
          {!isEmpty(searchResults) && (
            <SearchResults
              hits={searchResultHits}
              onSelect={this.onSelectSearchResult}
              onSelectAll={this.onSelectAllSearchResults}
              searchResults={searchResults}
            />
          )}
        </div>
        <div className='col-xs-3 bulk-update-create-side-content'>
          <IsAllowed to={CHANGE_BULKUPDATE}>
            <div className='bulk-update-create-actions'>
              <button type='button' className='btn btn-primary' disabled={isEmpty(conversions)} onClick={this.onSave}>
                Tallenna
              </button>
              <button type='button' className='btn btn-default' disabled={isEmpty(conversions)} onClick={this.onCancel}>
                Palauta
              </button>
              <button
                type='button'
                className='btn btn-default'
                disabled={isEmpty(conversions)}
                onClick={this.onPreview}
              >
                Esikatselu
              </button>
            </div>
          </IsAllowed>
          <h4>Muutoshistoria</h4>
          {isEmpty(conversions) && <p>Ei tapahtumia</p>}
          {!isEmpty(conversions) && (
            <p>
              <strong>Muutetaan: {selectedCount} käsittelyprosessia</strong>
            </p>
          )}
          {!isEmpty(conversions) &&
            conversions.conversion.map((c) => (
              <p key={`${c.type}-${c.value}`}>
                {`${this.getTypeName(c.type)}: ${this.getAttributeName(c.attribute)} = ${c.value}`}
              </p>
            ))}
          {this.state.isSaving && !isEmpty(conversions) && (
            <Popup
              content={
                <div>
                  <h3>Tallennetaanko massatilaus?</h3>
                  <p>Muutetaan: {selectedCount} käsittelyprosessia</p>
                  {!isValid && <p className='alert-danger'>HUOM! Esitarkastuksessa on virheitä. Katso esikatselu.</p>}
                  <div>
                    <label htmlFor='select-status'>Valitse massamuutospaketin tila:</label>
                    <Select
                      id='select-status'
                      className='Select'
                      isClearable={false}
                      value={statusFilters.find(({ value }) => value === state)}
                      onChange={this.onChangeState}
                      autoFocus
                      options={statusFilters}
                      placeholder='Valitse massamuutospaketin tila...'
                    />
                  </div>
                  <div>
                    <button
                      type='button'
                      className='btn btn-primary'
                      disabled={!isValid && state !== 'draft'}
                      onClick={this.onConfirmSave}
                    >
                      Tallenna massamuutos
                    </button>
                    <button type='button' className='btn btn-default' onClick={this.onCancelSave}>
                      Peruuta
                    </button>
                  </div>
                </div>
              }
              closePopup={this.onCancelSave}
            />
          )}
        </div>
      </div>
    );
  }
}

BulkCreateView.propTypes = {
  attributeTypes: PropTypes.object,
  displayMessage: PropTypes.func.isRequired,
  fetchNavigation: PropTypes.func.isRequired,
  getAttributeName: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  items: PropTypes.array.isRequired,
  saveBulkUpdate: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(BulkCreateView);
