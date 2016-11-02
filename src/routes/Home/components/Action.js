import React from 'react';
import './Action.scss';
import Record from './Record';

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

  render () {
    const { action } = this.props;
    const records = this.generateRecords(action.records);
    let actionTitle;
    if (this.state.mode === 'view') {
      actionTitle =
        <span className='action-title'>
          {this.state.name}
          <button
            className='button action-edit-button'
            onClick={() => this.editActionTitle()}>
            <span className='fa fa-edit' />
          </button>
        </span>
      ;
    }
    if (this.state.mode === 'edit') {
      actionTitle =
        <div className='action-title-input'>
          <input className='action-title col-xs-10' defaultValue={this.state.name} onChange={this.onChange} />
          <button className='btn btn-primary col-xs-2' onClick={() => this.saveActionTitle()}>Valmis</button>
        </div>;
    }
    return (
      <div className='action box'>
        { actionTitle }
        { records }
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
