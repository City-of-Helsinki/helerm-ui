/* eslint-disable no-param-reassign */
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import { cloneDeep, every, find, isEmpty, keys, omit, split } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import {
  APPROVE_BULKUPDATE,
  DELETE_BULKUPDATE,
  BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES,
} from '../../../constants';
import { formatDateTime, getStatusLabel, displayMessage } from '../../../utils/helpers';
import IsAllowed from '../../../components/IsAllowed/IsAllowed';
import Popup from '../../../components/Popup';
import './BulkView.scss';
import { getDisplayLabelForAttribute } from '../../../utils/attributeHelper';
import {
  approveBulkUpdateThunk,
  clearSelectedBulkUpdate,
  deleteBulkUpdateThunk,
  fetchBulkUpdateThunk,
  isUpdatingSelector,
  selectedBulkSelector,
  updateBulkUpdateThunk,
} from '../../../store/reducers/bulk';
import { fetchNavigationThunk, includeRelatedSelector, isFetchingSelector } from '../../../store/reducers/navigation';
import { attributeTypesSelector } from '../../../store/reducers/ui';

const BulkView = () => {
  const dispatch = useDispatch();
  const selectedBulk = useSelector(selectedBulkSelector);
  const items = useSelector((state) => (state.navigation.includeRelated ? state.navigation.items : []));
  const itemsIncludeRelated = useSelector(includeRelatedSelector);
  const isFetchingNavigation = useSelector(isFetchingSelector);
  const isUpdating = useSelector(isUpdatingSelector);
  const attributeTypes = useSelector(attributeTypesSelector);

  const navigate = useNavigate();
  const params = useParams();

  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [itemList, setItemList] = useState([]);
  const [itemToRemove, setItemToRemove] = useState(null);

  const getAttributeName = (key) => attributeTypes?.[key]?.name || key;

  const parseItemList = (itemsData, bulk) => {
    const changedFunctions = keys(bulk.changes).reduce((acc, functionVersion) => {
      const versionSplitted = split(functionVersion, '__');
      if (versionSplitted && versionSplitted.length === 2) {
        acc[versionSplitted[0]] = {
          ...bulk.changes[functionVersion],
          version: versionSplitted[1],
        };
      }
      return acc;
    }, {});

    const flattenItems = (obj) => {
      const array = Array.isArray(obj) ? obj : [obj];
      return array.reduce((acc, item) => {
        if (item.children) {
          acc = acc.concat(flattenItems(item.children));
        } else if (item.function && changedFunctions[item.function]) {
          const clonedItem = cloneDeep(item);
          clonedItem.attributes = clonedItem.function_attributes;
          clonedItem.valid_from = clonedItem.function_valid_from;
          clonedItem.valid_to = clonedItem.function_valid_to;
          acc.push({
            id: item.function,
            item: clonedItem,
            changes: changedFunctions[item.function],
          });
        }
        return acc;
      }, []);
    };

    const newItemList = flattenItems(itemsData);
    const newIsValid = validateBulkUpdate(newItemList);
    setIsValid(newIsValid);
    setItemList(newItemList);
  };

  const validateBulkUpdate = (list) => {
    return !isEmpty(list)
      ? every(list, (listItem) => {
          const { changes, item } = listItem;
          if (!isEmpty(changes.phases)) {
            return every(keys(changes.phases), (phaseId) => {
              const phaseChange = changes.phases[phaseId];
              const phase = find(item.phases, { id: phaseId });
              if (!phase) {
                return false;
              }
              if (phase && !isEmpty(phaseChange.actions)) {
                // eslint-disable-next-line sonarjs/no-nested-functions
                return every(keys(phaseChange.actions), (actionId) => {
                  const actionChange = phaseChange.actions[actionId];
                  const action = phase.actions ? find(phase.actions, { id: actionId }) : null;
                  if (!action) {
                    return false;
                  }
                  if (action && !isEmpty(actionChange.records)) {
                    return every(keys(actionChange.records), (recordId) => {
                      const record = action.records ? find(action.records, { id: recordId }) : null;
                      return !!record;
                    });
                  }
                  return true;
                });
              }
              return true;
            });
          }
          return true;
        })
      : false;
  };

  const onApprove = () => {
    if (!isEmpty(selectedBulk)) {
      setIsApproving(true);
    }
  };

  const onConfirmApprove = () => {
    setIsApproving(false);
    dispatch(approveBulkUpdateThunk(selectedBulk.id))
      .then(() => {
        navigate('/bulk');
        return displayMessage({
          title: 'Massamuutos',
          body: 'Massamuutos hyväksytty!',
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
  };

  const onCancel = () => {
    setIsApproving(false);
    setIsDeleting(false);
    setIsRejecting(false);
    setItemToRemove(null);
  };

  const onDelete = () => {
    if (!isEmpty(selectedBulk)) {
      setIsDeleting(true);
    }
  };

  const onConfirmDelete = () => {
    setIsDeleting(false);
    dispatch(deleteBulkUpdateThunk(selectedBulk.id))
      .then(() => {
        setItemList([]);
        navigate('/bulk');
        return displayMessage({
          title: 'Massamuutos',
          body: 'Massamuutos poistettu!',
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
  };

  const onReject = () => {
    if (!isEmpty(selectedBulk)) {
      setIsRejecting(true);
    }
  };

  const onConfirmReject = () => {
    setIsRejecting(false);
  };

  const onRemoveBulkItem = (id) => {
    const itemToBeRemoved = find(itemList, { id });
    if (itemToBeRemoved) {
      setItemToRemove(itemToBeRemoved);
    }
  };

  const onConfirmRemoveBulkItem = () => {
    setItemToRemove(null);
    if (
      itemToRemove &&
      selectedBulk.changes &&
      selectedBulk.changes[`${itemToRemove.id}__${itemToRemove.changes.version}`]
    ) {
      const changes = omit(selectedBulk.changes, [`${itemToRemove.id}__${itemToRemove.changes.version}`]);
      dispatch(updateBulkUpdateThunk({ id: selectedBulk.id, bulkUpdate: { changes } }))
        .then(() =>
          displayMessage({
            title: 'Massamuutos',
            body: 'Massamuutos päivitetty!',
          }),
        )
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

  const renderItemChanges = (changedItem) => {
    const { changes, item } = changedItem;
    const changesEl = [];
    let isError = false;

    BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES.forEach((attribute) => {
      if (changes[attribute.value]) {
        const currentValue = item[attribute.value] || ' ';
        changesEl.push(
          <h4 key={`function_${item.id}_attribute_${attribute.value}`}>
            {attribute.label}: <span>({currentValue})</span> {changes[attribute.value]}
          </h4>,
        );
      }
    });

    if (!isEmpty(changes.attributes)) {
      keys(changes.attributes).forEach((attribute) => {
        const currentValue = item.attributes[attribute] || ' ';
        changesEl.push(
          <h4 key={`function_${item.id}_attribute_${attribute}`}>
            {getAttributeName(attribute)}:{' '}
            <span>
              (
              {getDisplayLabelForAttribute({
                attributeValue: currentValue,
                identifier: attribute,
              })}
              )
            </span>{' '}
            {getDisplayLabelForAttribute({
              attributeValue: changes.attributes[attribute],
              identifier: attribute,
            })}
          </h4>,
        );
      });
    }

    if (!isEmpty(changes.phases)) {
      keys(changes.phases).forEach((phase) => {
        const currentPhase = find(item.phases, { id: phase });
        if (!currentPhase) {
          isError = true;
          changesEl.push(
            <h5 className='bulk-view-item-phase-error' key={`phase_${phase}_error`}>
              <i className='fa-solid fa-triangle-exclamation' />
              Käsittelyvaihetta {phase} ei löytynyt, massamuutosta ei voida tehdä tälle käsittelyprosessille
            </h5>,
          );
        }

        if (currentPhase && !isEmpty(changes.phases[phase].attributes)) {
          keys(changes.phases[phase].attributes).forEach((attribute) => {
            const currentValue = currentPhase?.attributes?.[attribute] || ' ';
            changesEl.push(
              <h4 key={`phase_${phase}_attr_${attribute}`}>
                {currentPhase.name || ''} &gt;
                {getAttributeName(attribute)}:{' '}
                <span>
                  (
                  {getDisplayLabelForAttribute({
                    attributeValue: currentValue,
                    identifier: attribute,
                  })}
                  )
                </span>{' '}
                {getDisplayLabelForAttribute({
                  attributeValue: changes.phases[phase].attributes[attribute],
                  identifier: attribute,
                })}
              </h4>,
            );
          });
        }

        if (currentPhase && !isEmpty(changes.phases[phase].actions)) {
          keys(changes.phases[phase].actions).forEach((action) => {
            const currentAction = find(currentPhase.actions, { id: action });
            if (!currentAction) {
              isError = true;
              changesEl.push(
                <h5 className='bulk-view-item-action-error' key={`action_${action}_error`}>
                  <i className='fa-solid fa-triangle-exclamation' />
                  Toimenpidettä {action} ei löytynyt, massamuutosta ei voida tehdä tälle käsittelyprosessille
                </h5>,
              );
            }

            if (currentAction && !isEmpty(changes.phases[phase].actions[action].attributes)) {
              // eslint-disable-next-line sonarjs/no-nested-functions
              keys(changes.phases[phase].actions[action].attributes).forEach((attribute) => {
                const currentValue = currentAction?.attributes?.[attribute] || ' ';
                changesEl.push(
                  <h4 key={`action_${action}_attr_${attribute}`}>
                    {currentPhase.name || ''} &gt;
                    {currentAction.name || ''} &gt;
                    {getAttributeName(attribute)}:{' '}
                    <span>
                      (
                      {getDisplayLabelForAttribute({
                        attributeValue: currentValue,
                        identifier: attribute,
                      })}
                      )
                    </span>{' '}
                    {getDisplayLabelForAttribute({
                      attributeValue: changes.phases[phase].actions[action].attributes[attribute],
                      identifier: attribute,
                    })}
                  </h4>,
                );
              });
            }

            if (currentAction && !isEmpty(changes.phases[phase].actions[action].records)) {
              // eslint-disable-next-line sonarjs/no-nested-functions
              keys(changes.phases[phase].actions[action].records).forEach((record) => {
                const currentRecord = find(currentAction.records, {
                  id: record,
                });
                if (!currentRecord) {
                  isError = true;
                  changesEl.push(
                    <h5 className='bulk-view-item-record-error' key={`record_${record}_error`}>
                      <i className='fa-solid fa-triangle-exclamation' />
                      Asiakirjaa {record} ei löytynyt, massamuutosta ei voida tehdä tälle käsittelyprosessille
                    </h5>,
                  );
                }

                if (currentRecord && !isEmpty(changes.phases[phase].actions[action].records[record].attributes)) {
                  keys(changes.phases[phase].actions[action].records[record].attributes).forEach((attribute) => {
                    const currentValue = currentRecord?.attributes?.[attribute] || ' ';
                    changesEl.push(
                      <h4 key={`record_${record}_attr_${attribute}`}>
                        {currentPhase.name || ''} &gt;
                        {currentAction.name || ''} &gt;
                        {currentRecord.name || ''} &gt;
                        {getAttributeName(attribute)}:{' '}
                        <span>
                          (
                          {getDisplayLabelForAttribute({
                            attributeValue: currentValue,
                            identifier: attribute,
                          })}
                          )
                        </span>{' '}
                        {getDisplayLabelForAttribute({
                          attributeValue: changes.phases[phase].actions[action].records[record].attributes[attribute],
                          identifier: attribute,
                        })}
                      </h4>,
                    );
                  });
                }
              });
            }
          });
        }
      });
    }

    return (
      <div className='bulk-view-item' key={item.id}>
        <div className='bulk-view-item-info'>
          <span className='bulk-view-item-path'>{item.path.join(' > ')}</span>
          <h4 className='bulk-view-item-name'>{item.name}</h4>
          <div
            className={classnames('bulk-view-item-changes', {
              'bulk-view-item-errors': isError,
            })}
          >
            {changesEl}
          </div>
        </div>
        <div className='bulk-view-item-state'>
          <h4>{getStatusLabel(item.function_state)}</h4>
        </div>
        <div className='bulk-view-item-action'>
          <button type='button' className='btn btn-danger' onClick={() => onRemoveBulkItem(item.function)}>
            Poista
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (params.id) {
      dispatch(fetchBulkUpdateThunk(params.id));
    }
    if (isEmpty(items) || !itemsIncludeRelated) {
      dispatch(fetchNavigationThunk({ includeRelated: true }));
    } else if (selectedBulk) {
      parseItemList(items, selectedBulk);
    }

    return () => {
      dispatch(clearSelectedBulkUpdate());
    };
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isEmpty(items) && !isEmpty(selectedBulk) && !isFetchingNavigation) {
      parseItemList(items, selectedBulk);
    }
  }, [items, selectedBulk, isFetchingNavigation, isUpdating]); // eslint-disable-line react-hooks/exhaustive-deps

  const isApproved = selectedBulk ? selectedBulk.is_approved : false;

  return (
    <div className='bulk-view'>
      <div className='bulk-view-back'>
        <Link className='btn btn-link' to='/bulk'>
          <i className='fa-solid fa-angle-left' /> Takaisin
        </Link>
      </div>
      <div>
        <h3>Massamuutos esikatselu</h3>
      </div>
      {!isValid && !isEmpty(itemList) && !isFetchingNavigation && (
        <div className='alert alert-danger'>
          <i className='fa-solid fa-triangle-exclamation' /> Massamuutospaketissa on käsittelyprosesseja, joita ei voida
          varmistaa. Massamuutospakettia ei voida hyväksyä.
        </div>
      )}
      {selectedBulk && (
        <div>
          <p>Paketti ID: {selectedBulk.id}</p>
          <p>Luotu: {formatDateTime(selectedBulk.created_at)}</p>
          <p>Muutettu: {formatDateTime(selectedBulk.modified_at)}</p>
          <p>Muokkaaja: {selectedBulk.modified_by}</p>
          <p>Käsittelyprosessin tila muutoksen jälkeen: {getStatusLabel(selectedBulk.state)}</p>
          <p>Muutokset: {selectedBulk.description}</p>
          <p>Hyväksytty: {selectedBulk.is_approved ? 'Kyllä' : 'Ei'}</p>
        </div>
      )}
      {selectedBulk && (
        <div className='bulk-view-changes-header'>
          <div className='bulk-view-changes'>
            <h4>Tehdyt muutokset ({keys(selectedBulk.changes).length})</h4>
          </div>
          <div className='bulk-view-actions'>
            <IsAllowed to={DELETE_BULKUPDATE}>
              <button type='button' className='btn btn-danger' disabled={!selectedBulk} onClick={onDelete}>
                Poista
              </button>
            </IsAllowed>
            <IsAllowed to={APPROVE_BULKUPDATE}>
              <button type='button' className='btn btn-default' disabled={isApproved} onClick={onReject}>
                Hylkää
              </button>
            </IsAllowed>
            <IsAllowed to={APPROVE_BULKUPDATE}>
              <button type='button' className='btn btn-primary' disabled={isApproved || !isValid} onClick={onApprove}>
                Hyväksy
              </button>
            </IsAllowed>
          </div>
        </div>
      )}
      {!isFetchingNavigation && (
        <div className='bulk-view-items'>{itemList.map((changedItem) => renderItemChanges(changedItem))}</div>
      )}
      {isApproving && (
        <Popup
          content={
            <div>
              <h3>Hyväksytäänkö massamuutos?</h3>
              <div>
                <button type='button' className='btn btn-primary' onClick={onConfirmApprove}>
                  Hyväksy
                </button>
                <button type='button' className='btn btn-default' onClick={onCancel}>
                  Peruuta
                </button>
              </div>
            </div>
          }
          closePopup={onCancel}
        />
      )}
      {isDeleting && (
        <Popup
          content={
            <div>
              <h3>Poistetaanko massamuutos?</h3>
              <div>
                <button type='button' className='btn btn-danger' onClick={onConfirmDelete}>
                  Poista
                </button>
                <button type='button' className='btn btn-default' onClick={onCancel}>
                  Peruuta
                </button>
              </div>
            </div>
          }
          closePopup={onCancel}
        />
      )}
      {isRejecting && (
        <Popup
          content={
            <div>
              <h3>Hylätäänkö massamuutos?</h3>
              <p>
                <strong>HUOM! Hylkäys ei vielä tee mitään.</strong>
              </p>
              <div>
                <button type='button' className='btn btn-danger' onClick={onConfirmReject}>
                  Hylkää
                </button>
                <button type='button' className='btn btn-default' onClick={onCancel}>
                  Peruuta
                </button>
              </div>
            </div>
          }
          closePopup={onCancel}
        />
      )}
      {itemToRemove && (
        <Popup
          content={
            <div>
              <h4>
                Poistetaanko käsittelyprosessi {itemToRemove.item.code} {itemToRemove.item.name} massamuutoksesta?
              </h4>
              <div>
                <button type='button' className='btn btn-danger' onClick={onConfirmRemoveBulkItem}>
                  Poista
                </button>
                <button type='button' className='btn btn-default' onClick={onCancel}>
                  Peruuta
                </button>
              </div>
            </div>
          }
          closePopup={onCancel}
        />
      )}
    </div>
  );
};

export default BulkView;
