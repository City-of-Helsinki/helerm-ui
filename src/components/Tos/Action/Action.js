import React from 'react';
import classnames from 'classnames';
import update from 'immutability-helper';
import { StickyContainer, Sticky } from 'react-sticky';
import './Action.scss';

import Record from '../Record/Record';
import Attributes from '../Attribute/Attributes';
import EditorForm from '../EditorForm/EditorForm';
import Popup from 'components/Popup';
import Dropdown from 'components/Dropdown';
// import DropdownInput from '../DropdownInput/DropdownInput';
import DeleteView from '../DeleteView/DeleteView';
import ReorderView from '../Reorder/ReorderView';
import ImportView from '../ImportView/ImportView';

export class Action extends React.Component {
  constructor (props) {
    super(props);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onTypeInputChange = this.onTypeInputChange.bind(this);
    this.onTypeSpecifierChange = this.onTypeSpecifierChange.bind(this);
    this.createRecord = this.createRecord.bind(this);
    this.cancelRecordCreation = this.cancelRecordCreation.bind(this);
    this.editActionForm = this.editActionForm.bind(this);
    this.editActionWithForm = this.editActionWithForm.bind(this);
    this.editRecordForm = this.editRecordForm.bind(this);
    this.complementRecordForm = this.complementRecordForm.bind(this);
    this.editRecordWithForm = this.editRecordWithForm.bind(this);
    this.cancelRecordEdit = this.cancelRecordEdit.bind(this);
    this.cancelRecordComplement = this.cancelRecordComplement.bind(this);
    this.updateTypeSpecifier = this.updateTypeSpecifier.bind(this);
    this.updateActionType = this.updateActionType.bind(this);
    this.updateActionAttribute = this.updateActionAttribute.bind(this);
    this.renderActionButtons = this.renderActionButtons.bind(this);
    this.renderBasicAttributes = this.renderBasicAttributes.bind(this);
    this.toggleAttributeVisibility = this.toggleAttributeVisibility.bind(this);
    this.disableEditMode = this.disableEditMode.bind(this);
    this.onEditFormShowMoreAction = this.onEditFormShowMoreAction.bind(this);
    this.onEditFormShowMoreRecord = this.onEditFormShowMoreRecord.bind(this);
    this.onEditFormShowMoreRecordAdd = this.onEditFormShowMoreRecordAdd.bind(this);
    this.state = {
      attributes: this.props.action.attributes,
      complementingAction: false,
      complementingRecord: false,
      complementingRecordAdd: false,
      creatingRecord: false,
      deleting: false,
      editingAction: false,
      editingRecord: false,
      editingType: false,
      editingTypeSpecifier: false,
      mode: 'view',
      showAttributes: false,
      showImportView: false,
      showReorderView: false,
      type: this.props.action.attributes.ActionType || null,
      typeSpecifier: this.props.action.attributes.TypeSpecifier || null
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.action && nextProps.action.attributes.TypeSpecifier) {
      this.setState({
        typeSpecifier: nextProps.action.attributes.TypeSpecifier
      });
    }
    if (nextProps.action && nextProps.action.attributes.ActionType) {
      this.setState({ type: nextProps.action.attributes.ActionType });
    }
    if (nextProps.documentState === 'view') {
      this.disableEditMode();
    }
  }

  onEditFormShowMoreAction (e) {
    e.preventDefault();
    this.setState(prevState => ({
      complementingAction: !prevState.complementingAction,
      editingAction: !prevState.editingAction
    })
    );
  }

  mergeChildAttributesToStateAttributes = (stateAttrs, childattrs) => {
    const newAttrs = {};
    // Gather attributes from child & assign them to current state record
    Object.keys(stateAttrs).map((key) => Object.assign(newAttrs, { [key]: childattrs[key] && childattrs[key]['value'] }));
    return newAttrs;
  }

  onEditFormShowMoreRecord (e, { newAttributes }) {
    e.preventDefault();
    this.setState(prevState => {
      const newAttrs = this.mergeChildAttributesToStateAttributes(prevState.record.attributes, newAttributes);

      return {
        complementingRecord: !prevState.complementingRecord,
        editingRecord: !prevState.editingRecord,
        record: {
          ...prevState.record,
          attributes: {
            ...prevState.record.attributes,
            ...newAttrs
          }
        }
      };
    });
  }

  toggleReorderView () {
    const current = this.state.showReorderView;
    this.setState({ showReorderView: !current });
  }

  toggleImportView () {
    const current = this.state.showImportView;
    this.setState({ showImportView: !current });
  }

