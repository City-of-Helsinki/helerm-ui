import React from 'react';
import './Action.scss';
import Record from './Record';
import AddRecord from './AddRecord';
import Popup from './Popup';
import Dropdown from '../../../components/Dropdown';
import DeleteView from './DeleteView';
import ReorderView from './ReorderView';
import ImportView from './ImportView';

import { StickyContainer, Sticky } from 'react-sticky';

export class Action extends React.Component {
  constructor (props) {
    super(props);
    this.createRecord = this.createRecord.bind(this);
    this.saveActionTitle = this.saveActionTitle.bind(this);
    this.cancelRecordCreation = this.cancelRecordCreation.bind(this);
    this.state = {
      mode: 'view',
      name: this.props.action.name,
      creating: false,
      deleting: false,
      deleted: false,
      showReorderView: false,
      showImportView: false
    };
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.action.name) {
      this.setState({ name: nextProps.action.name });
    }
  }
  editActionTitle () {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: 'edit' });
    }
  }
  saveActionTitle (event) {
    event.preventDefault();
    if (this.state.name.length > 0) {
      this.setState({ mode: 'view' });
    }
  }
  onChange (e) {
    this.setState({ name: e.target.value });
  }
  generateRecords (records) {
    const elements = [];
    for (const key in records) {
      if (records.hasOwnProperty(key)) {
        elements.push(
          <Record
            key={key}
            record={this.props.records[records[key]]}
            recordTypes={this.props.recordTypes}
            documentState={this.props.documentState}
            attributeTypes={this.props.attributeTypes}
          />
        );
      }
    }
    return elements;
  }
  generateDropdownItems (recordCount) {
    return [
      {
        text: 'Poista toimenpide',
        icon: 'fa-trash',
        style: 'btn-delete',
        action: () => this.setState({ deleting: true })
      }, {
        text: 'Järjestä asiakirjoja',
        icon: 'fa-th-list',
        style: 'btn-primary',
        action: () => this.toggleReorderView()
      }, {
        text: 'Tuo asiakirjoja',
        icon: 'fa-download',
        style: 'btn-primary',
        action: () => this.toggleImportView()
      }, {
        text: 'Uusi asiakirja',
        icon: 'fa-file-text',
        style: 'btn-primary',
        action: () => this.createNewRecord()
      }
    ];
  }
  createNewRecord () {
    this.setState({ creating: true });
  }
  cancelRecordCreation () {
    this.setState({ creating: false });
  }
  cancelDeletion () {
    this.setState({ deleting: false });
  }
  delete () {
    this.setState({ deleted: true, deleting: false });
  }
  createRecord (actionId, name, type, attributes) {
    this.setState({ creating: false });
    this.props.addRecord(actionId, name, type, attributes);
  }
  toggleReorderView () {
    const current = this.state.showReorderView;
    this.setState({ showReorderView: !current });
  }
  toggleImportView () {
    const current = this.state.showImportView;
    this.setState({ showImportView: !current });
  }
  render () {
    const { action } = this.props;
    const recordElements = this.generateRecords(action.records);
    const dropdownItems = this.generateDropdownItems(action.records.length);
    let actionTitle;
    if (this.state.mode === 'view') {
      actionTitle =
      (<span>
        <span onClick={() => this.editActionTitle()}>
          {this.state.name}
        </span>
        { this.props.documentState === 'edit' &&
          <span className='action-dropdown-button'>
            <Dropdown children={dropdownItems} extraSmall />
          </span>
        }
      </span>);
    }
    if (this.state.mode === 'edit') {
      actionTitle =
        <form onSubmit={this.saveActionTitle}>
          <input
            className='input-title form-control col-xs-11'
            value={this.state.name}
            onChange={(e) => this.onChange(e)}
            onBlur={this.saveActionTitle}
            autoFocus
          />
        </form>;
    }
    return (
      <div>
        { !this.state.deleted &&
        <StickyContainer className='row box action'>
          <Sticky className='action-title'>
            { actionTitle }
          </Sticky>
          { this.state.creating &&
            <AddRecord
              attributeTypes={this.props.attributeTypes}
              recordTypes={this.props.recordTypes}
              mode={this.state.mode}
              actionId={this.props.action.id}
              cancelRecordCreation={this.cancelRecordCreation}
              createRecord={this.createRecord}
            />
          }
          <span className='col-xs-6 attribute-label'>
            Asiakirjatyypin tarkenne
          </span>
          <span className='col-xs-6 attribute-label'>
            Tyyppi
          </span>
          <div className={'col-xs-12 records ' + (this.props.documentState === 'edit' ? 'records-editing' : '')}>
            { recordElements }
          </div>

          { this.state.deleting &&
            <Popup
              content={
                <DeleteView
                  type='action'
                  target={this.state.name}
                  action={() => this.delete()}
                  cancel={() => this.cancelDeletion()}
                />
              }
              closePopup={() => this.cancelDeletion()}
            />
          }
          { this.state.showReorderView &&
            <Popup
              content={
                <ReorderView
                  target='record'
                  toggleReorderView={() => this.toggleReorderView()}
                  keys={this.props.action.records}
                  values={this.props.records}
                  commitOrderChanges={this.props.commitOrderChanges}
                  parent={this.props.action.id}
                  parentName={this.state.name}
                />
              }
              closePopup={() => this.toggleReorderView()}
            />
          }
          { this.state.showImportView &&
            <Popup
              content={
                <ImportView
                  level='record'
                  toggleImportView={() => this.toggleImportView()}
                  title='asiakirjoja'
                  targetText={'toimenpiteeseen ' + action.name}
                  itemsToImportText='asiakirjat'
                  phasesOrder={this.props.phasesOrder}
                  phases={this.props.phases}
                  actions={this.props.actions}
                  records={this.props.records}
                  importItems={this.props.importItems}
                  parent={action.id}
                  parentName={action.name}
                />
              }
              closePopup={() => this.toggleImportView()}
            />
          }
        </StickyContainer>
      }
      </div>
    );
  }
}

Action.propTypes = {
  action: React.PropTypes.object.isRequired,
  phases: React.PropTypes.object.isRequired,
  phasesOrder: React.PropTypes.array.isRequired,
  actions: React.PropTypes.object.isRequired,
  records: React.PropTypes.object.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  actionIndex: React.PropTypes.string.isRequired,
  phaseIndex: React.PropTypes.string.isRequired,
  commitOrderChanges: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired
};

export default Action;
