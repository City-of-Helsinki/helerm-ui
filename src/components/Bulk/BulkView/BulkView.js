import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { cloneDeep, every, find, isEmpty, keys, omit, split } from 'lodash';

import {
  APPROVE_BULKUPDATE,
  DELETE_BULKUPDATE,
  BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES
} from '../../../constants';
import { formatDateTime, getStatusLabel } from '../../../utils/helpers';
import IsAllowed from '../../../components/IsAllowed/IsAllowed';
import Popup from '../../../components/Popup';
import './BulkView.scss';

export class BulkView extends React.Component {
  constructor(props) {
    super(props);

    this.onApprove = this.onApprove.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onConfirmApprove = this.onConfirmApprove.bind(this);
    this.onConfirmDelete = this.onConfirmDelete.bind(this);
    this.onConfirmReject = this.onConfirmReject.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onReject = this.onReject.bind(this);
    this.onRemoveBulkItem = this.onRemoveBulkItem.bind(this);
    this.onConfirmRemoveBulkItem = this.onConfirmRemoveBulkItem.bind(this);

    this.state = {
      isApproving: false,
      isDeleting: false,
      isRejecting: false,
      isValid: true,
      itemList: [],
      itemToRemove: null
    };
  }

  componentDidMount() {
    const {
      items,
      itemsIncludeRelated,
      match: { params },
      selectedBulk
    } = this.props;
    if (params.id) {
      this.props.fetchBulkUpdate(params.id);
    }
    if (isEmpty(items) || !itemsIncludeRelated) {
      this.props.fetchNavigation(true);
    } else if (selectedBulk) {
      this.parseItemList(items, selectedBulk);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      isFetchingNavigation: wasFetchingNavigation,
      isUpdating: wasUpdating,
      selectedBulk: prevSelectedBulk
    } = this.props;
    const { isFetchingNavigation, isUpdating, items, selectedBulk } = nextProps;
    if (
      !isEmpty(items) &&
      !isEmpty(selectedBulk) &&
      ((wasFetchingNavigation && !isFetchingNavigation) ||
        (wasUpdating && !isUpdating) ||
        !prevSelectedBulk)
    ) {
      this.parseItemList(items, selectedBulk);
    }
  }

  componentWillUnmount() {
    this.props.clearSelectedBulkUpdate();
  }

  onApprove() {
    const { selectedBulk } = this.props;
    if (!isEmpty(selectedBulk)) {
      this.setState({ isApproving: true });
    }
  }

