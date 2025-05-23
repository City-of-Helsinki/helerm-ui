/* eslint-disable sonarjs/todo-tag */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-access-state-in-setstate */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import update from 'immutability-helper';
import Sticky from 'react-sticky-el';
import './Action.scss';
import { uniqueId } from 'lodash';

import Record from '../Record/Record';
import Attributes from '../Attribute/Attributes';
import EditorForm from '../EditorForm/EditorForm';
import Popup from '../../Popup';
import Dropdown from '../../Dropdown';
import DeleteView from '../DeleteView/DeleteView';
import ReorderView from '../Reorder/ReorderView';
import ImportView from '../ImportView/ImportView';
import { DROPDOWN_ITEMS } from '../../../constants';
import { attributeButton } from '../../../utils/attributeHelper';

class Action extends Component {
  constructor(props) {
    super(props);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onTypeInputChange = this.onTypeInputChange.bind(this);
    this.onTypeSpecifierChange = this.onTypeSpecifierChange.bind(this);
    this.createRecord = this.createRecord.bind(this);
    this.cancelRecordCreation = this.cancelRecordCreation.bind(this);
    this.editActionForm = this.editActionForm.bind(this);
    this.editActionWithForm = this.editActionWithForm.bind(this);
    this.cancelRecordComplement = this.cancelRecordComplement.bind(this);
    this.updateTypeSpecifier = this.updateTypeSpecifier.bind(this);
    this.updateActionType = this.updateActionType.bind(this);
    this.updateActionAttribute = this.updateActionAttribute.bind(this);
    this.renderActionButtons = this.renderActionButtons.bind(this);
    this.renderBasicAttributes = this.renderBasicAttributes.bind(this);
    this.disableEditMode = this.disableEditMode.bind(this);
    this.onEditFormShowMoreAction = this.onEditFormShowMoreAction.bind(this);
    this.onEditFormShowMore = this.onEditFormShowMore.bind(this);
    this.complementRecordAdd = this.complementRecordAdd.bind(this);
    this.scrollToAction = this.scrollToAction.bind(this);
    this.scrollToRecord = this.scrollToRecord.bind(this);
    this.updateTopOffsetForSticky = this.updateTopOffsetForSticky.bind(this);

    this.state = {
      attributes: this.props.action.attributes,
      complementingAction: false,
      complementingRecordAdd: false,
      creatingRecord: false,
      deleting: false,
      editingAction: false,
      editingType: false,
      editingTypeSpecifier: false,
      mode: 'view',
      record: null,
      showImportView: false,
      showReorderView: false,
      type: this.props.action.attributes.ActionType || null,
      typeSpecifier: this.props.action.attributes.TypeSpecifier || null,
      complementRecordAdd: false,
      topOffset: 0,
    };

    this.records = {};
  }

