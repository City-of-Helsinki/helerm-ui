import React from 'react';
import classnames from 'classnames';
import forEach from 'lodash/forEach';
import { StickyContainer, Sticky } from 'react-sticky';
import update from 'immutability-helper';
import './Phase.scss';

import Action from '../Action/Action';
import Attributes from '../Attribute/Attributes';
import AddElementInput from '../AddElementInput/AddElementInput';
import DeleteView from '../DeleteView/DeleteView';
import Popup from 'components/Popup';
import Dropdown from 'components/Dropdown';
import DropdownInput from '../DropdownInput/DropdownInput';
import ReorderView from '../Reorder/ReorderView';
import ImportView from '../ImportView/ImportView';
import EditorForm from '../EditorForm/EditorForm';

export class Phase extends React.Component {
  constructor (props) {
    super(props);
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
    this.toggleAttributeVisibility = this.toggleAttributeVisibility.bind(this);
    this.cancelActionCreation = this.cancelActionCreation.bind(this);
    this.state = {
      typeSpecifier: this.props.phase.attributes.TypeSpecifier || null,
      type: this.props.phase.attributes.PhaseType || null,
      attributes: this.props.phase.attributes,
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
      showAttributes: false
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.phase.attributes.TypeSpecifier) {
      this.setState({ typeSpecifier: nextProps.phase.attributes.TypeSpecifier });
    }
    if (nextProps.phase.attributes.PhaseType) {
      this.setState({ type: nextProps.phase.attributes.PhaseType });
    }
    if (nextProps.documentState === 'view') {
      this.disableEditMode();
    }
  }

  toggleAttributeVisibility () {
    const currentVisibility = this.state.showAttributes;
    const newVisibility = !currentVisibility;
    this.setState({ showAttributes: newVisibility });
  }

  toggleReorderView () {
    const current = this.state.showReorderView;
    this.setState({ showReorderView: !current });
  }

