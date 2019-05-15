import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import { cloneDeep, find, isEmpty, keys, split } from 'lodash';

import {
  APPROVE_BULKUPDATE,
  DELETE_BULKUPDATE,
  BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES
} from '../../../../config/constants';
import { formatDateTime, getStatusLabel } from 'utils/helpers';
import IsAllowed from 'components/IsAllowed/IsAllowed';
import Popup from 'components/Popup';
import './BulkView.scss';

export class BulkView extends React.Component {

  constructor (props) {
    super(props);

    this.onApprove = this.onApprove.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onConfirmApprove = this.onConfirmApprove.bind(this);
    this.onConfirmDelete = this.onConfirmDelete.bind(this);
    this.onConfirmReject = this.onConfirmReject.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onReject = this.onReject.bind(this);

    this.state = {
      isApproving: false,
      isDeleting: false,
      isRejecting: false,
      itemList: []
    };
  }

  componentDidMount () {
    const { items, itemsIncludeRelated, params: { id }, selectedBulk } = this.props;
    if (id) {
      this.props.fetchBulkUpdate(id);
    }
    if (isEmpty(items) || !itemsIncludeRelated) {
      this.props.fetchNavigation(true);
    } else if (selectedBulk) {
      this.parseItemList(items, selectedBulk);
    }
  }

  componentWillReceiveProps (nextProps) {
    const { isFetchingNavigation: wasFetchingNavigation, selectedBulk: prevSelectedBulk } = this.props;
    const { isFetchingNavigation, items, selectedBulk } = nextProps;
    const { itemList } = this.state;
    if (isEmpty(itemList) && !isEmpty(items) && !isEmpty(selectedBulk) && ((wasFetchingNavigation && !isFetchingNavigation) || !prevSelectedBulk)) {
      this.parseItemList(items, selectedBulk);
    }
  }

  componentWillUnmount () {
    this.props.clearSelectedBulkUpdate();
  }

  onApprove () {
    const { selectedBulk } = this.props;
    if (!isEmpty(selectedBulk)) {
      this.setState({ isApproving: true });
    }
  }

