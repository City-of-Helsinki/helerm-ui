import React from 'react';
import './Phase.scss';
import Action from './Action.js';
import { StickyContainer, Sticky } from 'react-sticky';

export class Phase extends React.Component {
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
    return (
      <StickyContainer className='col-xs-12 box'>
        <Sticky className='phase-title'>
          <i className='fa fa-info-circle' aria-hidden='true' /> {phase.name}
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
