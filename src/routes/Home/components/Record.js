import React from 'react';
import './Record.scss';
import Attribute from './Attribute';
import RecordAttribute from './RecordAttribute';
import DeletePopup from './DeletePopup';

export class Record extends React.Component {
  constructor (props) {
    super(props);
    this.toggleAttributeVisibility = this.toggleAttributeVisibility.bind(this);
    this.state = {
      showAttributes: false,
      mode: 'view',
      deleting: false,
      deleted: false
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
            attributeTypes={this.props.attributeTypes}
            mode={this.state.mode}
            showAttributes={this.state.showAttributes}
          />);
      }
    };
    return attributeElements;
  }
  cancelDeletion () {
    this.setState({ deleting: false });
  }
  delete () {
    this.setState({ deleted: true, deleting: false });
  }
  render () {
    const { record } = this.props;
    const recordObjects = this.generateRecordObjects(record);
    const recordAttributes = this.generateRecordAttributes(recordObjects);
    const attributes = this.generateAttributes(record.attributes);
    return (
      <div className='record col-xs-12'>
        { !this.state.deleted &&
          <div className='list-group'>
            { this.state.mode === 'view' &&
            <div className='record-button-group'>
              { this.props.documentState === 'edit' &&
                <button
                  className='btn btn-delete btn-xs record-button pull-right'
                  onClick={() => this.setState({ deleting: true })}
                  title='Poista'>
                  <span className='fa fa-trash-o' />
                </button>
              }
              <button
                className='btn btn-info btn-xs record-button'
                onClick={this.toggleAttributeVisibility}>
                <span
                  className={'fa ' + (this.state.showAttributes ? 'fa-minus' : 'fa-plus')}
                  aria-hidden='true'
                />
              </button>
            </div>
            }
            { recordAttributes }
            { attributes }
            { this.state.mode === 'edit' &&
            <div className='col-xs-12'>
              <button className='btn btn-primary pull-right edit-record__submit'
                onClick={() => this.saveRecord()}>Valmis</button>
              <button className='btn btn-default pull-right edit-record__cancel'
                onClick={() => this.cancelRecordEdit()}>Peruuta</button>
            </div>
          }
          </div>
        }
        { this.state.deleting &&
          <DeletePopup
            type='record'
            target={this.props.record.name}
            action={() => this.delete()}
            cancel={() => this.cancelDeletion()}
          />
        }
      </div>
    );
  }
}

Record.propTypes = {
  record: React.PropTypes.object.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired
};

export default Record;
