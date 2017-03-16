import React from 'react';
import forEach from 'lodash/forEach';
import './Phase.scss';
import Action from './Action.js';
import DeleteView from './DeleteView';
import { StickyContainer, Sticky } from 'react-sticky';
import Popup from 'components/Popup';
import Dropdown from 'components/Dropdown';
import ReorderView from './ReorderView';
import ImportView from './ImportView';

export class Phase extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onNewChange = this.onNewChange.bind(this);
    this.createNewAction = this.createNewAction.bind(this);
    this.addAction = this.addAction.bind(this);
    this.editPhaseTitle = this.editPhaseTitle.bind(this);
    this.savePhaseTitle = this.savePhaseTitle.bind(this);
    this.cancelActionCreation = this.cancelActionCreation.bind(this);
    this.state = {
      name: this.props.phase.name,
      newActionName: '',
      mode: 'view',
      deleting: false,
      showReorderView: false,
      showImportView: false
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.phase.name) {
      this.setState({ name: nextProps.phase.name });
    }
  }

  editPhaseTitle () {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: 'edit' });
    }
  }

  savePhaseTitle (event) {
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
    this.setState({ name: event.target.value });
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

  createNewAction () {
    this.setState({ mode: 'add' });
  }

  addAction (event) {
    event.preventDefault();
    this.props.setPhaseVisibility(this.props.phaseIndex, true);
    this.props.addAction(this.props.phaseIndex, this.state.newActionName);
    this.setState({ mode: 'view', newActionName: '' });
    this.props.displayMessage({
      text: 'Toimenpiteen lisäys onnistui!',
      success: true
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

  render () {
    const { phase, phaseIndex, update } = this.props;
    const actionElements = this.generateActions(phase.actions);
    const phaseDropdownItems = this.generateDropdownItems();
    let phaseTitle;
    if (this.state.mode !== 'edit') {
      phaseTitle =
        (<span onClick={this.editPhaseTitle}>
          <i className='fa fa-info-circle' aria-hidden='true'/> {this.state.name}
        </span>
        );
    }
    if (this.state.mode === 'edit') {
      phaseTitle = (
        <div className='phase-title-input row'>
          <form className='col-md-10 col-xs-12' onSubmit={this.savePhaseTitle}>
            <input
              className='input-title form-control'
              value={this.state.name}
              onChange={this.onChange}
              onBlur={this.savePhaseTitle}
              autoFocus={true}
            />
          </form>
        </div>
      );
    }
    return (
      <div>
        <span className='col-xs-12 box phase'>
          <StickyContainer>
            <Sticky className={'phase-title ' + (this.props.phase.is_open ? 'open' : 'closed')}>
              { phaseTitle }
              <span className='phase-buttons'>
                { phase.actions.length !== 0 &&
                <button
                  type='button'
                  className='btn btn-info btn-sm pull-right'
                  title={phase.is_open ? 'Pienennä' : 'Laajenna'}
                  onClick={() => this.props.setPhaseVisibility(phaseIndex, !phase.is_open)}>
                  <span
                    className={'fa ' + (phase.is_open ? 'fa-minus' : 'fa-plus')}
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
            </Sticky>
            { this.state.mode === 'add' &&
            <form onSubmit={this.addAction} className='row add-action'>
              <h5 className='col-xs-12'>Uusi toimenpide</h5>
              <div className='col-xs-12 col-md-6'>
                <input type='text'
                       className='form-control'
                       value={this.state.newActionName}
                       onChange={this.onNewChange}
                       placeholder='Toimenpiteen nimi'/>
              </div>
              <div className='col-xs-12 col-md-4 add-action-buttons'>
                <button
                  className='btn btn-danger col-xs-6'
                  onClick={this.cancelActionCreation}>
                  Peruuta
                </button>
                <button className='btn btn-primary col-xs-6' type='submit'>Lisää</button>
              </div>
            </form>
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
                target={this.state.name}
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
                parentName={this.state.name}
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
                targetText={'käsittelyvaiheeseen "' + phase.name + '"'}
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
  actions: React.PropTypes.object.isRequired,
  addAction: React.PropTypes.func.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  changeOrder: React.PropTypes.func.isRequired,
  displayMessage: React.PropTypes.func.isRequired,
  documentState: React.PropTypes.string.isRequired,
  editAction: React.PropTypes.func.isRequired,
  editPhase: React.PropTypes.func.isRequired,
  editRecord: React.PropTypes.func.isRequired,
  editRecordAttribute: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired,
  phase: React.PropTypes.object.isRequired,
  phaseIndex: React.PropTypes.string.isRequired,
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

export default Phase;
