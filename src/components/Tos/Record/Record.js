import React from 'react';
import './Record.scss';
import Attributes from '../Attribute/Attributes';
import DeleteView from '../DeleteView/DeleteView';
import Dropdown from 'components/Dropdown';
import Popup from 'components/Popup';

export class Record extends React.Component {
  constructor (props) {
    super(props);

    this.renderRecordButtons = this.renderRecordButtons.bind(this);
    this.updateTypeSpecifier = this.updateTypeSpecifier.bind(this);
    this.updateRecordType = this.updateRecordType.bind(this);
    this.updateRecordAttribute = this.updateRecordAttribute.bind(this);
    this.state = {
      mode: 'view',
      deleting: false,
      typeSpecifier: this.props.record.attributes.TypeSpecifier,
      type: this.props.record.attributes.RecordType,
      attributes: this.props.record.attributes
    };
  }

  setMode (value) {
    this.setState({ mode: value });
  }

  updateTypeSpecifier (typeSpecifier, recordId) {
    this.setState({
      typeSpecifier: typeSpecifier
    });
    const updatedTypeSpecifier = {
      typeSpecifier: typeSpecifier,
      recordId: recordId
    };
    this.props.editRecordAttribute(updatedTypeSpecifier);
  }

  updateRecordType (type, recordId) {
    this.setState({
      type: type
    });
    const updatedRecordType = {
      type: type,
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

  cancelDeletion () {
    this.setState({ deleting: false });
  }

  delete () {
    this.setState({ deleting: false });
    this.props.removeRecord(this.props.record.id, this.props.record.action);
  }

  showAttributeButton (attributes) {
    const actualAttributes = [];
    for (const key in attributes) {
      if (key !== 'TypeSpecifier' && key !== 'RecordType') {
        actualAttributes.push(key);
      }
    }
    if (actualAttributes.length) {
      return true;
    }
    return false;
  }

  renderRecordButtons () {
    if (this.state.mode === 'view') {
      return (
        <div className='record-button-group'>
          { this.props.documentState === 'edit' &&
          <Dropdown
            items={[
              {
                text: 'Muokkaa asiakirjaa',
                icon: 'fa-pencil',
                style: 'btn-primary',
                action: () => this.props.editRecordForm(
                  this.props.record.id,
                  this.props.record.attributes
                )
              },
              // {
              //   text: 'Täydennä metatietoja',
              //   icon: 'fa-plus-square',
              //   style: 'btn-primary',
              //   action: () => this.props.complementRecordForm(
              //     this.props.record.id,
              //     this.props.record.attributes
              //   )
              // },
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
          { this.showAttributeButton(this.props.record.attributes) &&
            <button
              className='btn btn-info btn-xs record-button pull-right'
              onClick={() => this.props.setRecordVisibility(
                this.props.record.id,
                !this.props.record.is_open
              )}>
              <span
                className={'fa ' + (this.props.record.is_open ? 'fa-minus' : 'fa-plus')}
                aria-hidden='true'
              />
            </button>
          }
        </div>
      );
    }
  }

  render () {
    const { attributeTypes, recordTypes, record, documentState } = this.props;

    return (
      <div className={'record col-xs-12 ' + (record.is_open ? 'record-open' : 'record-closed')}>
        <Attributes
          element={record}
          documentState={documentState}
          type={'record'}
          attributeTypes={attributeTypes}
          typeOptions={recordTypes}
          renderButtons={this.renderRecordButtons}
          updateTypeSpecifier={this.updateTypeSpecifier}
          updateType={this.updateRecordType}
          updateAttribute={this.updateRecordAttribute}
          showAttributes={record.is_open}
        />
        { this.state.deleting &&
        <Popup
          content={
            <DeleteView
              type='record'
              target={record.attributes.TypeSpecifier || record.attributes.RecordType || '---'}
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
  // complementRecordForm: React.PropTypes.func.isRequired,
  documentState: React.PropTypes.string.isRequired,
  editRecordAttribute: React.PropTypes.func.isRequired,
  editRecordForm: React.PropTypes.func.isRequired,
  record: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  removeRecord: React.PropTypes.func.isRequired,
  setRecordVisibility: React.PropTypes.func.isRequired
};

export default Record;
