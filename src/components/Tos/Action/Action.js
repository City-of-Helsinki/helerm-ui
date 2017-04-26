import React from 'react';
import classnames from 'classnames';
import update from 'immutability-helper';
import { StickyContainer, Sticky } from 'react-sticky';
import Select from 'react-select';
import './Action.scss';

import Record from '../Record/Record';
import Attributes from '../Attribute/Attributes';
import EditorForm from '../EditorForm/EditorForm';
import Popup from 'components/Popup';
import Dropdown from 'components/Dropdown';
import DeleteView from '../DeleteView/DeleteView';
import ReorderView from '../Reorder/ReorderView';
import ImportView from '../ImportView/ImportView';

export class Action extends React.Component {
  constructor (props) {
    super(props);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onTypeSpecifierChange = this.onTypeSpecifierChange.bind(this);
    this.createRecord = this.createRecord.bind(this);
    this.cancelRecordCreation = this.cancelRecordCreation.bind(this);
    this.editRecordForm = this.editRecordForm.bind(this);
    this.complementRecordForm = this.complementRecordForm.bind(this);
    this.editRecordWithForm = this.editRecordWithForm.bind(this);
    this.cancelRecordEdit = this.cancelRecordEdit.bind(this);
    this.cancelRecordComplement = this.cancelRecordComplement.bind(this);
    this.updateTypeSpecifier = this.updateTypeSpecifier.bind(this);
    this.updateActionType = this.updateActionType.bind(this);
    this.renderActionButtons = this.renderActionButtons.bind(this);
    this.renderBasicAttributes = this.renderBasicAttributes.bind(this);
    this.disableEditMode = this.disableEditMode.bind(this);
    this.state = {
      typeSpecifier: this.props.action.attributes.TypeSpecifier || '(ei tarkennetta)',
      type: this.props.action.attributes.ActionType || '---',
      attributes: this.props.action.attributes,
      mode: 'view',
      editingTypeSpecifier: false,
      editingType: false,
      creating: false,
      editing: false,
      complementing: false,
      deleting: false,
      showReorderView: false,
      showImportView: false,
      showAttributes: false
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.action && nextProps.action.attributes.TypeSpecifier) {
      this.setState({ typeSpecifier: nextProps.action.attributes.TypeSpecifier });
    }
    if (nextProps.action && nextProps.action.attributes.ActionType) {
      this.setState({ type: nextProps.action.attributes.ActionType });
    }
    if (nextProps.documentState === 'view') {
      this.setState({
        editing: false,
        complementing: false
      });
    }
  }

  editTypeSpecifier () {
    if (this.props.documentState === 'edit') {
      this.setState({ editingTypeSpecifier: true, mode: 'edit' });
    }
  }

  editType () {
    if (this.props.documentState === 'edit') {
      this.setState({ editingType: true, mode: 'edit' });
    }
  }

  disableEditMode () {
    this.setState({
      editingTypeSpecifier: false,
      editingType: false,
      mode: 'view'
    });
  }

  onChange (e) {
    this.setState({ name: e.target.value });
  }

  onTypeSpecifierChange (event) {
    this.setState({ typeSpecifier: event.target.value });
  }

  onTypeChange (value) {
    this.setState(update(this.state, {
      type: {
        $set: value
      }
    }));
  }

  updateTypeSpecifier (event) {
    event.preventDefault();
    const updatedTypeSpecifier = {
      typeSpecifier: this.state.typeSpecifier,
      actionId: this.props.action.id
    };
    this.props.editActionAttribute(updatedTypeSpecifier);
    if (this.state.typeSpecifier.length > 0) {
      this.disableEditMode();
    }
  }

  updateActionType (event) {
    event.preventDefault();
    const updatedActionType = {
      type: this.state.type,
      actionId: this.props.action.id
    };
    this.props.editActionAttribute(updatedActionType);
    this.disableEditMode();
  }

  generateRecords (records) {
    const elements = [];
    for (const key in records) {
      if (records.hasOwnProperty(key)) {
        elements.push(
          <Record
            key={key}
            record={this.props.records[records[key]]}
            editRecordForm={this.editRecordForm}
            complementRecordForm={this.complementRecordForm}
            editRecordAttribute={this.props.editRecordAttribute}
            removeRecord={this.props.removeRecord}
            recordTypes={this.props.recordTypes}
            documentState={this.props.documentState}
            attributeTypes={this.props.attributeTypes}
            displayMessage={this.props.displayMessage}
          />
        );
      }
    }
    return elements;
  }

  createNewRecord () {
    this.setState({ creating: true });
  }

  cancelRecordCreation () {
    this.setState({ creating: false });
  }

