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
        <Attribute
          key={index}
          attributeIndex={record.type}
          attributeKey=''
          attribute={record.name}
          documentState={this.props.documentState}
          attributeTypes={this.props.recordTypes}
          mode={this.state.mode}
          type='record'
          editable={true}
          showAttributes={true}
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
            attributeKey={this.props.attributeTypes[key].name}
            attribute={attributes[key]}
            documentState={this.props.documentState}
            attributeTypes={this.props.attributeTypes}
            mode={this.state.mode}
            type='attribute'
            editable={true}
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
    this.setState({ deleted: true, deleting: false });
  }

  render () {
    const { record } = this.props;
    const recordObjects = this.generateRecordObjects(record);
    const recordAttributes = this.generateRecordAttributes(recordObjects);
    const attributes = this.generateAttributes(record.attributes);
    return (
      <div className={'record col-xs-12 ' + (this.state.showAttributes ? 'record-open' : '')}>
        { !this.state.deleted &&
        <div className='list-group'>
          { this.state.mode === 'view' &&
          <div className='record-button-group'>
            { this.props.documentState === 'edit' &&
            <Dropdown
              children={[{
                text: 'Poista asiakirja',
                icon: 'fa-trash',
                style: 'btn-delete',
                action: () => this.setState({ deleting: true })
              }]}
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
          { this.state.mode === 'edit' &&
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
          }
        </div>
        }
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
  record: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired
};

export default Record;
