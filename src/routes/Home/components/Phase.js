import React from 'react';
import './Phase.scss';
import Action from './Action.js';
import DeletePopup from './DeletePopup';
import { StickyContainer, Sticky } from 'react-sticky';

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
      deleted: false
    };
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
    const { phase, phaseIndex, actions } = this.props;
    const actionElements = this.generateActions(phase.actions);
    let phaseTitle;
    if (this.state.mode !== 'edit') {
      phaseTitle =
        <span className='phase-title' onClick={() => this.editPhaseTitle()}>
          <i className='fa fa-info-circle' aria-hidden='true' /> {this.state.name}
        </span>;
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
          <StickyContainer className='col-xs-12 box'>
            <Sticky className='phase-title'>
              { phaseTitle }
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
              { actions.length !== 0 &&
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
            </Sticky>
            <div className={(phase.is_open ? '' : 'hidden')}>
              { actionElements }
            </div>
            { this.props.documentState === 'edit' && this.state.mode !== 'add' &&
              <button className='btn btn-primary btn-sm btn-new-record' onClick={() => this.createNewAction()}>
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
                <div className='col-xs-12 col-md-4'>
                  <button className='btn btn-primary pull-left' type='submit'>Lisää</button>
                  <button
                    className='btn btn-default pull-left'
                    onClick={this.cancelActionCreation}>
                    Peruuta
                  </button>
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
  addRecord: React.PropTypes.func.isRequired
};

export default Phase;
