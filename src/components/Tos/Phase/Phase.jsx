/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import forEach from 'lodash/forEach';
import update from 'immutability-helper';
import { RenderPropSticky } from 'react-sticky-el';
import './Phase.scss';
import { uniqueId } from 'lodash';

import Action from '../Action/Action';
import Attributes from '../Attribute/Attributes';
import AddElementInput from '../AddElementInput/AddElementInput';
import DeleteView from '../DeleteView/DeleteView';
import Popup from '../../Popup';
import Dropdown from '../../Dropdown';
import DropdownInput from '../DropdownInput/DropdownInput';
import ReorderView from '../Reorder/ReorderView';
import ImportView from '../ImportView/ImportView';
import EditorForm from '../EditorForm/EditorForm';
import {
  getDisplayLabelForAttribute,
  generateDefaultAttributes,
  attributeButton,
} from '../../../utils/attributeHelper';
import { DROPDOWN_ITEMS } from '../../../constants';

class Phase extends React.Component {
  constructor(props) {
    super(props);
    this.onActionDefaultAttributeChange = this.onActionDefaultAttributeChange.bind(this);
    this.onActionTypeChange = this.onActionTypeChange.bind(this);
    this.onActionTypeInputChange = this.onActionTypeInputChange.bind(this);
    this.onActionTypeSpecifierChange = this.onActionTypeSpecifierChange.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.onTypeSpecifierChange = this.onTypeSpecifierChange.bind(this);
    this.createNewAction = this.createNewAction.bind(this);
    this.addAction = this.addAction.bind(this);
    this.editTypeSpecifier = this.editTypeSpecifier.bind(this);
    this.editType = this.editType.bind(this);
    this.editPhaseForm = this.editPhaseForm.bind(this);
    this.editPhaseWithForm = this.editPhaseWithForm.bind(this);
    this.disableEditMode = this.disableEditMode.bind(this);
    this.updateTypeSpecifier = this.updateTypeSpecifier.bind(this);
    this.updatePhaseType = this.updatePhaseType.bind(this);
    this.updatePhaseAttribute = this.updatePhaseAttribute.bind(this);
    this.renderPhaseButtons = this.renderPhaseButtons.bind(this);
    this.renderBasicAttributes = this.renderBasicAttributes.bind(this);
    this.toggleImportView = this.toggleImportView.bind(this);
    this.cancelActionCreation = this.cancelActionCreation.bind(this);
    this.onEditFormShowMorePhase = this.onEditFormShowMorePhase.bind(this);
    this.onAddFormShowMoreAction = this.onAddFormShowMoreAction.bind(this);
    this.scrollToAction = this.scrollToAction.bind(this);
    this.scrollToActionRecord = this.scrollToActionRecord.bind(this);
    this.updateTopOffsetForSticky = this.updateTopOffsetForSticky.bind(this);

    this.state = {
      typeSpecifier: this.props.phase.attributes.TypeSpecifier || null,
      type: this.props.phase.attributes.PhaseType || null,
      attributes: this.props.phase.attributes,
      actionDefaultAttributes: {},
      actionTypeSpecifier: '',
      actionType: '',
      mode: 'view',
      editingTypeSpecifier: false,
      editingType: false,
      editingPhase: false,
      complementingPhase: false,
      deleting: false,
      showReorderView: false,
      showImportView: false,
      showMore: false,
      topOffset: 0,
    };

    this.actions = {};
  }