  toggleAttributeVisibility () {
    const currentVisibility = this.state.showAttributes;
    const newVisibility = !currentVisibility;
    this.setState({ showAttributes: newVisibility });
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

  editActionForm () {
    if (this.props.documentState === 'edit') {
      this.setState({ editingAction: true, mode: 'edit' });
    }
  }

  // complementActionForm () {
  //   if (this.props.documentState === 'edit') {
  //     this.setState({ complementingAction: true, mode: 'edit' });
  //   }
  // }

  disableEditMode () {
    this.setState({
      editingTypeSpecifier: false,
      editingType: false,
      editingAction: false,
      complementingAction: false,
      editingRecord: false,
      complementingRecord: false,
      mode: 'view'
    });
  }

  onTypeSpecifierChange (event) {
    this.setState({ typeSpecifier: event.target.value });
  }

  onTypeChange (value) {
    this.setState(
      update(this.state, {
        type: {
          $set: value
        }
      })
    );
  }

  onTypeInputChange (event) {
    this.setState({ type: event.target.value });
  }

  updateTypeSpecifier (event) {
    event.preventDefault();
    const updatedTypeSpecifier = {
      typeSpecifier: this.state.typeSpecifier,
      actionId: this.props.action.id
    };
    this.props.editActionAttribute(updatedTypeSpecifier);
    this.disableEditMode();
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

  updateActionAttribute (attribute, attributeIndex, actionId) {
    this.setState({
      attributes: {
        [attributeIndex]: attribute
      }
    });
    const updatedActionAttribute = { attribute, attributeIndex, actionId };
    this.props.editActionAttribute(updatedActionAttribute);
  }

  editActionWithForm (attributes, actionId, disableEditMode = true) {
    this.setState({
      attributes: attributes,
      typeSpecifier: attributes.TypeSpecifier,
      type: attributes.ActionType
    });
    this.props.editAction(attributes, actionId);
    if (disableEditMode) {
      this.disableEditMode();
    }
  }

  createNewRecord () {
    this.setState({ creatingRecord: true });
  }

  cancelRecordCreation () {
    this.setState({ creatingRecord: false });
  }

  editRecordForm (recordId, recordAttributes) {
    this.setState(
      {
        record: {
          id: recordId,
          attributes: recordAttributes
        }
      },
      () => {
        this.setState({ editingRecord: true });
      }
    );
  }

  cancelRecordEdit () {
    this.setState({
      editingRecord: false,
      recordId: undefined
    });
  }

  complementRecordForm (e, recordAttributes) {
    const newAttrs = {};
    Object.keys(recordAttributes).map((key) => Object.assign(newAttrs, { [key]: recordAttributes[key] && recordAttributes[key]['value'] }));

    this.setState(
      {
        record: {
          ...this.state.record,
          attributes: newAttrs
        }
      },
      () => {
        this.setState({
          complementingRecordAdd: !this.state.complementingRecordAdd,
          creatingRecord: !this.state.creatingRecord
        });
      }
    );
  }

  onEditFormShowMoreRecordAdd (e, { newAttributes }) {
    // TODO: handle merge the attributes of createNewRecordForm here
    this.setState(
      {
        record: {
          attributes: {
            ...this.state.record.attributes
          }
        }
      },
      () => {
        this.setState({
          complementingRecordAdd: !this.state.complementingRecordAdd,
          creatingRecord: !this.state.creatingRecord
        });
      }
    );
  }

  cancelRecordComplement () {
    this.setState({
      complementingRecord: false,
      recordId: undefined
    });
  }

  editRecordWithForm (attributes, recordId, disableEditMode = true) {
    this.props.editRecord(attributes, recordId);
    if (disableEditMode) {
      this.disableEditMode();
    }
  }

  delete () {
    this.setState({ deleting: false });
    this.props.removeAction(this.props.action.id, this.props.action.phase);
  }

  cancelDeletion () {
    this.setState({ deleting: false });
  }

  createRecord (attributes, actionId) {
    this.setState({ creatingRecord: false });
    this.props.addRecord(attributes, actionId);
  }

  generateRecords (records) {
    const elements = [];
    for (const key in records) {
      if (this.props.records.hasOwnProperty(records[key])) {
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

  generateDropdownItems () {
    return [
      {
        text: 'Uusi asiakirja',
        icon: 'fa-file-text',
        style: 'btn-primary',
        action: () => this.createNewRecord()
      },
      {
        text: 'Muokkaa toimenpidettä',
        icon: 'fa-pencil',
        style: 'btn-primary',
        action: () => this.editActionForm()
      },
      // {
      //   text: 'Täydennä metatietoja',
      //   icon: 'fa-plus-square',
      //   style: 'btn-primary',
      //   action: () => this.complementActionForm()
      // },
      {
        text: 'Järjestä asiakirjoja',
        icon: 'fa-th-list',
        style: 'btn-primary',
        action: () => this.toggleReorderView()
      },
      {
        text: 'Tuo asiakirjoja',
        icon: 'fa-download',
        style: 'btn-primary',
        action: () => this.toggleImportView()
      },
      {
        text: 'Poista toimenpide',
        icon: 'fa-trash',
        style: 'btn-delete',
        action: () => this.setState({ deleting: true })
      }
    ];
  }

  showAttributeButton (attributes) {
    const { attributeTypes } = this.props;
    const actualAttributes = [];
    for (const key in attributes) {
      if (key !== 'TypeSpecifier' && key !== 'ActionType') {
        actualAttributes.push(key);
      }
    }
    for (const key in attributeTypes) {
      if (attributeTypes.hasOwnProperty(key) && attributeTypes[key].defaultIn.indexOf('action') >= 0) {
        actualAttributes.push(key);
      }
    }
    if (actualAttributes.length) {
      return true;
    }
    return false;
  }

  renderActionButtons () {
    const actionDropdownItems = this.generateDropdownItems();

    return (
      <div className='action-buttons'>
        {this.props.documentState === 'edit' && (
          <span className='action-dropdown-button'>
            <Dropdown items={actionDropdownItems} extraSmall={true} />
          </span>
        )}
        {this.showAttributeButton(this.props.action.attributes) && (
          <button
            className='btn btn-info btn-xs record-button pull-right'
            onClick={this.toggleAttributeVisibility}
          >
            <span
              className={
                'fa ' + (this.state.showAttributes ? 'fa-minus' : 'fa-plus')
              }
              aria-hidden='true'
            />
          </button>
        )}
      </div>
    );
  }

  renderBasicAttributes () {
    const classNames = classnames([
      'col-md-6',
      'basic-attribute',
      this.props.documentState === 'edit' ? 'editable' : null
    ]);
    let typeSpecifier = (
      <span className={classNames} onClick={() => this.editTypeSpecifier()}>
        {this.state.typeSpecifier}
      </span>
    );
    // let actionType =
    //   (<span className={classNames} onClick={() => this.editType()}>
    //     {this.state.type}
    //   </span>
    // );

    if (this.state.mode === 'edit') {
      if (this.state.editingTypeSpecifier) {
        typeSpecifier = (
          <div className='col-md-6 action-title-input row'>
            <form onSubmit={this.updateTypeSpecifier}>
              <input
                className='input-title form-control col-xs-11'
                value={this.state.typeSpecifier || ''}
                onChange={this.onTypeSpecifierChange}
                onBlur={this.updateTypeSpecifier}
                autoFocus={true}
              />
            </form>
          </div>
        );
      }
      // if (this.state.editingType) {
      //   actionType = (
      //     <div className='col-md-6'>
      //       <form onSubmit={this.updateActionType}>
      //         <DropdownInput
      //           type={'action'}
      //           valueState={this.state.type}
      //           options={this.props.actionTypes}
      //           onChange={this.onTypeChange}
      //           onInputChange={this.onTypeInputChange}
      //           onSubmit={this.updateActionType}
      //         />
      //       </form>
      //     </div>
      //   );
      // }
    }

    return (
      <Sticky
        className={
          'action-title ' +
          (this.state.showAttributes ? 'action-open' : 'action-closed')
        }
      >
        <div className='basic-attributes'>
          {/* {actionType} */}
          {typeSpecifier}
        </div>
      </Sticky>
    );
  }

  getTargetText (value) {
    if (value === undefined) {
      return '';
    }
    return value;
  }

  render () {
    // TODO: Handle errors where we don't have an valid action (i.e 400 error from API)
    const { action } = this.props;
    const recordElements =
      action && action.records ? this.generateRecords(action.records) : [];

    return (
      <div>
        <div className='action row'>
          {this.state.mode === 'edit' &&
            this.state.editingAction && (
              <EditorForm
                onShowMore={this.onEditFormShowMoreAction}
                targetId={this.props.action.id}
                attributes={this.props.action.attributes}
                attributeTypes={this.props.attributeTypes}
                elementConfig={{
                  elementTypes: this.props.actionTypes,
                  editWithForm: this.editActionWithForm
                }}
                editorConfig={{
                  type: 'action',
                  action: 'edit'
                }}
                closeEditorForm={this.disableEditMode}
                displayMessage={this.props.displayMessage}
              />
            )}
          {this.state.mode === 'edit' &&
            this.state.complementingAction && (
              <EditorForm
                onShowMore={this.onEditFormShowMoreAction}
                targetId={this.props.action.id}
                attributes={this.props.action.attributes}
                attributeTypes={this.props.attributeTypes}
                elementConfig={{
                  elementTypes: this.props.actionTypes,
                  editWithForm: this.editActionWithForm
                }}
                editorConfig={{
                  type: 'action',
                  action: 'complement'
                }}
                closeEditorForm={this.disableEditMode}
                displayMessage={this.props.displayMessage}
              />
            )}
          {!this.state.editingAction &&
            !this.state.complementingAction && (
              <StickyContainer className='action row box'>
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
                {
                 this.state.creatingRecord && (
                 <EditorForm
                    onShowMoreForm={this.complementRecordForm}
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
                )}
                {this.state.editingRecord && (
                  <EditorForm
                    onShowMore={this.onEditFormShowMoreRecord}
                    targetId={this.state.record.id}
                    attributes={this.state.record.attributes}
                    attributeTypes={this.props.attributeTypes}
                    elementConfig={{
                      elementTypes: this.props.recordTypes,
                      editWithForm: this.editRecordWithForm
                    }}
                    editorConfig={{
                      type: 'record',
                      action: 'edit'
                    }}
                    closeEditorForm={this.cancelRecordEdit}
                    displayMessage={this.props.displayMessage}
                  />
                )}
                {this.state.complementingRecord && (
                  <EditorForm
                    onShowMore={this.onEditFormShowMoreRecord}
                    targetId={this.state.record.id}
                    attributes={this.state.record.attributes}
                    attributeTypes={this.props.attributeTypes}
                    elementConfig={{
                      elementTypes: this.props.recordTypes,
                      editWithForm: this.editRecordWithForm
                    }}
                    editorConfig={{
                      type: 'record',
                      action: 'complement'
                    }}
                    closeEditorForm={this.cancelRecordComplement}
                    displayMessage={this.props.displayMessage}
                  />
                )}

                {this.state.complementingRecordAdd && (
                  <EditorForm
                    onShowMore={this.onEditFormShowMoreRecordAdd}
                    targetId={this.state.record.id}
                    attributes={this.state.record.attributes}
                    attributeTypes={this.props.attributeTypes}
                    elementConfig={{
                      elementTypes: this.props.recordTypes,
                      editWithForm: this.editRecordWithForm
                    }}
                    editorConfig={{
                      type: 'record',
                      action: 'complement'
                    }}
                    closeEditorForm={this.cancelRecordComplement}
                    displayMessage={this.props.displayMessage}
                  />
                )}
                {!this.state.editingRecord &&
                  !this.state.complementingRecord &&
                  !!recordElements.length && (
                    <div className='attribute-labels-container'>
                      <div className='attribute-labels'>
                        <span className='col-xs-6 attribute-label'>
                          {'Asiakirjatyyppi'}
                        </span>
                        <span className='col-xs-6 attribute-label'>
                          {'Asiakirjatyypin tarkenne'}
                        </span>
                      </div>
                      <div
                        className={classnames('col-xs-12 records', {
                          'records-editing': this.props.documentState === 'edit'
                        })}
                      >
                        {recordElements}
                      </div>
                    </div>
                  )}
              </StickyContainer>
            )}
          {this.state.deleting && (
            <Popup
              content={
                <DeleteView
                  type='action'
                  target={this.state.typeSpecifier || this.state.type || '---'}
                  action={() => this.delete()}
                  cancel={() => this.cancelDeletion()}
                />
              }
              closePopup={() => this.cancelDeletion()}
            />
          )}
          {this.state.showReorderView && (
            <Popup
              content={
                <ReorderView
                  target='record'
                  toggleReorderView={() => this.toggleReorderView()}
                  keys={this.props.action.records}
                  values={this.props.records}
                  changeOrder={this.props.changeOrder}
                  parent={this.props.action.id}
                  attributeTypes={this.props.attributeTypes}
                  parentName={this.state.typeSpecifier || this.state.type}
                />
              }
              closePopup={() => this.toggleReorderView()}
            />
          )}
          {this.state.showImportView && (
            <Popup
              content={
                <ImportView
                  level='record'
                  toggleImportView={() => this.toggleImportView()}
                  title='asiakirjoja'
                  targetText={
                    'toimenpiteeseen "' +
                    this.getTargetText(action.attributes.TypeSpecifier) +
                    '"'
                  }
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
          )}
        </div>
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
  editAction: React.PropTypes.func.isRequired,
  editActionAttribute: React.PropTypes.func.isRequired,
  editRecord: React.PropTypes.func.isRequired,
  editRecordAttribute: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired,
  phases: React.PropTypes.object.isRequired,
  phasesOrder: React.PropTypes.array.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  records: React.PropTypes.object.isRequired,
  removeAction: React.PropTypes.func.isRequired,
  removeRecord: React.PropTypes.func.isRequired
};

export default Action;
