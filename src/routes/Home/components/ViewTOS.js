import React from 'react';
import './ViewTOS.scss';
import Phase from './Phase';
import TOSMetadata from './TOSMetadata';
import formatDate from 'occasion';
import { StickyContainer, Sticky } from 'react-sticky';

export class ViewTOS extends React.Component {
  constructor(props) {
    super(props);
    this.editMetadata = this.editMetadata.bind(this);
    this.saveMetadata = this.saveMetadata.bind(this);
    this.state = {
      metadataMode: 'view'
    }
  }
  componentWillMount () {
    this.props.fetchRecordTypes();
    this.props.fetchAttributes();
  }

  formatDateTime (dateTime) {
    const date = dateTime.slice(0, 10);
    const time = dateTime.slice(11, 16);
    return { date, time };
  }
  editMetadata () {
    this.setState({metadataMode: 'edit'});
  }
  saveMetadata () {
    this.setState({metadataMode: 'view'});
  }
  generateMetaData (attributeTypes, attributes) {
    const modifiedDateTime = this.formatDateTime(this.props.selectedTOS.modified_at);
    const formattedDate = formatDate(modifiedDateTime.date, 'DD.MM.YYYY');
    const dateTime = formattedDate + ' ' + modifiedDateTime.time;
    const attributeElements = [];
    const versionData = [
      { type: 'Versionumero', name: '1.0' },
      { type: 'Tila', name: 'Luonnos' },
      { type: 'Muokkaus ajankohta', name: dateTime },
      { type: 'Muokkaaja', name: 'Matti Meikäläinen' }
    ];
    versionData.map((metadata, index) => {
      attributeElements.push(
        <TOSMetadata
          key={index}
          type={metadata.type}
          name={metadata.name}
          mode={this.state.metadataMode}
          editable={false}
        />
      );
    });
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        attributeElements.push(
          <TOSMetadata
            key={key}
            typeIndex={key}
            type={attributeTypes[key].name}
            name={attributes[key]}
            mode={this.state.metadataMode}
            attributes={this.props.attributes}
            editable
          />
        );
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
            addAction={this.props.addAction}
            addRecord={this.props.addRecord}
          />
        );
      }
    }
    return phaseElements;
  }
  render () {
    const { selectedTOS } = this.props;
    if (selectedTOS !== undefined && Object.keys(selectedTOS).length !== 0) {
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
                <div className='version-details col-xs-8'>
                  <h5>Metadata
                    { this.state.metadataMode !== 'edit' &&
                      this.props.documentState === 'edit' &&
                      <button
                        className='btn btn-default btn-sm title-edit-button pull-right'
                        onClick={this.editMetadata}>
                        <span className='fa fa-edit' />
                      </button>
                    }
                  </h5>
                  { TOSMetaData }
                  { this.state.metadataMode === 'edit' &&
                    <button
                      className='btn btn-default btn-sm pull-right col-xs-3'
                      onClick={this.saveMetadata}>
                      <span className='fa fa-save' />
                    </button>
                  }
                </div>
                <div className='document-buttons col-xs-4'>
                  { this.props.documentState !== 'edit' &&
                    <button
                      className='btn btn-primary'
                      onClick={() => this.props.setDocumentState('edit')}>
                      Muokkaustila
                    </button>
                  }
                  { this.props.documentState === 'edit' &&
                    <button
                      className='btn btn-danger'
                      onClick={() => this.props.setDocumentState('view')}>
                      Peruuta Muokkaus
                    </button>
                  }
                  <button
                    className='btn btn-primary'
                    onClick={() => this.props.setDocumentState('view')}>
                    Tallenna luonnos
                  </button>
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
  attributes: React.PropTypes.object.isRequired,
  addAction: React.PropTypes.func.isRequired,
  addRecord: React.PropTypes.func.isRequired

};

export default ViewTOS;
