import React from 'react';
import './Action.scss';
import Record from './Record';

export class Action extends React.Component {

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
    return (
      <div className='action box'>
        <span className='action-title'>{action.name}</span>
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
