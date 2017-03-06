import React from 'react';
import './Record.scss';
import Attribute from './Attribute';
import DeleteView from './DeleteView';
import Dropdown from 'components/Dropdown';
import Popup from 'components/Popup';

export class Record extends React.Component {
  constructor (props) {
    super(props);

    this.toggleAttributeVisibility = this.toggleAttributeVisibility.bind(this);
    this.updateRecordName = this.updateRecordName.bind(this);
    this.updateRecordType = this.updateRecordType.bind(this);
    this.updateRecordAttribute = this.updateRecordAttribute.bind(this);
    this.state = {
      showAttributes: false,
      mode: 'view',
      deleting: false,
      name: this.props.record.name,
      attributes: this.props.record.attributes
    };
  }

  setMode (value) {
    this.setState({ mode: value });
  }

  // editRecord () {
  //   this.setMode('edit');
  //   this.setState({ showAttributes: true });
  // }

  // saveRecord () {
  //   this.setMode('view');
  // }

  // cancelRecordEdit () {
  //   this.setMode('view');
  // }

  toggleAttributeVisibility () {
    const currentVisibility = this.state.showAttributes;
    const newVisibility = !currentVisibility;
    this.setState({ showAttributes: newVisibility });
  }

  updateRecordName (recordName, recordId) {
    this.setState({
      name: recordName
    });
    const updatedRecordName = {
      name: recordName,
      recordId: recordId
    };
    this.props.editRecordAttribute(updatedRecordName);
  }

  updateRecordType (attribute, recordId) {
    const updatedRecordType = {
      type: attribute,
      recordId: recordId
    };
    this.props.editRecordAttribute(updatedRecordType);
  }

  updateRecordAttribute (attribute, attributeIndex, recordId) {
    this.setState({
      attributes: {
        [attributeIndex]: attribute
      }
    });
    const updatedRecordAttribute = { attribute, attributeIndex, recordId };
    this.props.editRecordAttribute(updatedRecordAttribute);
  }

  generateRecordObjects (record) {
    const recordObjects = [];
    recordObjects.push({ recordKey: 'Asiakirjatyypin tarkenne', name: record.name, type: '' });
    recordObjects.push({ recordKey: 'Tyyppi', name: record.attributes.RecordType, type: record.attributes.RecordType });
    return recordObjects;
  }

  generateRecordAttributes (records) {
    return records.map((record, index) => {
      return (
        <Attribute
          key={index}
          recordId={this.props.record.id}
          attributeIndex={record.type}
          attributeKey=''
          attribute={record.name}
          documentState={this.props.documentState}
          attributeTypes={this.props.recordTypes}
          mode={this.state.mode}
          type='record'
          editable={true}
          updateRecordName={this.updateRecordName}
          updateRecordType={this.updateRecordType}
          updateRecordAttribute={this.updateRecordAttribute}
          showAttributes={true}
        />
      );
    });
  }

  generateAttributes (attributes, recordName, recordType) {
    const attributeElements = [];
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key) && this.props.attributeTypes[key]) {
        attributeElements.push(
          <Attribute
            key={key}
            recordId={this.props.record.id}
            attributeIndex={key}
            attributeKey={this.props.attributeTypes[key].name}
            attribute={attributes[key]}
            attributeTypes={this.props.attributeTypes}
            documentState={this.props.documentState}
            mode={this.state.mode}
            type='attribute'
            editable={true}
            updateRecordAttribute={this.updateRecordAttribute}
            showAttributes={this.state.showAttributes}
          />);
      }
    }
    return attributeElements;
  }

  cancelDeletion () {
    this.setState({ deleting: false });
  }

  delete () {
    this.setState({ deleting: false });
    this.props.removeRecord(this.props.record.id, this.props.record.action);
  }

  render () {
    const { record } = this.props; // TYPE IS UNDEFINED
    const recordObjects = this.generateRecordObjects(record);
    const recordAttributes = this.generateRecordAttributes(recordObjects);
    const attributes = this.generateAttributes(record.attributes);
    return (
      <div className={'record col-xs-12 ' + (this.state.showAttributes ? 'record-open' : '')}>
        <div className='list-group'>
          { this.state.mode === 'view' &&
          <div className='record-button-group'>
            { this.props.documentState === 'edit' &&
            <Dropdown
              children={[
                {
                  text: 'Muokkaa asiakirjaa',
                  icon: 'fa-pencil',
                  style: 'btn-primary',
                  action: () => this.props.editRecordForm(record.id, this.state.attributes)
                },
                {
                  text: 'Poista asiakirja',
                  icon: 'fa-trash',
                  style: 'btn-delete',
                  action: () => this.setState({ deleting: true })
                }
              ]}
              extraSmall={true}
            />
            }
            <button
              className='btn btn-info btn-xs record-button pull-right'
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
          {/* { this.state.mode === 'edit' &&
          <div className='col-xs-12'>
            <button className='btn btn-primary pull-right edit-record__submit'
                    onClick={() => this.saveRecord()}>
              Valmis
            </button>
            <button className='btn btn-default pull-right edit-record__cancel'
                    onClick={() => this.cancelRecordEdit()}>
              Peruuta
            </button>
          </div>
          } */}
        </div>
        { this.state.deleting &&
        <Popup
          content={
            <DeleteView
              type='record'
              target={this.props.record.name}
              action={() => this.delete()}
              cancel={() => this.cancelDeletion()}
            />
          }
          closePopup={() => this.cancelDeletion()}
        />
        }
      </div>
    );
  }
}

Record.propTypes = {
  attributeTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  editRecordAttribute: React.PropTypes.func.isRequired,
  editRecordForm: React.PropTypes.func.isRequired,
  record: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  removeRecord: React.PropTypes.func.isRequired
};

export default Record;
