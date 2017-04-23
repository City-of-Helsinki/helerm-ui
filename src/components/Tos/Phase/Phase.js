import React from 'react';
import forEach from 'lodash/forEach';
import { StickyContainer, Sticky } from 'react-sticky';
import './Phase.scss';

import Action from '../Action/Action';
import Attributes from '../Attribute/Attributes';
import CreateActionForm from '../Action/CreateActionForm';
import DeleteView from '../DeleteView/DeleteView';
import Popup from 'components/Popup';
import Dropdown from 'components/Dropdown';
import ReorderView from '../Reorder/ReorderView';
import ImportView from '../ImportView/ImportView';

export class Phase extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onNewChange = this.onNewChange.bind(this);
    this.createNewAction = this.createNewAction.bind(this);
    this.addAction = this.addAction.bind(this);
    this.editPhaseTitle = this.editPhaseTitle.bind(this);
    this.renderPhaseButtons = this.renderPhaseButtons.bind(this);
    this.renderBasicAttributes = this.renderBasicAttributes.bind(this);
    this.savePhase = this.savePhase.bind(this);
    this.toggleImportView = this.toggleImportView.bind(this);
    this.cancelActionCreation = this.cancelActionCreation.bind(this);
    this.state = {
      typeSpecifier: this.props.phase.attributes.TypeSpecifier,
      newActionName: '',
      mode: 'view',
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
  }

  editPhaseTitle () {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: 'edit' });
    }
  }

  savePhase (event) {
    event.preventDefault();
    const updatedPhase = {
      id: this.props.phase.id,
      name: this.state.name
    };
    this.props.editPhase(updatedPhase);
    if (this.state.name.length > 0) {
      this.setState({ mode: 'view' });
    }
  }

  onChange (event) {
    this.setState({ typeSpecifier: event.target.value });
  }

  onNewChange (event) {
    this.setState({ newActionName: event.target.value });
  }

  toggleReorderView () {
    const current = this.state.showReorderView;
    this.setState({ showReorderView: !current });
  }

  toggleImportView () {
    const current = this.state.showImportView;
    this.setState({ showImportView: !current });
  }

  createNewAction () {
    this.setState({ mode: 'add' });
  }

  addAction (event) {
    event.preventDefault();
    this.props.setPhaseVisibility(this.props.phaseIndex, true);
    this.props.addAction(this.props.phaseIndex, this.state.newActionName);
    this.setState({ mode: 'view', newActionName: '' });
    this.props.displayMessage({
      title: 'Toimenpide',
      body: 'Toimenpiteen lisäys onnistui!'
    });
  }

  cancelActionCreation (event) {
    event.preventDefault();
    this.setState({ newActionName: '', mode: 'view' });
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

  activateEditMode () {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: 'edit' });
    }
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

  generateDropdownItems (phase) {
    return [
      {
        text: 'Muokkaa käsittelyvaihetta',
        icon: 'fa-pencil',
        style: 'btn-primary',
        action: () => null
      }, {
        text: 'Täydennä metatietoja',
        icon: 'fa-plus-square',
        style: 'btn-primary',
        action: () => null
      }, {
        text: 'Uusi toimenpide',
        icon: 'fa-file-text',
        style: 'btn-primary',
        action: () => this.createNewAction()
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

  renderPhaseButtons () {
    const phaseDropdownItems = this.generateDropdownItems();

    return (
      <span className='phase-buttons'>
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
      </span>
    );
  }

  renderBasicAttributes () {
    let typeSpecifier;

    if (this.state.mode !== 'edit') {
      typeSpecifier =
        (<span className='col-md-6 basic-attribute' onClick={this.activateEditMode}>
          <i className='fa fa-info-circle' aria-hidden='true'/> {this.state.typeSpecifier}
        </span>
        );
    }
    if (this.state.mode === 'edit') {
      phaseTitle = (
        <div className='phase-title-input row'>
          <form className='col-md-10 col-xs-12' onSubmit={this.savePhase}>
            <input
              className='input-title form-control'
              value={this.state.name}
              onChange={this.onChange}
              onBlur={this.savePhase}
              autoFocus={true}
            />
          </form>
        </div>
      );
    }

    return phaseTitle;
  }

  render () {
    const { phase, phaseIndex, update } = this.props;
    const actionElements = this.generateActions(phase.actions);

    return (
      <div>
        <span className='col-xs-12 box phase'>
          <StickyContainer>
            <Sticky className={'phase-title ' + (this.props.phase.is_open ? 'open' : 'closed')}>
              <Attributes
                element={phase}
                documentState={this.props.documentState}
                mode={this.state.mode}
                type={'phase'}
                attributeTypes={this.props.attributeTypes}
                typeOptions={this.props.phaseTypes}
                renderBasicAttributes={this.renderBasicAttributes}
                renderButtons={this.renderPhaseButtons}
                updateTypeSpecifier={this.updatePhaseName}
                updateType={this.updatePhaseType}
                updateAttribute={this.updatePhaseAttribute}
                showAttributes={this.state.showAttributes}
              />
            </Sticky>
            { this.state.mode === 'add' &&
            <CreateActionForm
              newActionName={this.state.newActionName}
              submit={this.addAction}
              onChange={this.onNewChange}
              cancel={this.cancelActionCreation}
            />
            }
            <div className={'actions ' + (phase.is_open ? '' : 'hidden')}>
              { actionElements }
            </div>
          </StickyContainer>
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
                level='action'
                toggleImportView={this.toggleImportView}
                title='toimenpiteitä'
                targetText={'käsittelyvaiheeseen "' + phase.attributes.TypeSpecifier + '"'}
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
        </span>
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
