/* eslint-disable no-param-reassign */
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import { cloneDeep, every, find, isEmpty, keys, omit, split } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import {
  APPROVE_BULKUPDATE,
  DELETE_BULKUPDATE,
  BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES,
} from '../../../constants';
import { formatDateTime, getStatusLabel } from '../../../utils/helpers';
import { useNotificationsContext } from '../../../components/NotificationsContext/hooks/useNotificationsContext';
import IsAllowed from '../../../components/IsAllowed/IsAllowed';
import Popup from '../../../components/Popup';
import './BulkView.scss';
import { getDisplayLabelForAttribute } from '../../../utils/attributeHelper';
import useAuth from '../../../hooks/useAuth';
import {
  approveBulkUpdateThunk,
  clearSelectedBulkUpdate,
  deleteBulkUpdateThunk,
  fetchBulkUpdateThunk,
  isUpdatingSelector,
  selectedBulkSelector,
  updateBulkUpdateThunk,
} from '../../../store/reducers/bulk';
import {
  fetchNavigationThunk,
  includeRelatedSelector,
  isFetchingSelector,
  navigationItemsSelector,
} from '../../../store/reducers/navigation';
import { attributeTypesSelector } from '../../../store/reducers/ui';

// Named helpers (one nesting level each) replace the single deeply nested
// validateBulkUpdate chain flagged by javascript:S2004 (max 5 levels).
const validateActionRecords = (actionChange, action) =>
  isEmpty(actionChange.records) ||
  every(keys(actionChange.records), (recordId) => !!(action.records && find(action.records, { id: recordId })));

const validatePhaseActions = (phaseChange, phase) =>
  isEmpty(phaseChange.actions) ||
  every(keys(phaseChange.actions), (actionId) => {
    const actionChange = phaseChange.actions[actionId];
    const action = phase.actions ? find(phase.actions, { id: actionId }) : null;
    return !!action && validateActionRecords(actionChange, action);
  });

const validateItemPhases = (changes, item) =>
  isEmpty(changes.phases) ||
  every(keys(changes.phases), (phaseId) => {
    const phaseChange = changes.phases[phaseId];
    const phase = find(item.phases, { id: phaseId });
    return !!phase && validatePhaseActions(phaseChange, phase);
  });