  componentDidMount() {
    this.updateTopOffsetForSticky();
    window.addEventListener('resize', this.updateTopOffsetForSticky);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.phase.attributes.TypeSpecifier) {
      this.setState({
        typeSpecifier: nextProps.phase.attributes.TypeSpecifier,
      });
    }
    if (nextProps.phase.attributes.PhaseType) {
      this.setState({ type: nextProps.phase.attributes.PhaseType });
    }
    if (nextProps.documentState === 'view') {
      this.disableEditMode();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateTopOffsetForSticky);
  }

  onEditFormShowMorePhase(e) {
    e.preventDefault();
    this.setState((prevState) => ({
      complementingPhase: !prevState.complementingPhase,
      editingPhase: !prevState.editingPhase,
    }));
  }

  onActionDefaultAttributeChange(key, value) {
    const { actionDefaultAttributes } = this.state;
    actionDefaultAttributes[key] = value;
    this.setState({ actionDefaultAttributes });
  }

  onActionTypeSpecifierChange(event) {
    this.setState({ actionTypeSpecifier: event.target.value });
  }

  onActionTypeInputChange(event) {
    this.setState({ actionType: event.target.value });
  }

  onAddFormShowMoreAction(e) {
    e.preventDefault();
    this.setState((prevState) => ({
      showMore: !prevState.showMore,
    }));
  }

  onTypeInputChange(event) {
    this.setState({ type: event.target.value });
  }

  onTypeChange(value) {
    this.setState((prev) =>
      update(prev, {
        type: {
          $set: value,
        },
      }),
    );
  }

  onTypeSpecifierChange(event) {
    this.setState({ typeSpecifier: event.target.value });
  }

  onActionTypeChange(value) {
    this.setState({ actionType: value });
  }

  getTargetName() {
    const hasType = this.state?.type?.length;
    const hasTypeSpecifier = this.state?.typeSpecifier?.length;
    const slash = hasType && hasTypeSpecifier ? ' / ' : '';

    return (this.state?.type || '') + slash + (this.state?.typeSpecifier || '');
  }

  getTypeSpecifier(classNames) {
    if (this.state.mode === 'edit' && this.state.editingTypeSpecifier) {
      return (
        <div className='col-md-5 phase-title-input row'>
          <form onSubmit={this.updateTypeSpecifier}>
            <input
              className='input-title form-control'
              value={this.state.typeSpecifier || ''}
              onChange={this.onTypeSpecifierChange}
              onBlur={this.updateTypeSpecifier}
              autoFocus
            />
          </form>
        </div>
      );
    }

    return (
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
  }

  getPhaseType(classNames) {
    if (this.state.mode === 'edit' && this.state.editingType) {
      const phaseTypesAsOptions = Object.values(this.props.phaseTypes).map((pt) => ({
        value: pt.value,
        label: getDisplayLabelForAttribute({
          attributeValue: pt.value,
          identifier: 'PhaseType',
        }),
      }));

      return (
        <div className='col-md-6 phase-title-dropdown'>
          <form onSubmit={this.updatePhaseType}>
            <DropdownInput
              type='phase'
              valueState={this.state.type}
              options={phaseTypesAsOptions}
              onChange={this.onTypeChange}
              onInputChange={this.onTypeInputChange}
              onSubmit={this.updatePhaseType}
            />
          </form>
        </div>
      );
    }

    return (
      <span
        className={classNames}
        onClick={() => this.editType()}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            this.editType();
          }
        }}
      >
        {getDisplayLabelForAttribute({
          attributeValue: this.state.type,
          identifier: 'PhaseType',
        })}
      </span>
    );
  }

  editType() {
    if (this.props.documentState === 'edit') {
      this.setState({ editingType: true, mode: 'edit' });
    }
  }

  editPhaseForm() {
    if (this.props.documentState === 'edit') {
      this.setState({ editingPhase: true, mode: 'edit' });
    }
  }

  disableEditMode() {
    this.setState({
      editingTypeSpecifier: false,
      editingType: false,
      editingPhase: false,
      complementingPhase: false,
      mode: 'view',
    });
  }

  createNewAction() {
    this.setState({ mode: 'add' });
  }

  addAction(event) {
    event.preventDefault();
    this.props.setPhaseVisibility(this.props.phaseIndex, true);
    this.props.addAction(
      this.state.actionTypeSpecifier || '',
      this.state.actionType || '',
      this.state.actionDefaultAttributes || {},
      this.props.phaseIndex,
    );
    this.setState({
      actionDefaultAttributes: {},
      actionTypeSpecifier: '',
      actionType: '',
    });
    this.disableEditMode();
    this.props.displayMessage({
      title: 'Toimenpide',
      body: 'Toimenpiteen lisäys onnistui!',
    });
  }

  cancelActionCreation(event) {
    event.preventDefault();
    this.setState({ actionDefaultAttributes: {}, actionTypeSpecifier: '' });
    this.disableEditMode();
  }

  cancelDeletion() {
    this.setState({ deleting: false });
  }

  delete() {
    this.setState({ deleting: false });
    forEach(this.props.phase.actions, (action) => {
      this.props.removeAction(action, this.props.phase.id);
    });
    this.props.removePhase(this.props.phase.id);
  }

  updateTypeSpecifier(event) {
    event.preventDefault();
    const updatedTypeSpecifier = {
      typeSpecifier: this.state.typeSpecifier,
      phaseId: this.props.phase.id,
    };
    this.props.editPhaseAttribute(updatedTypeSpecifier);
    this.disableEditMode();
  }

  updatePhaseType(event) {
    event.preventDefault();
    const updatedPhaseType = {
      type: this.state.type,
      phaseId: this.props.phase.id,
    };
    this.props.editPhaseAttribute(updatedPhaseType);
    this.disableEditMode();
  }

  updatePhaseAttribute(attribute, attributeIndex, phaseId) {
    this.setState({
      attributes: {
        [attributeIndex]: attribute,
      },
    });
    const updatedPhaseAttribute = { attribute, attributeIndex, phaseId };
    this.props.editPhaseAttribute(updatedPhaseAttribute);
  }

  editPhaseWithForm(attributes, phaseId, disableEditMode = true) {
    this.setState({
      attributes,
      typeSpecifier: attributes.TypeSpecifier,
      type: attributes.PhaseType,
    });
    this.props.editPhase(attributes, phaseId);
    if (disableEditMode) {
      this.disableEditMode();
    }
  }

  generateTypeOptions(typeOptions) {
    const options = [];

    Object.keys(typeOptions).forEach((key) => {
      if (Object.hasOwn(typeOptions, key)) {
        options.push({
          label: typeOptions[key].name,
          value: typeOptions[key].name,
        });
      }
    });

    return options;
  }

  updateTopOffsetForSticky() {
    // calculates heights for elements that are already sticking (navigation menu and tos header)
    const headerEl = document.getElementById('single-tos-header-container');
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const menuEl = document.getElementById('navigation-menu');
    const menuHeight = menuEl ? menuEl.getBoundingClientRect().height : 0;
    this.setState({ topOffset: headerHeight + menuHeight });
  }

  toggleReorderView() {
    const current = this.state.showReorderView;
    this.setState({ showReorderView: !current });
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

  generateActions(actions) {
    const elements = [];
    Object.keys(actions).forEach((key) => {
      if (Object.hasOwn(actions, key)) {
        elements.push(
          <Action
            key={key}
            actionIndex={key}
            action={this.props.actions[actions[key]]}
            addRecord={this.props.addRecord}
            editAction={this.props.editAction}
            editActionAttribute={this.props.editActionAttribute}
            editRecord={this.props.editRecord}
            editRecordAttribute={this.props.editRecordAttribute}
            removeAction={this.props.removeAction}
            removeRecord={this.props.removeRecord}
            actions={this.props.actions}
            records={this.props.records}
            phases={this.props.phases}
            phasesOrder={this.props.phasesOrder}
            actionTypes={this.props.actionTypes}
            recordTypes={this.props.recordTypes}
            attributeTypes={this.props.attributeTypes}
            documentState={this.props.documentState}
            phaseIndex={this.props.phaseIndex}
            changeOrder={this.props.changeOrder}
            importItems={this.props.importItems}
            displayMessage={this.props.displayMessage}
            setActionVisibility={this.props.setActionVisibility}
            setRecordVisibility={this.props.setRecordVisibility}
            ref={(element) => {
              this.actions[actions[key]] = element;
            }}
          />,
        );
      }
    });
    return elements;
  }

  generateDropdownItems() {
    return [
      { ...DROPDOWN_ITEMS[0], text: 'Uusi toimenpide', action: () => this.createNewAction() },
      { ...DROPDOWN_ITEMS[1], text: 'Muokkaa käsittelyvaihetta', action: () => this.editPhaseForm() },
      { ...DROPDOWN_ITEMS[2], text: 'Järjestä toimenpiteitä', action: () => this.toggleReorderView() },
      { ...DROPDOWN_ITEMS[3], text: 'Tuo toimenpiteitä', action: () => this.toggleImportView() },
      { ...DROPDOWN_ITEMS[4], text: 'Poista käsittelyvaihe', action: () => this.setState({ deleting: true }) },
    ];
  }

  scrollToActionRecord(actionId, recordId) {
    const action = this.actions[actionId] || null;
    if (action) {
      action.scrollToRecord(recordId);
    }
  }

  scrollToAction(actionId) {
    const element = this.actions[actionId] || null;
    if (element) {
      element.scrollToAction();
    }
  }

  renderPhaseButtons() {
    const phaseDropdownItems = this.generateDropdownItems();

    return (
      <div className='phase-buttons'>
        {this.props.phase.actions.length !== 0 && (
          <button
            type='button'
            className='btn btn-info btn-sm pull-right'
            title={this.props.phase.is_open ? 'Pienennä' : 'Laajenna'}
            aria-label={this.props.phase.is_open ? 'Pienennä' : 'Laajenna'}
            onClick={() => this.props.setPhaseVisibility(this.props.phaseIndex, !this.props.phase.is_open)}
          >
            <span className={`fa-solid ${this.props.phase.is_open ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
          </button>
        )}
        {this.props.documentState === 'edit' && (
          <span className='pull-right'>
            <Dropdown items={phaseDropdownItems} small />
          </span>
        )}
        {attributeButton(this.props.phase.attributes, this.props.attributeTypes) && (
          // eslint-disable-next-line jsx-a11y/control-has-associated-label
          <button
            type='button'
            className='btn btn-info btn-xs record-button pull-right'
            onClick={() =>
              this.props.setPhaseAttributesVisibility(this.props.phaseIndex, !this.props.phase.is_attributes_open)
            }
          >
            <span
              className={`fa-solid ${this.props.phase.is_attributes_open ? 'fa-minus' : 'fa-plus'}`}
              aria-hidden='true'
            />
          </button>
        )}
      </div>
    );
  }

  renderBasicAttributes() {
    const { phase } = this.props;

    const classNames = classnames([
      'col-md-6',
      'basic-attribute',
      'phase-basic-attribute',
      this.props.documentState === 'edit' ? 'editable' : null,
    ]);

    const typeSpecifier = this.getTypeSpecifier(classNames);
    const phaseType = this.getPhaseType(classNames);

    if (phase.is_open && phase.actions.length) {
      return (
        <RenderPropSticky topOffset={-1 * this.state.topOffset}>
          {({ isFixed, wrapperStyles, wrapperRef, holderStyles, holderRef }) => (
            <div ref={holderRef} style={holderStyles}>
              <div
                className={isFixed ? 'phase-title-sticky' : 'phase-title'}
                style={
                  isFixed
                    ? {
                        ...wrapperStyles,
                        ...{
                          position: 'fixed',
                          top: this.state.topOffset,
                          left: 0,
                        },
                      }
                    : wrapperStyles
                }
                ref={wrapperRef}
              >
                <div className='basic-attributes'>
                  {phaseType}
                  {typeSpecifier}
                </div>
              </div>
            </div>
          )}
        </RenderPropSticky>
      );
    }

    return (
      <div className={`phase-title ${phase.is_attributes_open ? 'phase-open' : 'phase-closed'}`}>
        <div className='basic-attributes'>
          {phaseType}
          {typeSpecifier}
        </div>
      </div>
    );
  }

  render() {
    const { phase, phaseIndex } = this.props;
    const actionElements = this.generateActions(phase.actions);

    const reorderActions = this.props.phase.actions.map((actionId) => ({
      id: actionId,
      key: uniqueId(actionId),
    }));

    return (
      <div className='phase'>
        <div className='box'>
          {this.state.mode === 'edit' && this.state.editingPhase && (
            <EditorForm
              onShowMore={this.onEditFormShowMorePhase}
              targetId={this.props.phase.id}
              attributes={this.props.phase.attributes}
              attributeTypes={this.props.attributeTypes}
              elementConfig={{
                elementTypes: this.props.phaseTypes,
                editWithForm: this.editPhaseWithForm,
              }}
              editorConfig={{
                type: 'phase',
                action: 'edit',
              }}
              closeEditorForm={this.disableEditMode}
              displayMessage={this.props.displayMessage}
            />
          )}
          {this.state.mode === 'edit' && this.state.complementingPhase && (
            <EditorForm
              onShowMore={this.onEditFormShowMorePhase}
              targetId={this.props.phase.id}
              attributes={this.props.phase.attributes}
              attributeTypes={this.props.attributeTypes}
              elementConfig={{
                elementTypes: this.props.phaseTypes,
                editWithForm: this.editPhaseWithForm,
              }}
              editorConfig={{
                type: 'phase',
                action: 'complement',
              }}
              closeEditorForm={this.disableEditMode}
              displayMessage={this.props.displayMessage}
            />
          )}
          {!this.state.editingPhase && !this.state.complementingPhase && (
            <div>
              <Attributes
                element={phase}
                documentState={this.props.documentState}
                type='phase'
                attributeTypes={this.props.attributeTypes}
                typeOptions={this.props.phaseTypes}
                renderBasicAttributes={this.renderBasicAttributes}
                renderButtons={this.renderPhaseButtons}
                updateTypeSpecifier={this.updateTypeSpecifier}
                updateType={this.updatePhaseType}
                updateAttribute={this.updatePhaseAttribute}
                showAttributes={phase.is_attributes_open}
              />
              {this.state.mode === 'add' && (
                <AddElementInput
                  type='action'
                  submit={this.addAction}
                  typeOptions={this.generateTypeOptions(this.props.actionTypes)}
                  defaultAttributes={generateDefaultAttributes(
                    this.props.attributeTypes,
                    'action',
                    this.state.showMore,
                  )}
                  newDefaultAttributes={this.state.actionDefaultAttributes}
                  newTypeSpecifier={this.state.actionTypeSpecifier}
                  newType={this.state.actionType}
                  onDefaultAttributeChange={this.onActionDefaultAttributeChange}
                  onTypeSpecifierChange={this.onActionTypeSpecifierChange}
                  onTypeChange={this.onActionTypeChange}
                  onTypeInputChange={this.onActionTypeInputChange}
                  cancel={this.cancelActionCreation}
                  onAddFormShowMore={this.onAddFormShowMoreAction}
                  showMoreOrLess={this.state.showMore}
                />
              )}
              <div className={`actions ${phase.is_open ? '' : 'hidden'}`}>{actionElements}</div>
            </div>
          )}
          {this.state.deleting && (
            <Popup
              content={
                <DeleteView
                  type='phase'
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
                  target='action'
                  toggleReorderView={() => this.toggleReorderView()}
                  items={reorderActions}
                  values={this.props.actions}
                  changeOrder={this.props.changeOrder}
                  parent={phaseIndex}
                  attributeTypes={this.props.attributeTypes}
                  parentName={this.getTargetName()}
                />
              }
              closePopup={() => this.toggleReorderView()}
            />
          )}
          {this.state.showImportView && (
            <Popup
              content={
                <ImportView
                  level='action'
                  toggleImportView={this.toggleImportView}
                  title='toimenpiteitä'
                  targetText={`käsittelyvaiheeseen "${this.getTargetName()}"`}
                  itemsToImportText='toimenpiteet'
                  phasesOrder={this.props.phasesOrder}
                  phases={this.props.phases}
                  actions={this.props.actions}
                  records={this.props.records}
                  importItems={this.props.importItems}
                  parent={phaseIndex}
                  showItems={() => this.props.setPhaseVisibility(phaseIndex, true)}
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

Phase.propTypes = {
  actionTypes: PropTypes.object.isRequired,
  actions: PropTypes.object,
  addAction: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
  attributeTypes: PropTypes.object.isRequired,
  changeOrder: PropTypes.func.isRequired,
  displayMessage: PropTypes.func.isRequired,
  documentState: PropTypes.string.isRequired,
  editAction: PropTypes.func.isRequired,
  editActionAttribute: PropTypes.func.isRequired,
  editPhase: PropTypes.func.isRequired,
  editPhaseAttribute: PropTypes.func.isRequired,
  editRecord: PropTypes.func.isRequired,
  editRecordAttribute: PropTypes.func.isRequired,
  importItems: PropTypes.func.isRequired,
  phase: PropTypes.object.isRequired,
  phaseIndex: PropTypes.string.isRequired,
  phaseTypes: PropTypes.object.isRequired,
  phases: PropTypes.object.isRequired || PropTypes.array.isRequired,
  phasesOrder: PropTypes.array.isRequired,
  recordTypes: PropTypes.object.isRequired,
  records: PropTypes.object,
  removeAction: PropTypes.func.isRequired,
  removePhase: PropTypes.func.isRequired,
  removeRecord: PropTypes.func.isRequired,
  setActionVisibility: PropTypes.func.isRequired,
  setPhaseAttributesVisibility: PropTypes.func.isRequired,
  setPhaseVisibility: PropTypes.func.isRequired,
  setRecordVisibility: PropTypes.func.isRequired,
};

Phase.defaultProps = {
  actions: {},
  records: {},
};

export default Phase;
