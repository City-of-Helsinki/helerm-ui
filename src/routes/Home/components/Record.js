import React from 'react';
import './Record.scss';
import Attribute from './Attribute';
import RecordAttribute from './RecordAttribute';

export class Record extends React.Component {
  constructor (props) {
    super(props);
    this.toggleAttributeVisibility = this.toggleAttributeVisibility.bind(this);
    this.state = {
      showAttributes: false,
      mode: 'view'
    };
  }
  setMode (value) {
    this.setState({ mode: value });
  }
  editRecord () {
    this.setMode('edit');
    this.setState({ showAttributes: true });
  }
  saveRecord () {
    this.setMode('view');
  }
  cancelRecordEdit () {
    this.setMode('view');
  }
  toggleAttributeVisibility () {
    const currentVisibility = this.state.showAttributes;
    const newVisibility = !currentVisibility;
    this.setState({ showAttributes: newVisibility });
  }
  generateRecordObjects (record) {
    const recordObjects = [];
    recordObjects.push({ recordKey: 'Asiakirjatyypin tarkenne', name: record.name, type: '' });
    recordObjects.push({ recordKey: 'Tyyppi', name: this.props.recordTypes[record.type], type: record.type });
    return recordObjects;
  }
  generateRecordAttributes (records) {
    return records.map((record, index) => {
      return (
        <RecordAttribute
          key={index}
          recordKey={record.recordKey}
          recordName={record.name}
          recordType={record.type}
          recordTypes={this.props.recordTypes}
          documentState={this.props.documentState}
          mode={this.state.mode}
        />
      );
    });
  }
  generateAttributes (attributes, recordName, recordType) {
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
            mode={this.state.mode}
            showAttributes={this.state.showAttributes}
          />);
      }
    };
    return attributeElements;
  }

  render () {
    const { record } = this.props;
    const recordObjects = this.generateRecordObjects(record);
    const recordAttributes = this.generateRecordAttributes(recordObjects);
    const attributes = this.generateAttributes(record.attributes);
    return (
      <div className='row record'>
        { this.state.mode === 'view' &&
          <div className='col-xs-12'>
            <button
              className='btn btn-default btn-xs record-button pull-right'
              onClick={this.toggleAttributeVisibility}>
              <span
                className={'fa ' + (this.state.showAttributes ? 'fa-minus' : 'fa-plus')}
                aria-hidden='true'
              />
            </button>
            { this.props.documentState === 'edit' &&
              <button className='btn btn-default btn-xs pull-right' onClick={() => this.editRecord()}>
                <span className='fa fa-edit' />
              </button>
            }
          </div>
        }
        { recordAttributes }
        { attributes }
        { this.state.mode === 'edit' &&
          <div className='col-xs-12'>
            <button className='btn btn-primary pull-right' onClick={() => this.saveRecord()}>Valmis</button>
            <button className='btn btn-default pull-right' onClick={() => this.cancelRecordEdit()}>Peruuta</button>
          </div>
        }
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