const BulkView = () => {
  const dispatch = useDispatch();
  const selectedBulk = useSelector(selectedBulkSelector);
  const items = useSelector(navigationItemsSelector);
  const itemsIncludeRelated = useSelector(includeRelatedSelector);
  const isFetchingNavigation = useSelector(isFetchingSelector);
  const isUpdating = useSelector(isUpdatingSelector);
  const attributeTypes = useSelector(attributeTypesSelector);
  const { getApiToken } = useAuth();
  const { addNotification } = useNotificationsContext();

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

  const validateBulkUpdate = (list) =>
    !isEmpty(list) ? every(list, ({ changes, item }) => validateItemPhases(changes, item)) : false;

  const onApprove = () => {
    if (!isEmpty(selectedBulk)) {
      setIsApproving(true);
    }
  };

  const onConfirmApprove = () => {
    setIsApproving(false);
    dispatch(approveBulkUpdateThunk({ id: selectedBulk.id, token: getApiToken() }))
      .then(() => {
        navigate('/bulk');
        return addNotification({
          label: 'Massamuutos',
          children: 'Massamuutos hyväksytty!',
          type: 'success',
        });
      })
      .catch((err) =>
        addNotification({
          label: 'Virhe',
          children: `"${err.message}"`,
          type: 'error',
        }),
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
    dispatch(deleteBulkUpdateThunk({ id: selectedBulk.id, token: getApiToken() }))
      .then(() => {
        setItemList([]);
        navigate('/bulk');
        return addNotification({
          label: 'Massamuutos',
          children: 'Massamuutos poistettu!',
          type: 'success',
        });
      })
      .catch((err) =>
        addNotification({
          label: 'Virhe',
          children: `"${err.message}"`,
          type: 'error',
        }),
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
      dispatch(updateBulkUpdateThunk({ id: selectedBulk.id, bulkUpdate: { changes }, token: getApiToken() }))
        .then(() =>
          addNotification({
            label: 'Massamuutos',
            children: 'Massamuutos päivitetty!',
            type: 'success',
          }),
        )
        .catch((err) =>
          addNotification({
            label: 'Virhe',
            children: `"${err.message}"`,
            type: 'error',
          }),
        );
    }
  };

  const renderAttributeChangeHeading = (keySuffix, labelPrefix, attribute, currentValue, newValue) => (
    <h4 key={keySuffix}>
      {labelPrefix}
      {getAttributeName(attribute)}:{' '}
      <span>({getDisplayLabelForAttribute({ attributeValue: currentValue, identifier: attribute })})</span>{' '}
      {getDisplayLabelForAttribute({ attributeValue: newValue, identifier: attribute })}
    </h4>
  );

  const renderAttributeChanges = (attributesChange, currentAttributes, keyPrefix, labelPrefix) =>
    keys(attributesChange).map((attribute) =>
      renderAttributeChangeHeading(
        `${keyPrefix}_attr_${attribute}`,
        labelPrefix,
        attribute,
        currentAttributes?.[attribute] || ' ',
        attributesChange[attribute],
      ),
    );

  const renderRecordChanges = (recordsChange, currentAction, labelPrefix) => {
    const elements = [];
    let hasError = false;

    keys(recordsChange).forEach((record) => {
      const currentRecord = currentAction.records ? find(currentAction.records, { id: record }) : null;
      if (!currentRecord) {
        hasError = true;
        elements.push(
          <h5 className='bulk-view-item-record-error' key={`record_${record}_error`}>
            <i className='fa-solid fa-triangle-exclamation' />
            Asiakirjaa {record} ei löytynyt, massamuutosta ei voida tehdä tälle käsittelyprosessille
          </h5>,
        );
        return;
      }

      if (!isEmpty(recordsChange[record].attributes)) {
        elements.push(
          ...renderAttributeChanges(
            recordsChange[record].attributes,
            currentRecord.attributes,
            `record_${record}`,
            `${labelPrefix}${currentRecord.name || ''} > `,
          ),
        );
      }
    });

    return { elements, hasError };
  };

  const renderActionChanges = (actionsChange, currentPhase, labelPrefix) => {
    const elements = [];
    let hasError = false;

    keys(actionsChange).forEach((action) => {
      const currentAction = find(currentPhase.actions, { id: action });
      if (!currentAction) {
        hasError = true;
        elements.push(
          <h5 className='bulk-view-item-action-error' key={`action_${action}_error`}>
            <i className='fa-solid fa-triangle-exclamation' />
            Toimenpidettä {action} ei löytynyt, massamuutosta ei voida tehdä tälle käsittelyprosessille
          </h5>,
        );
        return;
      }

      const actionLabelPrefix = `${labelPrefix}${currentAction.name || ''} > `;

      if (!isEmpty(actionsChange[action].attributes)) {
        elements.push(
          ...renderAttributeChanges(
            actionsChange[action].attributes,
            currentAction.attributes,
            `action_${action}`,
            actionLabelPrefix,
          ),
        );
      }

      if (!isEmpty(actionsChange[action].records)) {
        const { elements: recordElements, hasError: recordsHadError } = renderRecordChanges(
          actionsChange[action].records,
          currentAction,
          actionLabelPrefix,
        );
        elements.push(...recordElements);
        hasError = hasError || recordsHadError;
      }
    });

    return { elements, hasError };
  };

  const renderPhaseChanges = (phasesChange, item) => {
    const elements = [];
    let hasError = false;

    keys(phasesChange).forEach((phase) => {
      const currentPhase = find(item.phases, { id: phase });
      if (!currentPhase) {
        hasError = true;
        elements.push(
          <h5 className='bulk-view-item-phase-error' key={`phase_${phase}_error`}>
            <i className='fa-solid fa-triangle-exclamation' />
            Käsittelyvaihetta {phase} ei löytynyt, massamuutosta ei voida tehdä tälle käsittelyprosessille
          </h5>,
        );
        return;
      }

      const phaseLabelPrefix = `${currentPhase.name || ''} > `;

      if (!isEmpty(phasesChange[phase].attributes)) {
        elements.push(
          ...renderAttributeChanges(
            phasesChange[phase].attributes,
            currentPhase.attributes,
            `phase_${phase}`,
            phaseLabelPrefix,
          ),
        );
      }

      if (!isEmpty(phasesChange[phase].actions)) {
        const { elements: actionElements, hasError: actionsHadError } = renderActionChanges(
          phasesChange[phase].actions,
          currentPhase,
          phaseLabelPrefix,
        );
        elements.push(...actionElements);
        hasError = hasError || actionsHadError;
      }
    });

    return { elements, hasError };
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
      changesEl.push(...renderAttributeChanges(changes.attributes, item.attributes, `function_${item.id}`, ''));
    }

    if (!isEmpty(changes.phases)) {
      const { elements, hasError } = renderPhaseChanges(changes.phases, item);
      changesEl.push(...elements);
      isError = isError || hasError;
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
      const token = getApiToken();
      dispatch(fetchBulkUpdateThunk({ id: params.id, token }));
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