  onConfirmApprove() {
    const { selectedBulk } = this.props;
    this.setState({ isApproving: false });
    this.props
      .approveBulkUpdate(selectedBulk.id)
      .then(() => {
        this.props.push('/bulk');
        return this.props.displayMessage({
          title: 'Massamuutos',
          body: 'Massamuutos hyväksytty!'
        });
      })
      .catch((err) => {
        return this.props.displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`
          },
          { type: 'error' }
        );
      });
  }

  onCancel() {
    this.setState({
      isApproving: false,
      isDeleting: false,
      isRejecting: false,
      itemToRemove: null
    });
  }

  onDelete() {
    const { selectedBulk } = this.props;
    if (!isEmpty(selectedBulk)) {
      this.setState({ isDeleting: true });
    }
  }

  onConfirmDelete() {
    const { selectedBulk } = this.props;
    this.setState({ isDeleting: false });
    this.props
      .deleteBulkUpdate(selectedBulk.id)
      .then(() => {
        this.setState({
          itemList: []
        });
        this.props.push('/bulk');
        return this.props.displayMessage({
          title: 'Massamuutos',
          body: 'Massamuutos poistettu!'
        });
      })
      .catch((err) => {
        return this.props.displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`
          },
          { type: 'error' }
        );
      });
  }

  onReject() {
    const { selectedBulk } = this.props;
    if (!isEmpty(selectedBulk)) {
      this.setState({ isRejecting: true });
    }
  }

  onConfirmReject() {
    this.setState({ isRejecting: false });
    // what happens on reject is still open
  }

  onRemoveBulkItem(id) {
    const { itemList } = this.state;
    const itemToRemove = find(itemList, { id });
    if (itemToRemove) {
      this.setState({ itemToRemove });
    }
  }

  onConfirmRemoveBulkItem() {
    const { selectedBulk } = this.props;
    const { itemToRemove } = this.state;
    this.setState({ itemToRemove: null });
    if (
      itemToRemove &&
      selectedBulk.changes &&
      selectedBulk.changes[
        `${itemToRemove.id}__${itemToRemove.changes.version}`
      ]
    ) {
      const changes = omit(selectedBulk.changes, [
        `${itemToRemove.id}__${itemToRemove.changes.version}`
      ]);
      this.props
        .updateBulkUpdate(selectedBulk.id, { changes })
        .then(() => {
          return this.props.displayMessage({
            title: 'Massamuutos',
            body: 'Massamuutos päivitetty!'
          });
        })
        .catch((err) => {
          return this.props.displayMessage(
            {
              title: 'Virhe',
              body: `"${err.message}"`
            },
            { type: 'error' }
          );
        });
    }
  }

  parseItemList(items, selectedBulk) {
    const changedFunctions = keys(selectedBulk.changes).reduce(
      (acc, functionVersion) => {
        const versionSplitted = split(functionVersion, '__');
        if (versionSplitted && versionSplitted.length === 2) {
          acc[versionSplitted[0]] = {
            ...selectedBulk.changes[functionVersion],
            version: versionSplitted[1]
          };
        }
        return acc;
      },
      {}
    );
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
            changes: changedFunctions[item.function]
          });
        }
        return acc;
      }, []);
    };
    const itemList = flattenItems(items);
    const isValid = this.validateBulkUpdate(itemList);
    this.setState({ isValid, itemList });
  }

  validateBulkUpdate(itemList) {
    const isValid = !isEmpty(itemList)
      ? every(itemList, (listItem) => {
          const { changes, item } = listItem;
          if (!isEmpty(changes.phases)) {
            return every(keys(changes.phases), (phaseId) => {
              const phaseChange = changes.phases[phaseId];
              const phase = find(item.phases, { id: phaseId });
              if (!phase) {
                return false;
              } else if (phase && !isEmpty(phaseChange.actions)) {
                return every(keys(phaseChange.actions), (actionId) => {
                  const actionChange = phaseChange.actions[actionId];
                  const action = phase.actions
                    ? find(phase.actions, { id: actionId })
                    : null;
                  if (!action) {
                    return false;
                  } else if (action && !isEmpty(actionChange.records)) {
                    return every(keys(actionChange.records), (recordId) => {
                      const record = action.records
                        ? find(action.records, { id: recordId })
                        : null;
                      if (!record) {
                        return false;
                      }
                      return true;
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
    return isValid;
  }

  renderItemChanges(changedItem) {
    const { getAttributeName } = this.props;
    const { changes, item } = changedItem;
    const changesEl = [];
    let isError = false;

    BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES.forEach((attribute) => {
      if (changes[attribute.value]) {
        const currentValue = item[attribute.value] || ' ';
        changesEl.push(
          <h4 key={`function_${item.id}_attribute_${attribute.value}`}>
            {attribute.label}: <span>({currentValue})</span>{' '}
            {changes[attribute.value]}
          </h4>
        );
      }
    });
    if (!isEmpty(changes.attributes)) {
      keys(changes.attributes).forEach((attribute) => {
        const currentValue = item.attributes[attribute] || ' ';
        changesEl.push(
          <h4 key={`function_${item.id}_attribute_${attribute}`}>
            {getAttributeName(attribute)}: <span>({currentValue})</span>{' '}
            {changes.attributes[attribute]}
          </h4>
        );
      });
    }
    if (!isEmpty(changes.phases)) {
      keys(changes.phases).forEach((phase) => {
        const currentPhase = find(item.phases, { id: phase });
        if (!currentPhase) {
          isError = true;
          changesEl.push(
            <h5
              className='bulk-view-item-phase-error'
              key={`phase_${phase}_error`}
            >
              <i className='fa fa-exclamation-triangle' />
              Käsittelyvaihetta {phase} ei löytynyt, massamuutosta ei voida
              tehdä tälle käsittelyprosessille
            </h5>
          );
        }
        if (currentPhase && !isEmpty(changes.phases[phase].attributes)) {
          keys(changes.phases[phase].attributes).forEach((attribute) => {
            const currentValue =
              (currentPhase.attributes && currentPhase.attributes[attribute]) ||
              ' ';
            changesEl.push(
              <h4 key={`phase_${phase}_attr_${attribute}`}>
                {currentPhase.name || ''} &gt;
                {getAttributeName(attribute)}: <span>({currentValue})</span>{' '}
                {changes.phases[phase].attributes[attribute]}
              </h4>
            );
          });
        }
        if (currentPhase && !isEmpty(changes.phases[phase].actions)) {
          keys(changes.phases[phase].actions).forEach((action) => {
            const currentAction = find(currentPhase.actions, { id: action });
            if (!currentAction) {
              isError = true;
              changesEl.push(
                <h5
                  className='bulk-view-item-action-error'
                  key={`action_${action}_error`}
                >
                  <i className='fa fa-exclamation-triangle' />
                  Toimenpidettä {action} ei löytynyt, massamuutosta ei voida
                  tehdä tälle käsittelyprosessille
                </h5>
              );
            }
            if (
              currentAction &&
              !isEmpty(changes.phases[phase].actions[action].attributes)
            ) {
              keys(changes.phases[phase].actions[action].attributes).forEach(
                (attribute) => {
                  const currentValue =
                    (currentAction.attributes &&
                      currentAction.attributes[attribute]) ||
                    ' ';
                  changesEl.push(
                    <h4 key={`action_${action}_attr_${attribute}`}>
                      {currentPhase.name || ''} &gt;
                      {currentAction.name || ''} &gt;
                      {getAttributeName(attribute)}:{' '}
                      <span>({currentValue})</span>{' '}
                      {
                        changes.phases[phase].actions[action].attributes[
                          attribute
                        ]
                      }
                    </h4>
                  );
                }
              );
            }
            if (
              currentAction &&
              !isEmpty(changes.phases[phase].actions[action].records)
            ) {
              keys(changes.phases[phase].actions[action].records).forEach(
                (record) => {
                  const currentRecord = find(currentAction.records, {
                    id: record
                  });
                  if (!currentRecord) {
                    isError = true;
                    changesEl.push(
                      <h5
                        className='bulk-view-item-record-error'
                        key={`record_${record}_error`}
                      >
                        <i className='fa fa-exclamation-triangle' />
                        Asiakirjaa {record} ei löytynyt, massamuutosta ei voida
                        tehdä tälle käsittelyprosessille
                      </h5>
                    );
                  }
                  if (
                    currentRecord &&
                    !isEmpty(
                      changes.phases[phase].actions[action].records[record]
                        .attributes
                    )
                  ) {
                    keys(
                      changes.phases[phase].actions[action].records[record]
                        .attributes
                    ).forEach((attribute) => {
                      const currentValue =
                        (currentRecord.attributes &&
                          currentRecord.attributes[attribute]) ||
                        ' ';
                      changesEl.push(
                        <h4 key={`record_${record}_attr_${attribute}`}>
                          {currentPhase.name || ''} &gt;
                          {currentAction.name || ''} &gt;
                          {currentRecord.name || ''} &gt;
                          {getAttributeName(attribute)}:{' '}
                          <span>({currentValue})</span>{' '}
                          {
                            changes.phases[phase].actions[action].records[
                              record
                            ].attributes[attribute]
                          }
                        </h4>
                      );
                    });
                  }
                }
              );
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
              'bulk-view-item-errors': isError
            })}
          >
            {changesEl}
          </div>
        </div>
        <div className='bulk-view-item-state'>
          <h4>{getStatusLabel(item.function_state)}</h4>
        </div>
        <div className='bulk-view-item-action'>
          <button
            className='btn btn-danger'
            onClick={() => this.onRemoveBulkItem(item.function)}
          >
            Poista
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { selectedBulk, isFetchingNavigation } = this.props;
    const {
      isApproving,
      isDeleting,
      isRejecting,
      isValid,
      itemList,
      itemToRemove
    } = this.state;
    const isApproved = selectedBulk ? selectedBulk.is_approved : false;

    return (
      <div className='bulk-view'>
        <div className='bulk-view-back'>
          <Link className='btn btn-link' to='/bulk'>
            <i className='fa fa-angle-left' /> Takaisin
          </Link>
        </div>
        <div>
          <h3>Massamuutos esikatselu</h3>
        </div>
        {!isValid && !isEmpty(itemList) && !isFetchingNavigation && (
          <div className='alert alert-danger'>
            <i className='fa fa-exclamation-triangle' />
            Massamuutospaketissa on käsittelyprosesseja, joita ei voida
            varmistaa. Massamuutospakettia ei voida hyväksyä.
          </div>
        )}
        {selectedBulk && (
          <div>
            <p>Paketti ID: {selectedBulk.id}</p>
            <p>Luotu: {formatDateTime(selectedBulk.created_at)}</p>
            <p>Muutettu: {formatDateTime(selectedBulk.modified_at)}</p>
            <p>Muokkaaja: {selectedBulk.modified_by}</p>
            <p>
              Käsittelyprosessin tila muutoksen jälkeen:{' '}
              {getStatusLabel(selectedBulk.state)}
            </p>
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
                <button
                  className='btn btn-danger'
                  disabled={!selectedBulk}
                  onClick={this.onDelete}
                >
                  Poista
                </button>
              </IsAllowed>
              <IsAllowed to={APPROVE_BULKUPDATE}>
                <button
                  className='btn btn-default'
                  disabled={isApproved}
                  onClick={this.onReject}
                >
                  Hylkää
                </button>
              </IsAllowed>
              <IsAllowed to={APPROVE_BULKUPDATE}>
                <button
                  className='btn btn-primary'
                  disabled={isApproved || !isValid}
                  onClick={this.onApprove}
                >
                  Hyväksy
                </button>
              </IsAllowed>
            </div>
          </div>
        )}
        {!isFetchingNavigation && (
          <div className='bulk-view-items'>
            {itemList.map((changedItem) => this.renderItemChanges(changedItem))}
          </div>
        )}
        {isApproving && (
          <Popup
            content={
              <div>
                <h3>Hyväksytäänkö massamuutos?</h3>
                <div>
                  <button
                    className='btn btn-primary'
                    onClick={this.onConfirmApprove}
                  >
                    Hyväksy
                  </button>
                  <button className='btn btn-default' onClick={this.onCancel}>
                    Peruuta
                  </button>
                </div>
              </div>
            }
            closePopup={this.onCancel}
          />
        )}
        {isDeleting && (
          <Popup
            content={
              <div>
                <h3>Poistetaanko massamuutos?</h3>
                <div>
                  <button
                    className='btn btn-danger'
                    onClick={this.onConfirmDelete}
                  >
                    Poista
                  </button>
                  <button className='btn btn-default' onClick={this.onCancel}>
                    Peruuta
                  </button>
                </div>
              </div>
            }
            closePopup={this.onCancel}
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
                  <button
                    className='btn btn-danger'
                    onClick={this.onConfirmReject}
                  >
                    Hylkää
                  </button>
                  <button className='btn btn-default' onClick={this.onCancel}>
                    Peruuta
                  </button>
                </div>
              </div>
            }
            closePopup={this.onCancel}
          />
        )}
        {itemToRemove && (
          <Popup
            content={
              <div>
                <h4>
                  Poistetaanko käsittelyprosessi {itemToRemove.item.code}{' '}
                  {itemToRemove.item.name} massamuutoksesta?
                </h4>
                <div>
                  <button
                    className='btn btn-danger'
                    onClick={this.onConfirmRemoveBulkItem}
                  >
                    Poista
                  </button>
                  <button className='btn btn-default' onClick={this.onCancel}>
                    Peruuta
                  </button>
                </div>
              </div>
            }
            closePopup={this.onCancel}
          />
        )}
      </div>
    );
  }
}

BulkView.propTypes = {
  approveBulkUpdate: PropTypes.func.isRequired,
  clearSelectedBulkUpdate: PropTypes.func.isRequired,
  deleteBulkUpdate: PropTypes.func.isRequired,
  displayMessage: PropTypes.func.isRequired,
  fetchBulkUpdate: PropTypes.func.isRequired,
  fetchNavigation: PropTypes.func.isRequired,
  getAttributeName: PropTypes.func.isRequired,
  isFetchingNavigation: PropTypes.bool,
  isUpdating: PropTypes.bool,
  items: PropTypes.array.isRequired,
  itemsIncludeRelated: PropTypes.bool,
  match: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired,
  selectedBulk: PropTypes.object,
  updateBulkUpdate: PropTypes.func.isRequired
};

export default withRouter(BulkView);