  toggleImportView () {
    const current = this.state.showImportView;
    this.setState({ showImportView: !current });
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

  editPhaseForm () {
    if (this.props.documentState === 'edit') {
      this.setState({ editingPhase: true, mode: 'edit' });
    }
  }

  complementPhaseForm () {
    if (this.props.documentState === 'edit') {
      this.setState({ complementingPhase: true, mode: 'edit' });
    }
  }

  disableEditMode () {
    this.setState({
      editingTypeSpecifier: false,
      editingType: false,
      editingPhase: false,
      complementingPhase: false,
      mode: 'view'
    });
  }

  createNewAction () {
    this.setState({ mode: 'add' });
  }

  addAction (event) {
    event.preventDefault();
    this.props.setPhaseVisibility(this.props.phaseIndex, true);
    this.props.addAction(this.state.actionTypeSpecifier || '', this.state.actionType || '', this.props.phaseIndex);
    this.setState({ actionTypeSpecifier: '', actionType: '' });
    this.disableEditMode();
    this.props.displayMessage({
      title: 'Toimenpide',
      body: 'Toimenpiteen lisäys onnistui!'
    });
  }

  cancelActionCreation (event) {
    event.preventDefault();
    this.setState({ actionTypeSpecifier: '' });
    this.disableEditMode();
  }

  cancelDeletion () {
    this.setState({ deleting: false });
  }

  delete () {
    this.setState({ deleting: false });
    forEach(this.props.phase.actions, (action) => {
      this.props.removeAction(action, this.props.phase.id);
    });
    this.props.removePhase(this.props.phase.id);
  }

  onActionTypeSpecifierChange (event) {
    this.setState({ actionTypeSpecifier: event.target.value });
  }

  onActionTypeInputChange (event) {
    this.setState({ actionType: event.target.value });
  }

  onActionTypeChange (value) {
    this.setState({ actionType: value });
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

  onTypeInputChange (event) {
    this.setState({ type: event.target.value });
  }

  updateTypeSpecifier (event) {
    event.preventDefault();
    const updatedTypeSpecifier = {
      typeSpecifier: this.state.typeSpecifier,
      phaseId: this.props.phase.id
    };
    this.props.editPhaseAttribute(updatedTypeSpecifier);
    this.disableEditMode();
  }

  updatePhaseType (event) {
    event.preventDefault();
    const updatedPhaseType = {
      type: this.state.type,
      phaseId: this.props.phase.id
    };
    this.props.editPhaseAttribute(updatedPhaseType);
    this.disableEditMode();
  }

  updatePhaseAttribute (attribute, attributeIndex, phaseId) {
    this.setState({
      attributes: {
        [attributeIndex]: attribute
      }
    });
    const updatedPhaseAttribute = { attribute, attributeIndex, phaseId };
    this.props.editPhaseAttribute(updatedPhaseAttribute);
  }

  editPhaseWithForm (attributes, phaseId) {
    this.setState({
      attributes: attributes,
      typeSpecifier: attributes.TypeSpecifier,
      type: attributes.PhaseType
    });
    this.props.editPhase(attributes, phaseId);
    this.disableEditMode();
  }

  generateTypeOptions (typeOptions) {
    const options = [];

    for (const key in typeOptions) {
      if (typeOptions.hasOwnProperty(key)) {
        options.push({
          label: typeOptions[key].name,
          value: typeOptions[key].name
        });
      }
    }

    return options;
  }

  generateActions (actions) {
    const elements = [];
    for (const key in actions) {
      if (actions.hasOwnProperty(key)) {
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
          />
        );
      }
      ;
    }
    return elements;
  }

  generateDropdownItems () {
    return [
      {
        text: 'Uusi toimenpide',
        icon: 'fa-file-text',
        style: 'btn-primary',
        action: () => this.createNewAction()
      }, {
        text: 'Muokkaa käsittelyvaihetta',
        icon: 'fa-pencil',
        style: 'btn-primary',
        action: () => this.editPhaseForm()
      }, {
        text: 'Täydennä metatietoja',
        icon: 'fa-plus-square',
        style: 'btn-primary',
        action: () => this.complementPhaseForm()
      }, {
        text: 'Järjestä toimenpiteitä',
        icon: 'fa-th-list',
        style: 'btn-primary',
        action: () => this.toggleReorderView()
      }, {
        text: 'Tuo toimenpiteitä',
        icon: 'fa-download',
        style: 'btn-primary',
        action: () => this.toggleImportView()
      }, {
        text: 'Poista käsittelyvaihe',
        icon: 'fa-trash',
        style: 'btn-delete',
        action: () => this.setState({ deleting: true })
      }
    ];
  }

  showAttributeButton (attributes) {
    const actualAttributes = [];
    for (const key in attributes) {
      if (key !== 'TypeSpecifier' && key !== 'PhaseType') {
        actualAttributes.push(key);
      }
    }
    if (actualAttributes.length) {
      return true;
    }
    return false;
  }

  renderPhaseButtons () {
    const phaseDropdownItems = this.generateDropdownItems();

    return (
      <div className='phase-buttons'>
        { this.props.phase.actions.length !== 0 &&
          <button
            type='button'
            className='btn btn-info btn-sm pull-right'
            title={this.props.phase.is_open ? 'Pienennä' : 'Laajenna'}
            onClick={() => this.props.setPhaseVisibility(this.props.phaseIndex, !this.props.phase.is_open)}>
            <span
              className={'fa ' + (this.props.phase.is_open ? 'fa-minus' : 'fa-plus')}
              aria-hidden='true'
            />
          </button>
        }
        { this.props.documentState === 'edit' &&
        <span className='pull-right'>
          <Dropdown children={phaseDropdownItems} small={true}/>
        </span>
        }
        { this.showAttributeButton(this.props.phase.attributes) &&
          <button
            className='btn btn-info btn-xs record-button pull-right'
            onClick={this.toggleAttributeVisibility}>
            <span
              className={'fa ' + (this.state.showAttributes ? 'fa-minus' : 'fa-plus')}
              aria-hidden='true'
            />
          </button>
        }
      </div>
    );
  }

  renderBasicAttributes () {
    const classNames = classnames(['col-md-6', 'basic-attribute', this.props.documentState === 'edit' ? 'editable' : null]);
    let typeSpecifier =
      (<span className={classNames} onClick={() => this.editTypeSpecifier()}>
        {this.state.typeSpecifier}
      </span>
    );
    let phaseType =
      (<span className={classNames} onClick={() => this.editType()}>
        {this.state.type}
      </span>
    );

    if (this.state.mode === 'edit') {
      if (this.state.editingTypeSpecifier) {
        typeSpecifier = (
          <div className='col-md-5 phase-title-input row'>
            <form onSubmit={this.updateTypeSpecifier}>
              <input
                className='input-title form-control'
                value={this.state.typeSpecifier || ''}
                onChange={this.onTypeSpecifierChange}
                onBlur={this.updateTypeSpecifier}
                autoFocus={true}
              />
            </form>
          </div>
        );
      }
      if (this.state.editingType) {
        phaseType = (
          <div className='col-md-6'>
            <form onSubmit={this.updatePhaseType}>
              <DropdownInput
                type={'phase'}
                valueState={this.state.type}
                options={this.props.phaseTypes}
                onChange={this.onTypeChange}
                onInputChange={this.onTypeInputChange}
                onSubmit={this.updatePhaseType}
              />
            </form>
          </div>
        );
      }
    }

    return (
      <div className='basic-attributes'>
        {phaseType}
        {typeSpecifier}
      </div>
    );
  }

  getTargetText (value) {
    if (value === undefined) {
      return '-';
    }
    return value;
  }

  render () {
    const { phase, phaseIndex, update } = this.props;
    const actionElements = this.generateActions(phase.actions);

    return (
      <div>
        <div className='phase box col-xs-12'>
          { this.state.mode === 'edit' && this.state.editingPhase &&
            <EditorForm
              targetId={this.props.phase.id}
              attributes={this.props.phase.attributes}
              attributeTypes={this.props.attributeTypes}
              elementConfig={{
                elementTypes: this.props.phaseTypes,
                editWithForm: this.editPhaseWithForm
              }}
              editorConfig={{
                type: 'phase',
                action: 'edit'
              }}
              closeEditorForm={this.disableEditMode}
              displayMessage={this.props.displayMessage}
            />
          }
          { this.state.mode === 'edit' && this.state.complementingPhase &&
            <EditorForm
              targetId={this.props.phase.id}
              attributes={this.props.phase.attributes}
              attributeTypes={this.props.attributeTypes}
              elementConfig={{
                elementTypes: this.props.phaseTypes,
                editWithForm: this.editPhaseWithForm
              }}
              editorConfig={{
                type: 'phase',
                action: 'complement'
              }}
              closeEditorForm={this.disableEditMode}
              displayMessage={this.props.displayMessage}
            />
          }
          { !this.state.editingPhase && !this.state.complementingPhase &&
            <StickyContainer>
              <Sticky className={'phase-title ' + (this.state.showAttributes ? 'phase-open' : 'phase-closed')}>
                <Attributes
                  element={phase}
                  documentState={this.props.documentState}
                  type={'phase'}
                  attributeTypes={this.props.attributeTypes}
                  typeOptions={this.props.phaseTypes}
                  renderBasicAttributes={this.renderBasicAttributes}
                  renderButtons={this.renderPhaseButtons}
                  updateTypeSpecifier={this.updateTypeSpecifier}
                  updateType={this.updatePhaseType}
                  updateAttribute={this.updatePhaseAttribute}
                  showAttributes={this.state.showAttributes}
                />
              </Sticky>
              { this.state.mode === 'add' &&
              <AddElementInput
                type='action'
                submit={this.addAction}
                typeOptions={this.generateTypeOptions(this.props.actionTypes)}
                newTypeSpecifier={this.state.actionTypeSpecifier}
                newType={this.state.actionType}
                onTypeSpecifierChange={this.onActionTypeSpecifierChange}
                onTypeChange={this.onActionTypeChange}
                onTypeInputChange={this.onActionTypeInputChange}
                cancel={this.cancelActionCreation}
              />
              }
              <div className={'actions ' + (phase.is_open ? '' : 'hidden')}>
                { actionElements }
              </div>
            </StickyContainer>
          }
          { this.state.deleting &&
          <Popup
            content={
              <DeleteView
                type='phase'
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
                target='action'
                toggleReorderView={() => this.toggleReorderView()}
                keys={this.props.phase.actions}
                values={this.props.actions}
                changeOrder={this.props.changeOrder}
                parent={phaseIndex}
                attributeTypes={this.props.attributeTypes}
                parentName={this.state.typeSpecifier || this.state.type}
              />
            }
            closePopup={() => this.toggleReorderView()}
          />
          }
          { this.state.showImportView &&
          <Popup
            content={
              <ImportView
                level='action'
                toggleImportView={this.toggleImportView}
                title='toimenpiteitä'
                targetText={'käsittelyvaiheeseen "' + this.getTargetText(phase.attributes.TypeSpecifier) + '"'}
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
          }
          {/*
           { update } is a hack to fix firefox specific issue of re-rendering phases
           remove once firefox issue is fixed
           */}
          <div className='update'>{ update }</div>
        </div>
      </div>
    );
  }
}

Phase.propTypes = {
  actionTypes: React.PropTypes.object.isRequired,
  actions: React.PropTypes.object.isRequired,
  addAction: React.PropTypes.func.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  changeOrder: React.PropTypes.func.isRequired,
  displayMessage: React.PropTypes.func.isRequired,
  documentState: React.PropTypes.string.isRequired,
  editAction: React.PropTypes.func.isRequired,
  editActionAttribute: React.PropTypes.func.isRequired,
  editPhase: React.PropTypes.func.isRequired,
  editPhaseAttribute: React.PropTypes.func.isRequired,
  editRecord: React.PropTypes.func.isRequired,
  editRecordAttribute: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired,
  phase: React.PropTypes.object.isRequired,
  phaseIndex: React.PropTypes.string.isRequired,
  phaseTypes: React.PropTypes.object.isRequired,
  phases: React.PropTypes.object.isRequired || React.PropTypes.array.isRequired,
  phasesOrder: React.PropTypes.array.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  records: React.PropTypes.object.isRequired,
  removeAction: React.PropTypes.func.isRequired,
  removePhase: React.PropTypes.func.isRequired,
  removeRecord: React.PropTypes.func.isRequired,
  setPhaseVisibility: React.PropTypes.func.isRequired,
  update: React.PropTypes.string.isRequired
};

Phase.defaultProps = {
  actions: {},
  records: {}
};

export default Phase;
