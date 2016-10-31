import React from 'react';
import './Record.scss';
import Attribute from './Attribute';

export class Record extends React.Component {
  generateAttributes (attributes) {
    const attributeElements = [];
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        attributeElements.push(
          <Attribute
            key={key}
            attributeIndex={key}
            attribute={attributes[key]}
            documentState={this.props.documentState}
            attributes={this.props.attributes}
          />);
      }
    };
    return attributeElements;
  }

  render () {
    const { record } = this.props;
    const attributes = this.generateAttributes(record.attributes);
    return (
      <div className='record row'>
        {/*
          <div
            key={index}
            className="record-title col-xs-12"
            onClick={() => this.props.setRecordVisibility(record, record.is_open)}>
        */}
        <div className='col-xs-12'>
          <div className='col-xs-6'>Asiakirjatyypin tarkenne</div>
          <div className='col-xs-6'>{record.name}</div>
          <div className='col-xs-6'>Tyyppi</div>
          <div className='col-xs-6'>{this.props.recordTypes[record.type]}</div>
        </div>
        { attributes }
      </div>
    );
  }
}

Record.propTypes = {
  record: React.PropTypes.object.isRequired,
  attributes: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired
};

export default Record;
