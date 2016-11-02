import React from 'react';
import './ViewTOS.scss';
import Phase from './Phase';
import formatDate from 'occasion';
import { StickyContainer, Sticky } from 'react-sticky';

export class ViewTOS extends React.Component {
  componentWillMount () {
    this.props.fetchRecordTypes();
    this.props.fetchAttributes();
  }

  formatDateTime (dateTime) {
    const date = dateTime.slice(0, 10);
    const time = dateTime.slice(11, 16);
    return { date, time };
  }
  generateMetaData (attributeTypes, attributes) {
    const attributeElements = [];
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        attributeElements.push(<span>{attributeTypes[key].name}: {attributes[key]}</span>);
      }
    }
    return attributeElements;
  }
  generatePhases (phases) {
    const phaseElements = [];
    for (const key in phases) {
      if (phases.hasOwnProperty(key)) {
        phaseElements.push(
          <Phase
            key={key}
            phaseIndex={key}
            phase={phases[key]}
            setPhaseVisibility={this.props.setPhaseVisibility}
            recordTypes={this.props.recordTypes}
            documentState={this.props.documentState}
            attributes={this.props.attributes}
          />
        );
      }
    }
    return phaseElements;
  }
  render () {
    const { selectedTOS } = this.props;
    if (selectedTOS !== undefined && Object.keys(selectedTOS).length !== 0) {
      const modifiedDateTime = this.formatDateTime(selectedTOS.modified_at);
      const formattedDate = formatDate(modifiedDateTime.date, 'DD.MM.YYYY');
      const phases = this.generatePhases(selectedTOS.phases);
      const TOSMetaData = this.generateMetaData(this.props.attributes, selectedTOS.attributes);
      return (
        <div className='col-xs-12'>
          <StickyContainer className='col-xs-12 single-tos-container'>
            <Sticky className='single-tos-header'>
              <h4>{selectedTOS.function_id} {selectedTOS.name}</h4>
            </Sticky>
            <div className='single-tos-content'>
              <div className='general-info space-between'>
                <div className='version-details'>
                  <h5>Metadata</h5>
                  <span>Versionumero: 1.0</span>
                  <span>Tila: Luonnos</span>
                  <span>Muokkaus ajankohta: { formattedDate } { modifiedDateTime.time }</span>
                  <span>Muokkaaja: Matti Meikäläinen</span>
                  { TOSMetaData }
                </div>
                <div className='document-buttons'>
                  <button className='btn btn-primary'>Tallenna luonnos</button>
                  <button className='btn btn-default'>Lähetä tarkastettavaksi</button>
                </div>
              </div>
              <div className='col-xs-12'>
                <div className='button-row'>
                  <button
                    className='btn btn-default btn-sm pull-right'
                    onClick={() => this.props.setPhasesVisibility(selectedTOS.phases, true)}>
                    Avaa kaikki
                  </button>
                  <button
                    className='btn btn-default btn-sm pull-right'
                    onClick={() => this.props.setPhasesVisibility(selectedTOS.phases, false)}>
                    Pienennä kaikki
                  </button>
                </div>
                { phases }
              </div>
            </div>
          </StickyContainer>
        </div>
      );
    } else {
      return null;
    }
  }
}

ViewTOS.propTypes = {
  selectedTOS: React.PropTypes.object.isRequired,
  setPhaseVisibility: React.PropTypes.func.isRequired,
  setPhasesVisibility: React.PropTypes.func.isRequired,
  setRecordVisibility: React.PropTypes.func.isRequired,
  documentState: React.PropTypes.string.isRequired,
  setDocumentState: React.PropTypes.func.isRequired,
  fetchRecordTypes: React.PropTypes.func.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  fetchAttributes: React.PropTypes.func.isRequired,
  attributes: React.PropTypes.object.isRequired
};

export default ViewTOS;