  editRecordForm (recordId, recordAttributes) {
    this.setState({
      record: {
        id: recordId,
        attributes: recordAttributes
      }
    }, () => {
      this.setState({ editing: true });
    });
  }

  cancelRecordEdit () {
    this.setState({
      editing: false,
      recordId: undefined
    });
  }

  complementRecordForm (recordId, recordAttributes) {
    this.setState({
      record: {
        id: recordId,
        attributes: recordAttributes
      }
    }, () => {
      this.setState({ complementing: true });
    });
  }

  cancelRecordComplement () {
    this.setState({
      complementing: false,
      recordId: undefined
    });
  }

  editRecordWithForm (actionId, attributes) {
    this.setState({
      editing: false,
      recordId: undefined
    });
    this.props.editRecord(actionId, attributes);
  }

  delete () {
    this.setState({ deleting: false });
    this.props.removeAction(this.props.action.id, this.props.action.phase);
  }

  cancelDeletion () {
    this.setState({ deleting: false });
  }

  createRecord (actionId, typeSpecifier, type, attributes) {
    this.setState({ creating: false });
    this.props.addRecord(actionId, typeSpecifier, type, attributes);
  }

  toggleReorderView () {
    const current = this.state.showReorderView;
    this.setState({ showReorderView: !current });
  }

  toggleImportView () {
    const current = this.state.showImportView;
    this.setState({ showImportView: !current });
  }

  generateDropdownItems () {
    return [
      {
        text: 'Uusi asiakirja',
        icon: 'fa-file-text',
        style: 'btn-primary',
        action: () => this.createNewRecord()
      }, {
        text: 'Järjestä asiakirjoja',
        icon: 'fa-th-list',
        style: 'btn-primary',
        action: () => this.toggleReorderView()
      }, {
        text: 'Tuo asiakirjoja',
        icon: 'fa-download',
        style: 'btn-primary',
        action: () => this.toggleImportView()
      }, {
        text: 'Poista toimenpide',
        icon: 'fa-trash',
        style: 'btn-delete',
        action: () => this.setState({ deleting: true })
      }
    ];
  }

  generateTypeDropdown (typeOptions) {
    const options = [];
    for (const key in typeOptions) {
      if (typeOptions.hasOwnProperty(key)) {
        options.push({
          label: typeOptions[key].name,
          value: typeOptions[key].name
        });
      }
    }

    return (
      <div className='col-md-5'>
        <form onSubmit={this.updateActionType}>
          <Select
            autoBlur={false}
            openOnFocus={true}
            className='form-control edit-action__input'
            clearable={false}
            value={this.state.type}
            onChange={(option) => this.onTypeChange(option ? option.value : null)}
            onBlur={this.updateActionType}
            autofocus={true}
            options={options}
          />
        </form>
      </div>
    );
  }

  renderActionButtons () {
    const actionDropdownItems = this.generateDropdownItems();

    return (
      <span className='action-buttons'>
        { this.props.documentState === 'edit' &&
        <span className='action-dropdown-button'>
          <Dropdown children={actionDropdownItems} extraSmall={true}/>
        </span>
        }
      </span>
    );
  }

  renderBasicAttributes () {
    let typeSpecifier =
      (<span className='col-md-6 basic-attribute' onClick={() => this.editTypeSpecifier()}>
        {this.state.typeSpecifier}
      </span>
    );
    let actionType =
      (<span className='col-md-6 basic-attribute' onClick={() => this.editType()}>
        {this.state.type}
      </span>
    );

    if (this.state.mode === 'edit') {
      if (this.state.editingTypeSpecifier) {
        typeSpecifier = (
          <div className='col-md-6 action-title-input row'>
            <form onSubmit={this.updateTypeSpecifier}>
              <input
                className='input-title form-control col-xs-11'
                value={this.state.typeSpecifier}
                onChange={this.onTypeSpecifierChange}
                onBlur={this.updateTypeSpecifier}
                autoFocus={true}
              />
            </form>
          </div>
        );
      }
      if (this.state.editingType) {
        actionType = this.generateTypeDropdown(this.props.actionTypes);
      }
    }

    return (
      <div className='basic-attributes'>
        {typeSpecifier}
        {actionType}
      </div>
    );
  }