  componentDidMount() {
    this.updateTopOffsetForSticky();
    window.addEventListener('resize', this.updateTopOffsetForSticky);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps?.action.attributes.TypeSpecifier) {
      this.setState({
        typeSpecifier: nextProps?.action.attributes.TypeSpecifier,
      });
    }
    if (nextProps?.action.attributes.ActionType) {
      this.setState({ type: nextProps?.action.attributes.ActionType });
    }
    if (nextProps.documentState === 'view') {
      this.disableEditMode();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateTopOffsetForSticky);
  }

  onEditFormShowMore(e, recordAttributes) {
    // TODO: handle merge the attributes of createNewRecordForm here
    e.preventDefault();
    const newAttrs = {};
    Object.keys(recordAttributes).forEach((key) => {
      if (recordAttributes?.[key].value) {
        Object.assign(newAttrs, { [key]: recordAttributes?.[key].value });
      }
    });
    this.setState(
      {
        record: {
          ...this.state.record,
          attributes: newAttrs,
        },
      },
      () => {
        this.setState({
          complementingRecordAdd: !this.state.complementingRecordAdd,
          creatingRecord: !this.state.creatingRecord,
        });
      },
    );
  }

  onEditFormShowMoreAction(e) {
    e.preventDefault();
    this.setState((prevState) => ({
      complementingAction: !prevState.complementingAction,
      editingAction: !prevState.editingAction,
    }));
  }

  onTypeSpecifierChange(event) {
    this.setState({ typeSpecifier: event.target.value });
  }

  onTypeChange(value) {
    this.setState(
      update(this.state, {
        type: {
          $set: value,
        },
      }),
    );
  }

  onTypeInputChange(event) {
    this.setState({ type: event.target.value });
  }

  getTargetText(value) {
    if (value === undefined) {
      return '';
    }
    return value;
  }

  toggleImportView() {
    const current = this.state.showImportView;
    this.setState({ showImportView: !current });
  }

  editTypeSpecifier() {
    if (this.props.documentState === 'edit') {
      this.setState({ editingTypeSpecifier: true, mode: 'edit' });
    }
  }

  editActionForm() {
    if (this.props.documentState === 'edit') {
      this.setState({ editingAction: true, mode: 'edit' });
    }
  }

  complementRecordAdd() {
    if (this.props.documentState !== 'edit') {
      this.setState({ complementRecordAdd: true });
    }
  }

  disableEditMode() {
    this.setState({
      editingTypeSpecifier: false,
      editingType: false,
      editingAction: false,
      complementingAction: false,
      mode: 'view',
    });
  }

  toggleReorderView() {
    const current = this.state.showReorderView;
    this.setState({ showReorderView: !current });
  }

  updateTopOffsetForSticky() {
    // calculates heights for elements that are already sticking
    // (navigation menu, tos header and phase title)
    const headerEl = document.getElementById('single-tos-header-container');
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const menuEl = document.getElementById('navigation-menu');
    const menuHeight = menuEl ? menuEl.getBoundingClientRect().height : 0;
    const phaseTitles = document.getElementsByClassName('phase-title-sticky');
    let phaseTitleHeight = 35; // magic number for a title that fits on one row
    if (phaseTitles.length) {
      phaseTitleHeight = phaseTitles[phaseTitles.length - 1].getBoundingClientRect().height;
    }
    this.setState({ topOffset: headerHeight + menuHeight + phaseTitleHeight });
  }

  updateTypeSpecifier(event) {
    event.preventDefault();
    const updatedTypeSpecifier = {
      typeSpecifier: this.state.typeSpecifier,
      actionId: this.props.action.id,
    };
    this.props.editActionAttribute(updatedTypeSpecifier);
    this.disableEditMode();
  }

  updateActionType(event) {
    event.preventDefault();
    const updatedActionType = {
      type: this.state.type,
      actionId: this.props.action.id,
    };
    this.props.editActionAttribute(updatedActionType);
    this.disableEditMode();
  }

  updateActionAttribute(attribute, attributeIndex, actionId) {
    this.setState({
      attributes: {
        [attributeIndex]: attribute,
      },
    });
    const updatedActionAttribute = { attribute, attributeIndex, actionId };
    this.props.editActionAttribute(updatedActionAttribute);
  }

  editActionWithForm(attributes, actionId, disableEditMode = true) {
    this.setState({
      attributes,
      typeSpecifier: attributes.TypeSpecifier,
      type: attributes.ActionType,
    });
    this.props.editAction(attributes, actionId);
    if (disableEditMode) {
      this.disableEditMode();
    }
  }

  createNewRecord() {
    this.setState({ creatingRecord: true, record: { attributes: {} } });
  }

  cancelRecordCreation() {
    this.setState({ creatingRecord: false });
  }

  cancelRecordComplement() {
    this.setState({
      complementingRecordAdd: false,
      recordId: undefined,
    });
  }

  delete() {
    this.setState({ deleting: false });
    this.props.removeAction(this.props.action.id, this.props.action.phase);
  }

  cancelDeletion() {
    this.setState({ deleting: false });
  }

  createRecord(attributes, actionId) {
    this.setState({
      creatingRecord: false,
      complementingRecordAdd: false,
    });
    this.props.addRecord(attributes, actionId);
  }

  generateRecords(records) {
    const elements = [];
    Object.keys(records).forEach((key) => {
      if (Object.hasOwn(this.props.records, records[key])) {
        elements.push(
          <Record
            key={key}
            record={this.props.records[records[key]]}
            editRecord={this.props.editRecord}
            editRecordAttribute={this.props.editRecordAttribute}
            removeRecord={this.props.removeRecord}
            recordTypes={this.props.recordTypes}
            documentState={this.props.documentState}
            attributeTypes={this.props.attributeTypes}
            displayMessage={this.props.displayMessage}
            setRecordVisibility={this.props.setRecordVisibility}
            ref={(element) => {
              this.records[records[key]] = element;
            }}
          />,
        );
      }
    });
    return elements;
  }

  generateDropdownItems() {
    return [
      { ...DROPDOWN_ITEMS[0], text: 'Uusi asiakirja', action: () => this.createNewRecord() },
      { ...DROPDOWN_ITEMS[1], text: 'Muokkaa toimenpidettä', action: () => this.editActionForm() },
      { ...DROPDOWN_ITEMS[2], text: 'Järjestä asiakirjoja', action: () => this.toggleReorderView() },
      { ...DROPDOWN_ITEMS[3], text: 'Tuo asiakirjoja', action: () => this.toggleImportView() },
      { ...DROPDOWN_ITEMS[4], text: 'Poista toimenpide', action: () => this.setState({ deleting: true }) },
    ];
  }

  scrollToAction() {
    if (this.element) {
      const parentOffset = this.element.offsetParent ? this.element.offsetParent.offsetTop : 0;
      window.scrollTo(0, parentOffset + this.element.offsetTop);
    }
  }

  scrollToRecord(recordId) {
    const record = this.records[recordId] || null;
    if (this.element && record) {
      const parentOffset = this.element.offsetParent ? this.element.offsetParent.offsetTop : 0;
      record.scrollToRecord(parentOffset + this.element.offsetTop);
    }
  }

  renderActionButtons() {
    const actionDropdownItems = this.generateDropdownItems();

    return (
      <div className='action-buttons'>
        {this.props.documentState === 'edit' && (
          <span className='action-dropdown-button'>
            <Dropdown items={actionDropdownItems} extraSmall />
          </span>
        )}
        {attributeButton(this.props.action.attributes, this.props.attributeTypes) && (
          <button
            type='button'
            className='btn btn-info btn-xs record-button pull-right'
            onClick={() => this.props.setActionVisibility(this.props.action.id, !this.props.action.is_open)}
          >
            <span className={`fa-solid ${this.props.action.is_open ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
          </button>
        )}
      </div>
    );
  }

  renderBasicAttributes() {
    const classNames = classnames([
      'col-xs-12',
      'basic-attribute',
      this.props.documentState === 'edit' ? 'editable' : null,
    ]);
    let typeSpecifier = (
      <span
        className={classNames}
        onClick={() => this.editTypeSpecifier()}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            this.editTypeSpecifier();
          }
        }}
      >
        {this.state.typeSpecifier}
      </span>
    );

    if (this.state.mode === 'edit' && this.state.editingTypeSpecifier) {
      typeSpecifier = (
        <div className='col-xs-11 action-title-input row'>
          <form onSubmit={this.updateTypeSpecifier}>
            <input
              className='input-title form-control col-xs-11'
              value={this.state.typeSpecifier || ''}
              onChange={this.onTypeSpecifierChange}
              onBlur={this.updateTypeSpecifier}
              autoFocus
            />
          </form>
        </div>
      );
    }

    if (this.props.action.is_open && this.props.action.records.length) {
      return (
        <Sticky
          topOffset={-1 * this.state.topOffset}
          bottomOffset={this.state.topOffset}
          boundaryElement='.actions '
          hideOnBoundaryHit
          stickyStyle={{
            position: 'fixed',
            top: this.state.topOffset,
            left: 0,
          }}
          stickyClassName='action-title-sticky'
          className='action-title action-open'
        >
          <div className='basic-attributes'>{typeSpecifier}</div>
        </Sticky>
      );
    }

    return (
      <div className='action-title action-closed'>
        <div className='basic-attributes'>{typeSpecifier}</div>
      </div>
    );
  }

  render() {
    // TODO: Handle errors where we don't have an valid action (i.e 400 error from API)
    const { action } = this.props;
    const recordElements = action?.records ? this.generateRecords(action?.records) : [];
    const reorderRecords = this.props.action.records.map((recordId) => ({
      id: recordId,
      key: uniqueId(recordId),
    }));

    return (
      <div
        className='action row'
        ref={(element) => {
          this.element = element;
        }}
      >
        {this.state.mode === 'edit' && this.state.editingAction && (
          <EditorForm
            onShowMore={this.onEditFormShowMoreAction}
            targetId={this.props.action.id}
            attributes={this.props.action.attributes}
            attributeTypes={this.props.attributeTypes}
            elementConfig={{
              elementTypes: this.props.actionTypes,
              editWithForm: this.editActionWithForm,
            }}
            editorConfig={{
              type: 'action',
              action: 'edit',
            }}
            closeEditorForm={this.disableEditMode}
            displayMessage={this.props.displayMessage}
          />
        )}
        {this.state.mode === 'edit' && this.state.complementingAction && (
          <EditorForm
            onShowMore={this.onEditFormShowMoreAction}
            targetId={this.props.action.id}
            attributes={this.props.action.attributes}
            attributeTypes={this.props.attributeTypes}
            elementConfig={{
              elementTypes: this.props.actionTypes,
              editWithForm: this.editActionWithForm,
            }}
            editorConfig={{
              type: 'action',
              action: 'complement',
            }}
            closeEditorForm={this.disableEditMode}
            displayMessage={this.props.displayMessage}
          />
        )}
        {!this.state.editingAction && !this.state.complementingAction && (
          <div>
            <div className='box'>
              <Attributes
                element={action}
                documentState={this.props.documentState}
                type='action'
                attributeTypes={this.props.attributeTypes}
                typeOptions={this.props.actionTypes}
                renderBasicAttributes={this.renderBasicAttributes}
                renderButtons={this.renderActionButtons}
                updateTypeSpecifier={this.updateTypeSpecifier}
                updateType={this.updateActionType}
                updateAttribute={this.updateActionAttribute}
                showAttributes={action.is_open}
              />
              {this.state.creatingRecord && (
                <EditorForm
                  onShowMoreForm={this.onEditFormShowMore}
                  targetId={this.props.action.id}
                  attributes={this.state.record.attributes}
                  attributeTypes={this.props.attributeTypes}
                  elementConfig={{
                    elementTypes: this.props.recordTypes,
                    createRecord: this.createRecord,
                  }}
                  editorConfig={{
                    type: 'record',
                    action: 'add',
                  }}
                  closeEditorForm={this.cancelRecordCreation}
                  displayMessage={this.props.displayMessage}
                />
              )}
              {this.state.complementingRecordAdd && (
                <EditorForm
                  onShowMoreForm={this.onEditFormShowMore}
                  targetId={this.props.action.id}
                  attributes={this.state.record.attributes}
                  attributeTypes={this.props.attributeTypes}
                  elementConfig={{
                    elementTypes: this.props.recordTypes,
                    createRecord: this.createRecord,
                  }}
                  editorConfig={{
                    type: 'record',
                    action: 'complement',
                    from: 'newRecord',
                  }}
                  complementRecordAdd={this.complementRecordAdd}
                  closeEditorForm={this.cancelRecordComplement}
                  displayMessage={this.props.displayMessage}
                />
              )}
            </div>
            {!!recordElements.length && (
              <div className='attribute-labels-container'>
                <div
                  className={classnames('col-xs-12 records box', {
                    'records-editing': this.props.documentState === 'edit',
                  })}
                >
                  <h4>Asiakirjat</h4>
                  {recordElements}
                </div>
              </div>
            )}
          </div>
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
                items={reorderRecords}
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
                targetText={`toimenpiteeseen "${this.getTargetText(action.attributes.TypeSpecifier)}"`}
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
    );
  }
}

Action.propTypes = {
  action: PropTypes.object.isRequired,
  actionTypes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  addRecord: PropTypes.func.isRequired,
  attributeTypes: PropTypes.object.isRequired,
  changeOrder: PropTypes.func.isRequired,
  displayMessage: PropTypes.func.isRequired,
  documentState: PropTypes.string.isRequired,
  editAction: PropTypes.func.isRequired,
  editActionAttribute: PropTypes.func.isRequired,
  editRecord: PropTypes.func.isRequired,
  editRecordAttribute: PropTypes.func.isRequired,
  importItems: PropTypes.func.isRequired,
  phases: PropTypes.object.isRequired,
  phasesOrder: PropTypes.array.isRequired,
  recordTypes: PropTypes.object.isRequired,
  records: PropTypes.object.isRequired,
  removeAction: PropTypes.func.isRequired,
  removeRecord: PropTypes.func.isRequired,
  setActionVisibility: PropTypes.func.isRequired,
  setRecordVisibility: PropTypes.func.isRequired,
};

export default Action;
