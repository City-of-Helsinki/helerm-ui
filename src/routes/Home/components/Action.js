import React from 'react';
import './Action.scss';
import Record from './Record';
import AddRecord from './AddRecord';

export class Action extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {
      mode: 'view',
      name: this.props.action.name
    };
  }
  editActionTitle () {
    this.setState({ mode: 'edit' });
  }
  saveActionTitle () {
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
  createNewAction () {
    this.setState({ mode: 'add' });
  }
  saveNewRecord () {
    this.setState({ mode: 'view' });
  }
  cancelRecordCreation () {
    this.setState({ mode: 'view' });
  }
  render () {
    const { action } = this.props;
    const records = this.generateRecords(action.records);
    let actionTitle;
    if (this.state.mode === 'view' || this.state.mode === 'add') {
      actionTitle =
        <span className='action-title'>
          {this.state.name}
          <button
            className='btn btn-default btn-sm title-edit-button'
            onClick={() => this.editActionTitle()}>
            <span className='fa fa-edit' />
          </button>
        </span>
      ;
    }
    if (this.state.mode === 'edit') {
      actionTitle =
        <div className='action-title-input'>
          <input className='input-title col-xs-10' value={this.state.name} onChange={this.onChange} />
          <button className='btn btn-primary col-xs-2' onClick={() => this.saveActionTitle()}>Valmis</button>
        </div>;
    }
    return (
      <div className='action box'>
        { actionTitle }
        { records }
        { this.state.mode !== 'add' &&
          <button className='btn btn-primary btn-sm' onClick={() => this.createNewAction()}>
            <i className='fa fa-plus' /> Uusi toimenpide
          </button>
        }
        { this.state.mode === 'add' &&
        <div className='action add-box row'>
          <AddRecord attributes={this.props.attributes} recordTypes={this.props.recordTypes} mode={this.state.mode} />
          <div className='col-xs-12'>
            <button className='btn btn-primary pull-right' onClick={() => this.saveNewRecord()}>Valmis</button>
            <button className='btn btn-default pull-right' onClick={() => this.cancelRecordCreation()}>Peruuta</button>
          </div>
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
  documentState: React.PropTypes.string.isRequired
};

export default Action;
