import React from 'react';
import './Phase.scss';
import Action from './Action.js';
import { StickyContainer, Sticky } from 'react-sticky';

export class Phase extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {
      name: this.props.phase.name,
      mode: 'view'
    }
  }
  editPhaseTitle () {
    this.setState({mode: 'edit'});
  }
  savePhaseTitle () {
    this.setState({mode: 'view'});
  }
  onChange (event) {
    this.setState({ name: event.target.value });
  }
  generateActions (actions) {
    return actions.map((action, index) => {
      return (
        <Action
          key={index}
          action={action}
          recordTypes={this.props.recordTypes}
          documentState={this.props.documentState}
          attributes={this.props.attributes}
        />
      );
    });
  }

  render () {
    const { phase, phaseIndex } = this.props;
    const actions = this.generateActions(phase.actions);
    let phaseTitle;
    if (this.state.mode === 'view') {
      phaseTitle =
        <span className='phase-title'>
          <i className='fa fa-info-circle' aria-hidden='true' /> {this.state.name}
          <button
            className='button title-edit-button'
            onClick={() => this.editPhaseTitle()}>
            <span className='fa fa-edit' />
          </button>
        </span>;
    }
    if (this.state.mode === 'edit') {
      phaseTitle =
        <div className='phase-title-input'>
          <input className='action-title col-xs-10' value={this.state.name} onChange={this.onChange} />
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
              className='pull-right'
              onClick={() => this.props.setPhaseVisibility(phaseIndex, phase.is_open)}>
              <span
                className={'fa black-icon ' + (phase.is_open ? 'fa-minus' : 'fa-plus')}
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
  setPhaseVisibility: React.PropTypes.func.isRequired
};

export default Phase;
