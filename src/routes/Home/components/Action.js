import React from 'react';
import './Action.scss';
import Record from './Record';
import AddRecord from './AddRecord';
import Popup from './Popup';
import DeletePopup from './DeletePopup';
import ReorderView from './ReorderView';
import ImportView from './ImportView';

export class Action extends React.Component {
  constructor (props) {
    super(props);
    this.saveActionTitle = this.saveActionTitle.bind(this);
    this.addRecord = this.addRecord.bind(this);
    this.cancelRecordCreation = this.cancelRecordCreation.bind(this);
    this.state = {
      mode: 'view',
      name: this.props.action.name,
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
  createNewRecord () {
    this.setState({ mode: 'add' });
  }
  saveNewRecord () {
    this.setState({ mode: 'view' });
  }
  cancelRecordCreation () {
    this.setState({ mode: 'view' });
  }
  cancelDeletion () {
    this.setState({ deleting: false });
  }
  delete () {
    this.setState({ deleted: true, deleting: false });
  }
  addRecord () {
    this.setState({ mode: 'view' });
    this.props.addRecord();
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
    let actionTitle;
    if (this.state.mode === 'view' || this.state.mode === 'add') {
      actionTitle =
      (<div className='action-title'>
        <span onClick={() => this.editActionTitle()}>
          {this.state.name}
        </span>
        { this.props.documentState === 'edit' &&
          <span className='action-buttons'>
            <button
              className='btn btn-delete btn-xs pull-right'
              onClick={() => this.setState({ deleting: true })}
              title='Poista'>
              <span className='fa fa-trash-o' />
            </button>
            { action.records.length > 1 &&
              <button
                className='btn btn-primary btn-xs pull-right'
                onClick={() => this.toggleReorderView()}
                title='Järjestä asiakirjoja'>
                <span className='fa fa-arrows' aria-hidden='true' />
              </button>
            }
            { this.props.documentState === 'edit' &&
              <button
                type='button'
                className='btn btn-primary btn-xs pull-right'
                onClick={() => this.toggleImportView()}
                title='Tuo asiakirjoja'>
                <span className='fa fa-download' aria-hidden='true' style={{ transform: 'rotate(90deg)' }} />
              </button>
            }
          </span>
        }
      </div>);
    }
    if (this.state.mode === 'edit') {
      actionTitle =
        <form className='action-title-input' onSubmit={this.saveActionTitle}>
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
        <div className='row box action'>
          { actionTitle }
          <span className='col-xs-6 attribute-label'>
            Asiakirjatyypin tarkenne
          </span>
          <span className='col-xs-6 attribute-label'>
            Tyyppi
          </span>
          <div className={'col-xs-12 records ' + (this.props.documentState === 'edit' ? 'records-editing' : '')}>
            { recordElements }
          </div>
          { this.props.documentState === 'edit' && this.state.mode !== 'add' &&
          <button className='btn btn-primary btn-sm btn-new-record pull-left' onClick={() => this.createNewRecord()}>
            Uusi asiakirja
          </button>
            }
          { this.state.mode === 'add' &&
          <div className='action add-box col-xs-12'>
            <AddRecord
              attributeTypes={this.props.attributeTypes}
              recordTypes={this.props.recordTypes}
              mode={this.state.mode}
              phaseIndex={this.props.phaseIndex}
              actionIndex={this.props.actionIndex}
              cancelRecordCreation={this.cancelRecordCreation}
              addRecord={this.addRecord}
            />
          </div>
          }
          { this.state.deleting &&
            <Popup
              content={
                <DeletePopup
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
        </div>
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
