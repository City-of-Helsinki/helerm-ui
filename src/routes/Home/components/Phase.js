import React from 'react';
import './Phase.scss';
import Action from './Action.js';
import DeletePopup from './DeletePopup';
import { StickyContainer, Sticky } from 'react-sticky';
import ReorderView from './ReorderView';

export class Phase extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onNewChange = this.onNewChange.bind(this);
    this.createNewAction = this.createNewAction.bind(this);
    this.addAction = this.addAction.bind(this);
    this.savePhaseTitle = this.savePhaseTitle.bind(this);
    this.cancelActionCreation = this.cancelActionCreation.bind(this);
    this.state = {
      name: this.props.phase.name,
      newActionName: '',
      mode: 'view',
      deleting: false,
      deleted: false,
      showReorderView: false
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
  generateActions (actions) {
    const elements = [];
    for (const key in actions) {
      if (actions.hasOwnProperty(key)) {
        elements.push(
          <Action
            key={key}
            action={this.props.actions[actions[key]]}
            actionIndex={key}
            records={this.props.records}
            recordTypes={this.props.recordTypes}
            documentState={this.props.documentState}
            attributeTypes={this.props.attributeTypes}
            phaseIndex={this.props.phaseIndex}
            addRecord={this.props.addRecord}
            commitOrderChanges={this.props.commitOrderChanges}
          />
        );
      };
    }
    return elements;
  }
  createNewAction () {
    this.setState({ mode: 'add' });
  }
  addAction (event) {
    event.preventDefault();
    this.props.setPhaseVisibility(this.props.phaseIndex, true);
    this.props.addAction(this.props.phaseIndex, this.state.newActionName);
    this.setState({ mode: 'view', newActionName: '' });
  }
  cancelActionCreation (event) {
    event.preventDefault();
    this.setState({ newActionName: '', mode: 'view' });
  }
  cancelDeletion () {
    this.setState({ deleting: false });
  }
  delete () {
    this.setState({ deleted: true, deleting: false });
  }
  render () {
    const { phase, phaseIndex, actions, update } = this.props;
    const actionElements = this.generateActions(phase.actions);
    let phaseTitle;
    if (this.state.mode !== 'edit') {
      phaseTitle =
        (<span>
          <span className='phase-title' onClick={() => this.editPhaseTitle()}>
            <i className='fa fa-info-circle' aria-hidden='true' /> {this.state.name}
          </span>
          { this.props.documentState === 'edit' &&
            <button
              type='button'
              className='btn btn-delete btn-sm pull-right'
              title='Poista'
              onClick={() => this.setState({ deleting: true })} >
              <span
                className='fa fa-trash-o'
                aria-hidden='true'
              />
            </button>
          }
          { phase.actions.length !== 0 &&
            <span>
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
              { this.props.documentState === 'edit' &&
                phase.actions.length > 1 &&
                <button className='btn btn-primary btn-sm pull-right' onClick={() => this.toggleReorderView()}>
                  Järjestä toimenpiteitä
                </button>
              }
            </span>
          }
        </span>);
    }
    if (this.state.mode === 'edit') {
      phaseTitle =
        <div className='phase-title-input row'>
          <form className='col-md-10 col-xs-12' onSubmit={this.savePhaseTitle}>
            <input
              className='input-title form-control'
              value={this.state.name}
              onChange={this.onChange}
              onBlur={this.savePhaseTitle}
              autoFocus
            />
          </form>
        </div>;
    }
    return (
      <div>
        { !this.state.deleted &&
          <StickyContainer className='col-xs-12 box phase'>
            <Sticky className='phase-title'>
              {/*
                { update } is a hack to fix firefox specific issue of re-rendering phases
                remove once firefox issue is fixed
              */}
              <div className='update'>{ update }</div>
              { phaseTitle }
            </Sticky>
            <div className={'actions ' + (phase.is_open ? '' : 'hidden')}>
              { actionElements }
            </div>
            { this.props.documentState === 'edit' && this.state.mode !== 'add' &&
              <button
                className='btn btn-primary btn-sm btn-new-action pull-left'
                onClick={() => this.createNewAction()}>
                Uusi toimenpide
              </button>
            }
            { this.state.mode === 'add' &&
              <form onSubmit={this.addAction} className='row'>
                <h5 className='col-xs-12'>Uusi toimenpide</h5>
                <div className='col-xs-12 col-md-6'>
                  <input type='text' className='form-control'
                    value={this.state.newActionName} onChange={this.onNewChange} placeholder='Toimenpiteen nimi' />
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
          </StickyContainer>
        }
        { this.state.deleting &&
          <DeletePopup
            type='phase'
            target={this.state.name}
            action={() => this.delete()}
            cancel={() => this.cancelDeletion()}
          />
        }
        { this.state.showReorderView &&
          <ReorderView
            target='action'
            toggleReorderView={() => this.toggleReorderView()}
            keys={this.props.phase.actions}
            values={this.props.actions}
            commitOrderChanges={this.props.commitOrderChanges}
            parent={phaseIndex}
            parentName={this.state.name}
          />
        }
      </div>
    );
  }
}

Phase.propTypes = {
  phase: React.PropTypes.object.isRequired,
  actions: React.PropTypes.object.isRequired,
  records: React.PropTypes.object.isRequired,
  phaseIndex: React.PropTypes.string.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  setPhaseVisibility: React.PropTypes.func.isRequired,
  addAction: React.PropTypes.func.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  update: React.PropTypes.string.isRequired,
  commitOrderChanges: React.PropTypes.func.isRequired
};

export default Phase;
