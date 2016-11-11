import React from 'react';
import './Action.scss';
import Record from './Record';
import AddRecord from './AddRecord';
import DeletePopup from './DeletePopup';

export class Action extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.saveActionTitle = this.saveActionTitle.bind(this);
    this.state = {
      mode: 'view',
      name: this.props.action.name,
      deleting: false,
      deleted: false
    };
  }
  editActionTitle () {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: 'edit' });
    }
  }
  saveActionTitle (event) {
    event.preventDefault();
    this.setState({ mode: 'view' });
  }
  onChange (event) {
    this.setState({ name: event.target.value });
  }
  generateRecords (records) {
    return records.map((record, index) => {
      return (
        <Record
          key={index}
          record={record}
          recordTypes={this.props.recordTypes}
          documentState={this.props.documentState}
          attributes={this.props.attributes}
        />
      );
    });
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
  render () {
    const { action } = this.props;
    const records = this.generateRecords(action.records);
    let actionTitle;
    if (this.state.mode === 'view' || this.state.mode === 'add') {
      actionTitle =
        <div className='action-title' onClick={() => this.editActionTitle()}>
          {this.state.name}
          { this.props.documentState === 'edit' &&
            <button
              className='btn btn-delete btn-xs pull-right'
              onClick={() => this.setState({ deleting: true })}
              title='Poista'>
              <span className='fa fa-trash-o' />
            </button>
          }
        </div>
      ;
    }
    if (this.state.mode === 'edit') {
      actionTitle =
        <form className='action-title-input' onSubmit={this.saveActionTitle}>
          <input
            className='input-title form-control col-xs-11'
            value={this.state.name}
            onChange={this.onChange}
            onBlur={this.saveActionTitle}
            autoFocus
          />
          <button type='submit' className='btn btn-primary col-xs-1 btn-sm'>
            <span className='fa fa-check' />
          </button>
        </form>;
    }
    return (
      <div>
        { !this.state.deleted &&
        <div className='action box row'>
          { actionTitle }
          { records }
          { this.props.documentState === 'edit' && this.state.mode !== 'add' &&
          <button className='btn btn-primary btn-sm btn-new-record' onClick={() => this.createNewRecord()}>
            Uusi asiakirja
          </button>
            }
          { this.state.mode === 'add' &&
          <div className='action add-box row'>
            <AddRecord
              attributes={this.props.attributes}
              recordTypes={this.props.recordTypes}
              mode={this.state.mode}
              phaseIndex={this.props.phaseIndex}
              actionIndex={this.props.actionIndex}
              addRecord={this.props.addRecord}
            />
          </div>
          }
          { this.state.deleting &&
            <DeletePopup
              type='action'
              target={this.state.name}
              action={() => this.delete()}
              cancel={() => this.cancelDeletion()}
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
  attributes: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  actionIndex: React.PropTypes.number.isRequired,
  phaseIndex: React.PropTypes.string.isRequired
};

export default Action;