  render () {
    // TODO: Handle errors where we don't have an valid action (i.e 400 error from API)
    const { action } = this.props;
    const recordElements = action && action.records ? this.generateRecords(action.records) : [];

    return (
      <div>
        <StickyContainer className='row box action'>
          <Sticky className='action-title'>
            <Attributes
              element={action}
              documentState={this.props.documentState}
              type={'action'}
              attributeTypes={this.props.attributeTypes}
              typeOptions={this.props.actionTypes}
              renderBasicAttributes={this.renderBasicAttributes}
              renderButtons={this.renderActionButtons}
              updateTypeSpecifier={this.updateTypeSpecifier}
              updateType={this.updateActionType}
              updateAttribute={this.updateActionAttribute}
              showAttributes={this.state.showAttributes}
            />
          </Sticky>
          { this.state.creating &&
          <EditorForm
            targetId={this.props.action.id}
            attributes={{}}
            attributeTypes={this.props.attributeTypes}
            elementConfig={{
              elementTypes: this.props.recordTypes,
              createRecord: this.createRecord
            }}
            editorConfig={{
              type: 'record',
              action: 'add'
            }}
            closeEditorForm={this.cancelRecordCreation}
            displayMessage={this.props.displayMessage}
          />
          }
          { this.state.editing &&
          <EditorForm
            targetId={this.state.record.id}
            attributes={this.state.record.attributes}
            attributeTypes={this.props.attributeTypes}
            elementConfig={{
              elementTypes: this.props.recordTypes,
              elementId: this.state.record.id,
              typeSpecifier: this.state.record.attributes.TypeSpecifier,
              editWithForm: this.editRecordWithForm
            }}
            editorConfig={{
              type: 'record',
              action: 'edit'
            }}
            closeEditorForm={this.cancelRecordEdit}
            displayMessage={this.props.displayMessage}
          />
          }
          { this.state.complementing &&
          <EditorForm
            targetId={this.state.record.id}
            attributes={this.state.record.attributes}
            attributeTypes={this.props.attributeTypes}
            elementConfig={{
              elementTypes: this.props.recordTypes,
              elementId: this.state.record.id,
              typeSpecifier: this.state.record.attributes.TypeSpecifier,
              editWithForm: this.editRecordWithForm
            }}
            editorConfig={{
              type: 'record',
              action: 'complement'
            }}
            closeEditorForm={this.cancelRecordComplement}
            displayMessage={this.props.displayMessage}
          />
          }
          { !this.state.editing && !this.state.complementing && !!recordElements.length &&
          <div>
            <span className='col-xs-6 attribute-label'>
            Asiakirjatyypin tarkenne
            </span>
            <span className='col-xs-6 attribute-label'>
            Tyyppi
            </span>
            <div
              className={classnames('col-xs-12 records', { 'records-editing': this.props.documentState === 'edit' })}>
              { recordElements }
            </div>
          </div>
          }

          { this.state.deleting &&
          <Popup
            content={
              <DeleteView
                type='action'
                target={this.state.typeSpecifier}
                action={() => this.delete()}
                cancel={() => this.cancelDeletion()}
              />
            }
            closePopup={() => this.cancelDeletion()}
          />
          }
          { this.state.showReorderView &&
          <Popup
            content={
              <ReorderView
                target='record'
                toggleReorderView={() => this.toggleReorderView()}
                keys={this.props.action.records}
                values={this.props.records}
                changeOrder={this.props.changeOrder}
                parent={this.props.action.id}
                parentName={this.state.typeSpecifier}
              />
            }
            closePopup={() => this.toggleReorderView()}
          />
          }
          { this.state.showImportView &&
          <Popup
            content={
              <ImportView
                level='record'
                toggleImportView={() => this.toggleImportView()}
                title='asiakirjoja'
                targetText={'toimenpiteeseen ' + action.name}
                itemsToImportText='asiakirjat'
                phasesOrder={this.props.phasesOrder}
                phases={this.props.phases}
                actions={this.props.actions}
                records={this.props.records}
                importItems={this.props.importItems}
                parent={action.id}
                parentName={action.name}
              />
            }
            closePopup={() => this.toggleImportView()}
          />
          }
        </StickyContainer>
      </div>
    );
  }
}

Action.propTypes = {
  action: React.PropTypes.object.isRequired,
  actionTypes: React.PropTypes.object.isRequired,
  actions: React.PropTypes.object.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  changeOrder: React.PropTypes.func.isRequired,
  displayMessage: React.PropTypes.func.isRequired,
  documentState: React.PropTypes.string.isRequired,
  // editAction: React.PropTypes.func.isRequired,
  editActionAttribute: React.PropTypes.func.isRequired,
  editRecord: React.PropTypes.func.isRequired,
  editRecordAttribute: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired,
  phases: React.PropTypes.object.isRequired || React.PropTypes.array.isRequired,
  phasesOrder: React.PropTypes.array.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  records: React.PropTypes.object.isRequired,
  removeAction: React.PropTypes.func.isRequired,
  removeRecord: React.PropTypes.func.isRequired
};

export default Action;