  onConfirmApprove () {
    const { selectedBulk } = this.props;
    this.setState({ isApproving: false });
    this.props.approveBulkUpdate(selectedBulk.id)
      .then(() => {
        this.props.push('/bulk');
        return this.props.displayMessage({
          title: 'Massamuutos',
          body: 'Massamuutos hyväksytty!'
        });
      })
      .catch(err => {
        return this.props.displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`
          },
          { type: 'error' }
        );
      });
  }

  onCancel () {
    this.setState({
      isApproving: false,
      isDeleting: false,
      isRejecting: false
    });
  }

  onDelete () {
    const { selectedBulk } = this.props;
    if (!isEmpty(selectedBulk)) {
      this.setState({ isDeleting: true });
    }
  }

  onConfirmDelete () {
    const { selectedBulk } = this.props;
    this.setState({ isDeleting: false });
    this.props.deleteBulkUpdate(selectedBulk.id)
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
      .catch(err => {
        return this.props.displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`
          },
          { type: 'error' }
        );
      });
  }

  onReject () {
    const { selectedBulk } = this.props;
    if (!isEmpty(selectedBulk)) {
      this.setState({ isRejecting: true });
    }
  }

  onConfirmReject () {
    this.setState({ isRejecting: false });
    // what happens on reject is still open
  }

  parseItemList (items, selectedBulk) {
    const changedFunctions = keys(selectedBulk.changes).reduce((acc, functionVersion) => {
      const versionSplitted = split(functionVersion, '__');
      if (versionSplitted && versionSplitted.length === 2) {
        acc[versionSplitted[0]] = { ...selectedBulk.changes[functionVersion], version: versionSplitted[1] };
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
            item: clonedItem,
            changes: changedFunctions[item.function]
          });
        }
        return acc;
      }, []);
    };
    const itemList = flattenItems(items);
    this.setState({ itemList });
  }

  renderItemChanges (changedItem) {
    const { getAttributeName } = this.props;
    const { changes, item } = changedItem;
    const changesEl = [];

    BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES.forEach(attribute => {
      if (changes[attribute.value]) {
        const currentValue = item[attribute.value] || ' ';
        changesEl.push(
          <h4 key={`function_${item.id}_attribute_${attribute.value}`}>
            {attribute.label}: <span>({currentValue})</span> {changes[attribute.value]}
          </h4>
        );
      }
    });
    if (!isEmpty(changes.attributes)) {
      keys(changes.attributes).forEach(attribute => {
        const currentValue = item.attributes[attribute] || ' ';
        changesEl.push(
          <h4 key={`function_${item.id}_attribute_${attribute}`}>
            {getAttributeName(attribute)}: <span>({currentValue})</span> {changes.attributes[attribute]}
          </h4>
        );
      });
    }
    if (!isEmpty(changes.phases)) {
      keys(changes.phases).forEach(phase => {
        const currentPhase = find(item.phases, { id: phase });
        if (currentPhase && !isEmpty(changes.phases[phase].attributes)) {
          keys(changes.phases[phase].attributes).forEach(attribute => {
            const currentValue = (currentPhase.attributes && currentPhase.attributes[attribute]) || ' ';
            changesEl.push(
              <h4 key={`phase_${phase}_attr_${attribute}`}>
                {currentPhase.name || ''} &gt;
                {getAttributeName(attribute)}: <span>({currentValue})</span> {changes.phases[phase].attributes[attribute]}
              </h4>
            );
          });
        }
        if (currentPhase && !isEmpty(changes.phases[phase].actions)) {
          keys(changes.phases[phase].actions).forEach(action => {
            const currentAction = find(currentPhase.actions, { id: action });
            if (currentAction && !isEmpty(changes.phases[phase].actions[action].attributes)) {
              keys(changes.phases[phase].actions[action].attributes).forEach(attribute => {
                const currentValue = (currentAction.attributes && currentAction.attributes[attribute]) || ' ';
                changesEl.push(
                  <h4 key={`action_${action}_attr_${attribute}`}>
                    {currentPhase.name || ''} &gt;
                    {currentAction.name || ''} &gt;
                    {getAttributeName(attribute)}: <span>({currentValue})</span> {changes.phases[phase].actions[action].attributes[attribute]}
                  </h4>
                );
              });
            }
            if (currentAction && !isEmpty(changes.phases[phase].actions[action].records)) {
              keys(changes.phases[phase].actions[action].records).forEach(record => {
                const currentRecord = find(currentAction.records, { id: record });
                if (!isEmpty(changes.phases[phase].actions[action].records[record].attributes)) {
                  keys(changes.phases[phase].actions[action].records[record].attributes).forEach(attribute => {
                    const currentValue = (currentRecord && currentRecord.attributes && currentRecord.attributes[attribute]) || ' ';
                    changesEl.push(
                      <h4 key={`record_${record}_attr_${attribute}`}>
                        {currentPhase.name || ''} &gt;
                        {currentAction.name || ''} &gt;
                        {currentRecord.name || ''} &gt;
                        {getAttributeName(attribute)}: <span>({currentValue})</span> {changes.phases[phase].actions[action].records[record].attributes[attribute]}
                      </h4>
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
      <div className='preview-changes'>
        {changesEl}
      </div>
    );
  }

  render () {
    const { selectedBulk } = this.props;
    const { isApproving, isDeleting, isRejecting, itemList } = this.state;
    const isApproved = selectedBulk ? selectedBulk.is_approved : false;

    return (
      <div className='bulk-view'>
        <div className='bulk-view-back'>
          <Link className='btn btn-link' to='/bulk'>
            <i className='fa fa-angle-left' /> Takaisin
          </Link>
        </div>
        <div className='bulk-view-info'>
          <h3>Massamuutos esikatselu</h3>
          <p>Paketti ID: {selectedBulk && selectedBulk.id}</p>
          <p>Luotu: {selectedBulk && formatDateTime(selectedBulk.created_at)}</p>
          <p>Muutettu: {selectedBulk && formatDateTime(selectedBulk.modified_at)}</p>
          <p>Muokkaaja: {selectedBulk && selectedBulk.modified_by}</p>
          <p>Käsittelyprosessin tila muutoksen jälkeen: {selectedBulk && getStatusLabel(selectedBulk.state)}</p>
          <p>Muutokset: {selectedBulk && selectedBulk.description}</p>
          <p>Hyväksytty: {selectedBulk && (selectedBulk.is_approved ? 'Kyllä' : 'Ei')}</p>
        </div>
        <div className='bulk-view-changes-header'>
          <div className='bulk-view-changes'>
            <h4>Tehdyt muutokset ({selectedBulk ? keys(selectedBulk.changes).length : ''})</h4>
          </div>
          <div className='bulk-view-actions'>
            <IsAllowed to={DELETE_BULKUPDATE}>
              <button className='btn btn-danger' disabled={!selectedBulk} onClick={this.onDelete}>
                Poista
              </button>
            </IsAllowed>
            <IsAllowed to={APPROVE_BULKUPDATE}>
              <button className='btn btn-default' disabled={isApproved} onClick={this.onReject}>
                Hylkää
              </button>
            </IsAllowed>
            <IsAllowed to={APPROVE_BULKUPDATE}>
              <button className='btn btn-primary' disabled={isApproved} onClick={this.onApprove}>
                Hyväksy
              </button>
            </IsAllowed>
          </div>
        </div>
        <div className='bulk-view-items'>
          {itemList.map(changedItem => (
            <div className='bulk-view-item' key={changedItem.item.function}>
              <div className='bulk-view-item-info'>
                <span className='bulk-view-item-path'>{changedItem.item.path.join(' > ')}</span>
                <h4 className='bulk-view-item-name'>{changedItem.item.name}</h4>
                {this.renderItemChanges(changedItem)}
              </div>
              <div className='bulk-view-item-state'>
                <h4>{getStatusLabel(changedItem.item.function_state)}</h4>
              </div>
            </div>
          ))}
        </div>
        {isApproving && (
          <Popup
            content={
              <div>
                <h3>Hyväksytäänkö massamuutos?</h3>
                <div>
                  <button className='btn btn-primary' onClick={this.onConfirmApprove}>
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
                  <button className='btn btn-danger' onClick={this.onConfirmDelete}>
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
                <p><strong>HUOM! Hylkäys ei vielä tee mitään.</strong></p>
                <div>
                  <button className='btn btn-danger' onClick={this.onConfirmReject}>
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
      </div>
    );
  }
};

BulkView.propTypes = {
  approveBulkUpdate: PropTypes.func.isRequired,
  clearSelectedBulkUpdate: PropTypes.func.isRequired,
  deleteBulkUpdate: PropTypes.func.isRequired,
  displayMessage: PropTypes.func.isRequired,
  fetchBulkUpdate: PropTypes.func.isRequired,
  fetchNavigation: PropTypes.func.isRequired,
  getAttributeName: PropTypes.func.isRequired,
  isFetchingNavigation: PropTypes.bool,
  items: PropTypes.array.isRequired,
  itemsIncludeRelated: PropTypes.bool,
  params: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired,
  selectedBulk: PropTypes.object
};

export default BulkView;
