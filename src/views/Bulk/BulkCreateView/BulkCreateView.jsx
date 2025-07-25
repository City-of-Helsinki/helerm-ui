/* eslint-disable no-param-reassign, sonarjs/no-nested-functions */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import RouterPrompt from '../../../components/RouterPrompt/RouterPrompt';
import { displayMessage } from '../../../utils/helpers';
import { fetchNavigationThunk, isFetchingSelector, itemsSelector } from '../../../store/reducers/navigation';
import { saveBulkUpdateThunk } from '../../../store/reducers/bulk';
import { attributeTypesSelector } from '../../../store/reducers/ui';

import './BulkCreateView.scss';

const PATH_EMPTY_NAME_REPLACEMENT = '---';

const BulkCreateView = () => {
  const dispatch = useDispatch();
  const items = useSelector(itemsSelector);
  const isFetching = useSelector(isFetchingSelector);
  const attributeTypes = useSelector(attributeTypesSelector);

  const navigate = useNavigate();

  const [attributeValues, setAttributeValues] = useState({});
  const [conversion, setConversion] = useState(null);
  const [conversions, setConversions] = useState(null);
  const [conversionItems, setConversionItems] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isFinalPreview, setIsFinalPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [preview, setPreview] = useState(null);
  const [previewItems, setPreviewItems] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultHits, setSearchResultHits] = useState({
    actions: 0,
    phases: 0,
    records: 0,
  });
  const [searchTerms, setSearchTerms] = useState([{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() }]);
  const [stateValue, setStateValue] = useState('draft');

  const getAttributeName = (attribute) => {
    const attributeOption = find(
      [...BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES, ...BULK_UPDATE_SEARCH_UNEDITABLE_FUNCTION_ATTRIBUTES],
      { value: attribute },
    );
    if (!isEmpty(attributeOption)) {
      return attributeOption.label;
    }
    return attributeTypes?.[attribute]?.name || attribute;
  };

  const getTypeName = (type) => {
    const typeName = find(BULK_UPDATE_CONVERSION_TYPES, (option) => option.value === type);
    return !isEmpty(typeName) ? typeName.label : type;
  };

  const addAttributeValues = (acc, attributes, type) => {
    keys(attributes).forEach((key) => {
      if (!acc[type][key]) {
        acc[type][key] = {};
      }
      const values = attributes[key];
      if (isArray(values)) {
        values.forEach((value) => {
          if (!isEmpty(value)) {
            acc[type][key][value] = value;
          }
        });
      } else if (!isEmpty(values)) {
        acc[type][key][values] = values;
      }
    });
  };

  const getAttributeValues = useCallback((list) => {
    const processPhases = (acc, phases) => {
      if (isEmpty(phases)) return;

      phases.forEach((phase) => {
        if (!isEmpty(phase.attributes)) {
          addAttributeValues(acc, phase.attributes, 'phase');
        }

        if (!isEmpty(phase.actions)) {
          phase.actions.forEach((action) => {
            if (!isEmpty(action.attributes)) {
              addAttributeValues(acc, action.attributes, 'action');
            }

            if (!isEmpty(action.records)) {
              action.records.forEach((record) => {
                if (!isEmpty(record.attributes)) {
                  addAttributeValues(acc, record.attributes, 'record');
                }
              });
            }
          });
        }
      });
    };

    return list.reduce(
      (acc, item) => {
        if (!isEmpty(item.attributes)) {
          addAttributeValues(acc, item.attributes, 'function');
        }

        if (!isEmpty(item.phases)) {
          processPhases(acc, item.phases);
        }

        return acc;
      },
      {
        action: {},
        function: {},
        phase: {},
        record: {},
      },
    );
  }, []);

  const getItemErrors = (phases, attrTypes) => {
    return keys(phases).reduce((acc, phaseId) => {
      const phase = phases[phaseId];

      const phaseErrors = validatePhase(phase, attrTypes);
      if (!isEmpty(phaseErrors)) {
        acc[phaseId] = { attributes: phaseErrors };
      }

      if (!isEmpty(phase.actions)) {
        const actionsReduced = keys(phase.actions).reduce((actionAcc, actionId) => {
          const action = phase.actions[actionId];

          const actionErrors = validateAction(action, attrTypes);
          if (!isEmpty(actionErrors)) {
            actionAcc[actionId] = { attributes: actionErrors };
          }

          if (!isEmpty(action.records)) {
            const recordsReduced = keys(action.records).reduce((recordAcc, recordId) => {
              const record = action.records[recordId];

              const recordErrors = validateRecord(record, attrTypes);
              if (!isEmpty(recordErrors)) {
                recordAcc[recordId] = { attributes: recordErrors };
              }

              return recordAcc;
            }, {});

            if (!isEmpty(recordsReduced)) {
              if (!actionAcc[actionId]) {
                actionAcc[actionId] = {};
              }
              actionAcc[actionId].records = recordsReduced;
            }
          }

          return actionAcc;
        }, {});

        if (!isEmpty(actionsReduced)) {
          if (!acc[phaseId]) {
            acc[phaseId] = {};
          }
          acc[phaseId].actions = actionsReduced;
        }
      }

      return acc;
    }, {});
  };

  const validateChangedItem = (item, changed) => {
    const clonedItem = cloneDeep(item);
    const changedItem = merge(clonedItem, changed);
    const functionErrors = validateTOS(changedItem, attributeTypes);

    const errors = {};

    if (!isEmpty(functionErrors)) {
      errors.function = { attributes: functionErrors.attributes };
    }

    const { phases } = changedItem;

    if (!isEmpty(phases)) {
      if (!isArray(phases)) {
        errors.phases = getItemErrors(
          mapKeys(phases, (value, key) => key),
          attributeTypes,
        );
      } else if (changed?.phases) {
        errors.phases = getItemErrors(
          mapKeys(changed.phases, (value, key) => key),
          attributeTypes,
        );
      }
    }

    return errors;
  };

  const isMatch = (value, other, isEndsWith, isStartsWith, equals) => {
    return (
      (isStartsWith && isEndsWith && includes(value, other)) ||
      (isStartsWith && startsWith(value, other)) ||
      (isEndsWith && endsWith(value, other)) ||
      equals === isEqual(value, other)
    );
  };

  const matchesAll = (attributes, searchAttributes) => {
    return every(keys(searchAttributes), (attribute) => {
      const searchAttr = searchAttributes[attribute];
      return attributes?.[attribute] !== undefined
        ? isMatch(
            attributes[attribute],
            searchAttr.value,
            searchAttr.isEndsWith,
            searchAttr.isStartsWith,
            searchAttr.equals,
          )
        : false;
    });
  };

  const compareNew = (item, searchTerm) => {
    const paths = [];
    const hits = [];
    if (item.attributes && matchesAll(item.attributes, searchTerm.attributes)) {
      paths.push(['Käsittelyprosessi', item.name || '']);
      hits.push({
        path: ['Käsittelyprosessi'],
        name: 'attributes',
      });
    }
    return !isEmpty(hits) ? { hits, paths } : null;
  };

  const onConvert = (newConversion) => {
    const items = {};
    let valid = true;

    filter(searchResults, (result) => result.selected).forEach((result) => {
      const changed = {};
      let isChanged = false;
      if (newConversion.type === 'function') {
        if (
          find(BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES, {
            value: newConversion.attribute,
          })
        ) {
          changed[newConversion.attribute] = newConversion.value;
        } else {
          changed.attributes = {
            [newConversion.attribute]: newConversion.value,
          };
        }
        isChanged = true;
      } else if (!isEmpty(result.hit.phases)) {
        changed.phases = {};
        keys(result.hit.phases).forEach((phase) => {
          changed.phases[phase] = {};
          if (newConversion.type === 'phase') {
            changed.phases[phase].attributes = {
              [newConversion.attribute]: newConversion.value,
            };
            isChanged = true;
          } else if (!isEmpty(result.hit.phases[phase].actions)) {
            changed.phases[phase].actions = {};
            keys(result.hit.phases[phase].actions).forEach((action) => {
              changed.phases[phase].actions[action] = {};
              if (newConversion.type === 'action') {
                changed.phases[phase].actions[action] = {
                  attributes: {
                    [newConversion.attribute]: newConversion.value,
                  },
                };
                isChanged = true;
              } else if (!isEmpty(result.hit.phases[phase].actions[action].records)) {
                changed.phases[phase].actions[action].records = {};
                keys(result.hit.phases[phase].actions[action].records).forEach((record) => {
                  changed.phases[phase].actions[action].records[record] = {
                    attributes: {
                      [newConversion.attribute]: newConversion.value,
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
            if (newConversion.type === 'phase') {
              changed.phases[phase.id] = {
                attributes: {
                  [newConversion.attribute]: newConversion.value,
                },
              };
              isChanged = true;
            } else if (!isEmpty(phase.actions)) {
              changed.phases[phase.id] = { actions: {} };
              phase.actions.forEach((action) => {
                if (newConversion.type === 'action') {
                  changed.phases[phase.id].actions[action.id] = {
                    attributes: {
                      [newConversion.attribute]: newConversion.value,
                    },
                  };
                  isChanged = true;
                } else if (!isEmpty(action.records)) {
                  changed.phases[phase.id].actions[action.id] = {
                    records: {},
                  };
                  action.records.forEach((record) => {
                    if (newConversion.type === 'record') {
                      changed.phases[phase.id].actions[action.id].records[record.id] = {
                        attributes: {
                          [newConversion.attribute]: newConversion.value,
                        },
                      };
                      isChanged = true;
                    }
                  });
                }
              });
            }
          });
        }
      }
      if (isChanged) {
        const errors = validateChangedItem(result.item, changed);
        if (!isEmpty(errors)) {
          valid = false;
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

    setConversion(newConversion);
    setIsValid(valid);
    setPreview({
      conversion: [newConversion],
      items,
      searchTerms,
    });
    setPreviewItems(items);
  };

  const onSelectPreviewItem = (id) => {
    if (previewItems?.[id]) {
      setPreviewItems({
        ...previewItems,
        [id]: { ...previewItems?.[id], selected: !previewItems?.[id].selected },
      });
    }
    if (isFinalPreview && conversionItems && conversionItems[id]) {
      setConversionItems({
        ...conversionItems,
        [id]: {
          ...conversionItems[id],
          selected: !conversionItems[id].selected,
        },
      });
    }
  };

  const onConfirmConvert = () => {
    const selectedItems = pickBy(previewItems, (item) => item.selected);
    const mergedItems = conversionItems ? merge(conversionItems, selectedItems) : selectedItems;

    setConversion(null);
    setConversions({
      conversion: !isEmpty(conversions) ? [...conversions.conversion, ...preview.conversion] : preview.conversion,
      searchTerms: !isEmpty(conversions) ? [...conversions.searchTerms, ...preview.searchTerms] : preview.searchTerms,
    });
    setConversionItems(mergedItems);
    setIsDirty(true);
    setPreview(null);
    setPreviewItems(null);
    setSearchResults([]);
    setSearchTerms([{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() }]);
  };

  const onCancel = () => {
    setConversions(null);
    setConversionItems(null);
    setIsDirty(false);
  };

  const onSave = () => {
    if (conversions) {
      const isErrors = some(
        keys(conversionItems),
        (id) => conversionItems[id].selected && !isEmpty(conversionItems[id].errors),
      );
      setIsSaving(true);
      setStateValue('draft');
      setIsValid(!isErrors);
    }
  };

  const onCancelSave = () => {
    setIsSaving(false);
  };

  const onConfirmSave = () => {
    if (conversions) {
      const description = conversions.conversion
        .map((conv) => `${getTypeName(conv.type)}: ${getAttributeName(conv.attribute)} = ${conv.value}`)
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
        state: stateValue,
      };
      dispatch(saveBulkUpdateThunk(bulkUpdate))
        .then(() => {
          setConversion(null);
          setConversions(null);
          setConversionItems(null);
          setIsDirty(false);
          setPreview(null);
          setPreviewItems(null);
          setSearchResults([]);
          setSearchTerms([{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: new Date().getTime() }]);
          navigate('/bulk');
          dispatch(fetchNavigationThunk({ includeRelated: true }));
          return displayMessage({
            title: 'Massamuutos',
            body: 'Massamuutos tallennettu!',
          });
        })
        .catch((err) =>
          displayMessage(
            {
              title: 'Virhe',
              body: `"${err.message}"`,
            },
            { type: 'error' },
          ),
        );
    }
  };

  const onChangeState = (state) => {
    setStateValue(state.value);
  };

  const onPreview = () => {
    setPreview(conversions);
    setPreviewItems(conversionItems);
    setIsFinalPreview(true);
  };

  const onClosePreview = () => {
    setPreview(null);
    setPreviewItems(null);
    setIsFinalPreview(false);
  };

  const onSearch = (newSearchTerms) => {
    const combinedSearchTerms = newSearchTerms.reduce(
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
        return acc;
      },
      {
        action: { all: false, attributes: {} },
        function: { attributes: {} },
        phase: { all: false, attributes: {} },
        record: { all: false, attributes: {} },
      },
    );

    const newSearchResults = itemList.reduce((acc, item) => {
      const result = compareNew(item, combinedSearchTerms.function);
      if (result) {
        acc.push({
          item,
          hit: { attributes: combinedSearchTerms.function.attributes },
          paths: result.paths,
          hits: result.hits,
          selected: false,
        });
      } else if (!isEmpty(item.phases)) {
        item.phases.forEach((phase) => {
          if (!isEmpty(phase.attributes) && matchesAll(phase.attributes, combinedSearchTerms.phase.attributes)) {
            acc.push({
              item,
              hit: {
                phases: {
                  [phase.id]: { attributes: combinedSearchTerms.phase.attributes },
                },
              },
              paths: [[phase.name, 'Käsittelyvaiheen tiedot']],
              hits: [
                {
                  path: [phase.name || PATH_EMPTY_NAME_REPLACEMENT],
                  name: 'attributes',
                },
              ],
              selected: false,
            });
          } else if (!isEmpty(phase.actions)) {
            phase.actions.forEach((action) => {
              if (!isEmpty(action.attributes) && matchesAll(action.attributes, combinedSearchTerms.action.attributes)) {
                acc.push({
                  item,
                  hit: {
                    phases: {
                      [phase.id]: {
                        actions: {
                          [action.id]: { attributes: combinedSearchTerms.action.attributes },
                        },
                      },
                    },
                  },
                  paths: [[phase.name, action.name, 'Toimenpiteen tiedot']],
                  hits: [
                    {
                      path: [phase.name || PATH_EMPTY_NAME_REPLACEMENT, action.name || PATH_EMPTY_NAME_REPLACEMENT],
                      name: 'attributes',
                    },
                  ],
                  selected: false,
                });
              } else if (!isEmpty(action.records)) {
                action.records.forEach((record) => {
                  if (
                    !isEmpty(record.attributes) &&
                    matchesAll(record.attributes, combinedSearchTerms.record.attributes)
                  ) {
                    acc.push({
                      item,
                      hit: {
                        phases: {
                          [phase.id]: {
                            actions: {
                              [action.id]: {
                                records: {
                                  [record.id]: { attributes: combinedSearchTerms.record.attributes },
                                },
                              },
                            },
                          },
                        },
                      },
                      paths: [[phase.name, action.name, record.name]],
                      hits: [
                        {
                          path: [
                            phase.name || PATH_EMPTY_NAME_REPLACEMENT,
                            action.name || PATH_EMPTY_NAME_REPLACEMENT,
                            record.name || PATH_EMPTY_NAME_REPLACEMENT,
                          ],
                          name: 'attributes',
                        },
                      ],
                      selected: false,
                    });
                  }
                });
              }
            });
          }
        });
      }
      return acc;
    }, []);

    const newSearchResultHits = newSearchResults.reduce(
      (acc, result) => {
        if (!isEmpty(result.hit.phases)) {
          acc.phases += 1;
          keys(result.hit.phases).forEach((phase) => {
            if (!isEmpty(result.hit.phases[phase].actions)) {
              acc.actions += 1;
              keys(result.hit.phases[phase].actions).forEach((action) => {
                if (!isEmpty(result.hit.phases[phase].actions[action].records)) {
                  acc.records += keys(result.hit.phases[phase].actions[action].records).length;
                }
              });
            }
          });
        }
        return acc;
      },
      { phases: 0, actions: 0, records: 0 },
    );

    setSearchResults(newSearchResults);
    setSearchResultHits(newSearchResultHits);
    setSearchTerms(newSearchTerms);
  };

  const onSelectAllSearchResults = (selected) => {
    setSearchResults(searchResults.map((result) => ({ ...result, selected })));
  };

  const onSelectSearchResult = (index, selected) => {
    const searchResult = searchResults[index];
    const start = slice(searchResults, 0, index);
    const end = index + 1 < searchResults.length ? slice(searchResults, index + 1, searchResults.length) : [];
    setSearchResults([...start, { ...searchResult, selected }, ...end]);
  };

  const resetSearch = () => {
    setSearchResults([]);
  };

  useEffect(() => {
    dispatch(fetchNavigationThunk({ includeRelated: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isFetching && items) {
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
      const newItemList = flattenItems(items);
      const newAttributeValues = getAttributeValues(newItemList);
      setAttributeValues(newAttributeValues);
      setItemList(newItemList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isFetching]);

  if (!isEmpty(preview) && previewItems) {
    return (
      <Preview
        attributeTypes={attributeTypes}
        conversion={preview.conversion}
        getAttributeName={getAttributeName}
        getTypeName={getTypeName}
        isFinalPreview={isFinalPreview}
        items={previewItems}
        onClose={onClosePreview}
        onConfirm={onConfirmConvert}
        onSelect={onSelectPreviewItem}
      />
    );
  }

  const isSelectedResults = searchResults.filter((result) => result.selected).length > 0;
  const selectedCount = filter(conversionItems, { selected: true }).length;

  return (
    <div className='bulk-update-create'>
      <RouterPrompt when={isDirty} onOK={() => true} onCancel={() => false} />
      <div className='col-xs-12'>
        <Link className='btn btn-link' to='/bulk'>
          <i className='fa-solid fa-angle-left' /> Takaisin
        </Link>
      </div>
      <div className='col-xs-9 bulk-update-create-search'>
        <SearchTerms
          attributeTypes={attributeTypes}
          attributeValues={attributeValues}
          onSearch={onSearch}
          resetSearchResults={resetSearch}
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
                onConvert={onConvert}
              />
            )}
          </div>
        </IsAllowed>
        {!isEmpty(searchResults) && (
          <SearchResults
            hits={searchResultHits}
            onSelect={onSelectSearchResult}
            onSelectAll={onSelectAllSearchResults}
            searchResults={searchResults}
          />
        )}
      </div>
      <div className='col-xs-3 bulk-update-create-side-content'>
        <IsAllowed to={CHANGE_BULKUPDATE}>
          <div className='bulk-update-create-actions'>
            <button type='button' className='btn btn-primary' disabled={isEmpty(conversions)} onClick={onSave}>
              Tallenna
            </button>
            <button type='button' className='btn btn-default' disabled={isEmpty(conversions)} onClick={onCancel}>
              Palauta
            </button>
            <button type='button' className='btn btn-default' disabled={isEmpty(conversions)} onClick={onPreview}>
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
              {`${getTypeName(c.type)}: ${getAttributeName(c.attribute)} = ${c.value}`}
            </p>
          ))}
        {isSaving && !isEmpty(conversions) && (
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
                    value={statusFilters.find(({ value }) => value === stateValue)}
                    onChange={onChangeState}
                    autoFocus
                    options={statusFilters}
                    placeholder='Valitse massamuutospaketin tila...'
                  />
                </div>
                <div>
                  <button
                    type='button'
                    className='btn btn-primary'
                    disabled={!isValid && stateValue !== 'draft'}
                    onClick={onConfirmSave}
                  >
                    Tallenna massamuutos
                  </button>
                  <button type='button' className='btn btn-default' onClick={onCancelSave}>
                    Peruuta
                  </button>
                </div>
              </div>
            }
            closePopup={onCancelSave}
          />
        )}
      </div>
    </div>
  );
};

export default BulkCreateView;
