import React from 'react';
import './Phase.scss';
import Action from './Action.js';
import { StickyContainer, Sticky } from 'react-sticky';

export class Phase extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onNewChange = this.onNewChange.bind(this);
    this.createNewAction = this.createNewAction.bind(this);
    this.addAction = this.addAction.bind(this);
    this.cancelRecordCreation = this.cancelRecordCreation.bind(this);
    this.state = {
      name: this.props.phase.name,
      newActionName: '',
      mode: 'view'
    };
  }
  editPhaseTitle () {
    this.setState({ mode: 'edit' });
  }
  savePhaseTitle () {
    this.setState({ mode: 'view' });
  }
  onChange (event) {
    this.setState({ name: event.target.value });
  }
  onNewChange (event) {
    this.setState({ newActionName: event.target.value });
  }
  generateActions (actions) {
    return actions.map((action, index) => {
      return (
        <Action
          key={index}
          action={action}
          actionIndex={index}
          recordTypes={this.props.recordTypes}
          documentState={this.props.documentState}
          attributes={this.props.attributes}
          phaseIndex={this.props.phaseIndex}
          addRecord={this.props.addRecord}
        />
      );
    });
  }
  createNewAction () {
    this.setState({ mode: 'add' });
  }
  addAction (event) {
    event.preventDefault();
    this.props.addAction(this.props.phaseIndex, this.state.newActionName);
    this.setState({ mode: 'view' });
  }
  cancelRecordCreation () {
    this.setState({ newActionName: '', mode: 'view' });
  }
  render () {
    const { phase, phaseIndex } = this.props;
    const actions = this.generateActions(phase.actions);
    let phaseTitle;
    if (this.state.mode !== 'edit') {
      phaseTitle =
        <span className='phase-title'>
          <i className='fa fa-info-circle' aria-hidden='true' /> {this.state.name}
          { this.props.documentState === 'edit' &&
            <button
              className='btn btn-default btn-sm title-edit-button'
              onClick={() => this.editPhaseTitle()}>
              <span className='fa fa-edit' />
            </button>
          }
        </span>;
    }
    if (this.state.mode === 'edit') {
      phaseTitle =
        <div className='phase-title-input'>
          <input className='input-title col-xs-10' value={this.state.name} onChange={this.onChange} />
          <button className='btn btn-primary col-xs-2' onClick={() => this.savePhaseTitle()}>Valmis</button>
        </div>;
    }
    return (
      <StickyContainer className='col-xs-12 box'>
        <Sticky className='phase-title'>
          { phaseTitle }
          { phase.actions.length !== 0 &&
            <button
              type='button'
              className='btn btn-default btn-sm pull-right'
              onClick={() => this.props.setPhaseVisibility(phaseIndex, phase.is_open)}>
              <span
                className={'fa ' + (phase.is_open ? 'fa-minus' : 'fa-expand')}
                aria-hidden='true'
              />
            </button>
          }
        </Sticky>
        { phase.is_open &&
          <div className={(phase.is_open ? 'show-actions' : 'hide-actions')}>
            { actions }
          </div>
        }
        { this.props.documentState === 'edit' && this.state.mode !== 'add' &&
          <button className='btn btn-primary btn-sm btn-new-record' onClick={() => this.createNewAction()}>
            <i className='fa fa-plus' /> Uusi toimenpide
          </button>
        }
        { this.state.mode === 'add' &&
          <form onSubmit={this.addAction} className='row'>
            <input type='text' className='col-xs-8' value={this.state.newActionName} onChange={this.onNewChange} />
            <div className='col-xs-4'>
              <button className='btn btn-primary pull-left' type='submit'>Lisää</button>
              <button className='btn btn-default pull-left' onClick={() => this.cancelRecordCreation()}>Peruuta</button>
            </div>
          </form>
        }
      </StickyContainer>
    );
  }
}

Phase.propTypes = {
  phase: React.PropTypes.object.isRequired,
  phaseIndex: React.PropTypes.string.isRequired,
  attributes: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  setPhaseVisibility: React.PropTypes.func.isRequired,
  addAction: React.PropTypes.func.isRequired,
  addRecord: React.PropTypes.func.isRequired
};

export default Phase;
