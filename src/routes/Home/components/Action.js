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
  createNewRecord () {
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
        <div className='action-title'>
          {this.state.name}
          { this.props.documentState === 'edit' &&
            <button
              className='btn btn-default btn-sm title-edit-button'
              onClick={() => this.editActionTitle()} title='Muokkaa'>
              <span className='fa fa-edit'/>
            </button>
          }
        </div>
      ;
    }
    if (this.state.mode === 'edit') {
      actionTitle =
        <div className='action-title-input'>
          <input className='input-title form-control col-xs-10' value={this.state.name} onChange={this.onChange} />
          <button className='btn btn-primary col-xs-2 btn-sm' onClick={() => this.saveActionTitle()}>Valmis</button>
        </div>;
    }
    return (
      <div className='action box'>
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
