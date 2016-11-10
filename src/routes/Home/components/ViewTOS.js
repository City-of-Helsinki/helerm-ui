import React from 'react';
import './ViewTOS.scss';
import Phase from './Phase';
import TOSMetadata from './TOSMetadata';
import formatDate from 'occasion';
import { StickyContainer, Sticky } from 'react-sticky';

export class ViewTOS extends React.Component {
  constructor (props) {
    super(props);
    this.editMetadata = this.editMetadata.bind(this);
    this.saveMetadata = this.saveMetadata.bind(this);
    this.cancelMetadata = this.cancelMetadata.bind(this);
    this.state = {
      metadataMode: 'view',
      showMetadata: false
    };
  }
  formatDateTime (dateTime) {
    const date = dateTime.slice(0, 10);
    const time = dateTime.slice(11, 16);
    return { date, time };
  }
  cancelMetadata () {
    this.setState({ medadataMode: 'view' });
  }
  editMetadata () {
    this.setState({ showMetadata: true, metadataMode: 'edit' });
  }
  saveMetadata () {
    this.setState({ metadataMode: 'view' });
  }
  toggleMetadataVisibility (current) {
    this.setState({ showMetadata: !current });
  }
  generateMetaData (attributeTypes, attributes) {
    const modifiedDateTime = this.formatDateTime(this.props.selectedTOS.modified_at);
    const formattedDate = formatDate(modifiedDateTime.date, 'DD.MM.YYYY');
    const dateTime = formattedDate + ' ' + modifiedDateTime.time;
    const attributeElements = [];
    const versionData = [
      { type: 'Versionumero', name: '1.0' },
      { type: 'Tila', name: 'Luonnos' },
      { type: 'Muokkausajankohta', name: dateTime },
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
    const metadataElement = (
      <div>
        <div className='metadata-data-row__primary'>
          {attributeElements.slice(0, 2)}
        </div>
        <div className='metadata-buttons'>
          { this.state.metadataMode !== 'edit' &&
            this.props.documentState === 'edit' &&
            <button
              className='btn btn-default btn-sm title-edit-button'
              onClick={this.editMetadata} title='Muokkaa'>
              <span className='fa fa-edit' />
            </button>
          }
          <button
            type='button'
            className='btn btn-default btn-sm'
            title={this.state.showMetadata ? 'Pienennä' : 'Laajenna'}
            onClick={() => this.toggleMetadataVisibility(this.state.showMetadata)}>
            <span
              className={'fa ' + (this.state.showMetadata ? 'fa-minus' : 'fa-plus')}
              aria-hidden='true'
            />
          </button>
        </div>
        <div className={'metadata-data-row__secondary ' + (this.state.showMetadata ? '' : 'hidden')}>
          {attributeElements.slice(2)}
        </div>
      </div>
    );
    return metadataElement;
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
              <div className='row'>
                <h4 className='col-md-6 col-xs-12'>{selectedTOS.function_id} {selectedTOS.name}</h4>
                <div className='document-buttons col-xs-12 col-md-6'>
                  { this.props.documentState !== 'edit' &&
                    <button
                      className='btn btn-primary btn-sm'
                      onClick={() => this.props.setDocumentState('edit')}>
                      Muokkaustila
                    </button>
                  }
                  { this.props.documentState === 'edit' &&
                    <button
                      className='btn btn-danger btn-sm'
                      onClick={() => this.props.setDocumentState('view')}>
                      Peruuta muokkaus
                    </button>
                  }
                  { this.props.documentState === 'edit' &&
                    <button
                      className='btn btn-primary btn-sm'
                      onClick={() => this.props.setDocumentState('view')}>
                      Tallenna luonnos
                    </button>
                  }
                  <button className='btn btn-default btn-sm'>Lähetä tarkastettavaksi</button>
                </div>
              </div>
            </Sticky>
            <div className='single-tos-content'>
              <div className='row'>
                <div className='general-info space-between'>
                  <div className='version-details col-xs-12'>
                    { this.state.metadataMode === 'edit' &&
                      <span className='fa fa-asterisk required-asterisk required-legend col-xs-12'> Pakollinen tieto
                      </span>
                    }
                    { TOSMetaData }
                    { this.state.metadataMode === 'edit' &&
                      <button
                        className='btn btn-primary pull-right edit-record__submit'
                        onClick={this.saveMetadata}>
                        Valmis
                      </button>
                    }
                    { this.state.metadataMode === 'edit' &&
                      <button
                        className='btn btn-default pull-right edit-record__cancel'
                        onClick={this.saveMetadata}>
                        Peruuta
                      </button>
                    }
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
  documentState: React.PropTypes.string.isRequired,
  setDocumentState: React.PropTypes.func.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  attributes: React.PropTypes.object.isRequired,
  addAction: React.PropTypes.func.isRequired,
  addRecord: React.PropTypes.func.isRequired
};

export default ViewTOS;
