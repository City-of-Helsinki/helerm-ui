import React from 'react';
import { StickyContainer, Sticky } from 'react-sticky';
import formatDate from 'occasion';

import Phase from '../../Home/components/Phase';
import Attribute from '../../Home/components/Attribute';
import ReorderView from '../../Home/components/ReorderView';
import ImportView from '../../Home/components/ImportView';

import Popup from 'components/Popup';
import Dropdown from 'components/Dropdown';

import './ViewTOS.scss';

export class ViewTOS extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.createNewPhase = this.createNewPhase.bind(this);
    this.cancelPhaseCreation = this.cancelPhaseCreation.bind(this);
    this.setPhaseVisibility = this.setPhaseVisibility.bind(this);
    this.state = {
      showMetadata: false,
      createPhaseMode: false,
      newPhaseName: '',
      update: '',
      showReorderView: false,
      showImportView: false
    };
  }

  componentDidMount () {
    const { id } = this.props.params;
    this.props.fetchTOS(id);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      this.props.fetchTOS(nextProps.params.id);
    }
  }

  formatDateTime (dateTime) {
    const date = dateTime.slice(0, 10);
    const time = dateTime.slice(11, 16);
    return { date, time };
  }

  toggleMetadataVisibility (current) {
    this.setState({ showMetadata: !current });
  }

  addPhase () {
    this.setState({ createPhaseMode: true });
  }

  createNewPhase (event) {
    event.preventDefault();
    if (this.state.newPhaseName.length > 0) {
      this.props.addPhase(this.state.newPhaseName, this.props.selectedTOS.id);
      this.setState({ createPhaseMode: false, newPhaseName: '' });
    }
  }

  cancelPhaseCreation (event) {
    event.preventDefault();
    this.setState({ newPhaseName: '', createPhaseMode: false });
  }

  onChange (event) {
    this.setState({ newPhaseName: event.target.value });
  }

  /*
   setPhaseVisibility is a hack to fix firefox specific issue of re-rendering phases
   remove once firefox issue is fixed
   */
  setPhaseVisibility (x, y) {
    const newString = Math.random().toString(36).replace(/[^a-z]+/g, '');
    this.setState({ update: newString });
    this.props.setPhaseVisibility(x, y);
  }

  toggleReorderView () {
    const current = this.state.showReorderView;
    this.setState({ showReorderView: !current });
  }

  toggleImportView () {
    const current = this.state.showImportView;
    this.setState({ showImportView: !current });
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
        <Attribute
          key={index}
          attributeIndex={metadata.type}
          attributeKey={metadata.type}
          attribute={metadata.name}
          documentState={this.props.documentState}
          attributeTypes={this.props.attributeTypes}
          mode='view'
          type='attribute'
          editable={false}
          showAttributes={true}
        />
      );
    });
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        attributeElements.push(
          <Attribute
            key={key}
            attributeIndex={key}
            attributeKey={this.props.attributeTypes[key].name}
            attribute={attributes[key]}
            mode='view'
            type='attribute'
            attributeTypes={this.props.attributeTypes}
            documentState={this.props.documentState}
            showAttributes={this.state.showMetadata}
            editable={true}
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
          <button
            type='button'
            className='btn btn-info btn-sm'
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
            phaseIndex={phases[key]}
            phase={this.props.phases[phases[key]]}
            phasesOrder={this.props.selectedTOS.phases}
            phases={this.props.phases}
            actions={this.props.actions}
            records={this.props.records}
            setPhaseVisibility={this.setPhaseVisibility}
            recordTypes={this.props.recordTypes}
            documentState={this.props.documentState}
            attributeTypes={this.props.attributeTypes}
            addAction={this.props.addAction}
            addRecord={this.props.addRecord}
            changeOrder={this.props.changeOrder}
            importItems={this.props.importItems}
            update={this.state.update}
          />
        );
      }
    }
    return phaseElements;
  }

  render () {
    const { selectedTOS, phases, isFetching } = this.props;
    if (!isFetching && selectedTOS !== undefined && Object.keys(selectedTOS).length !== 0) {
      const phaseElements = this.generatePhases(selectedTOS.phases);
      const TOSMetaData = this.generateMetaData(this.props.attributeTypes, selectedTOS.attributes);

      return (
        <div>
          <StickyContainer className='col-xs-12 single-tos-container'>
            <Sticky className='single-tos-header'>
              <div className='row'>
                <h4 className='col-md-6 col-xs-12'>{selectedTOS.function_id} {selectedTOS.name}</h4>
                <div className='document-buttons col-xs-12 col-md-6'>
                  { this.props.documentState !== 'edit' &&
                  <span>
                    <button className='btn btn-default btn-sm pull-right'>Lähetä tarkastettavaksi</button>
                    <button
                      className='btn btn-primary btn-sm pull-right'
                      onClick={() => this.props.setDocumentState('edit')}>
                      Muokkaustila
                    </button>
                  </span>
                  }
                  { this.props.documentState === 'edit' &&
                  <span>
                    <button
                      className='btn btn-primary btn-sm pull-right'
                      onClick={() => this.props.setDocumentState('view')}>
                      Tallenna luonnos
                    </button>
                    <button
                      className='btn btn-danger btn-sm pull-right'
                      onClick={() => this.props.setDocumentState('view')}>
                      Peruuta muokkaus
                    </button>
                    <span
                      className='fa fa-asterisk required-asterisk required-legend'> = Pakollinen tieto
                    </span>
                  </span>
                  }
                </div>
              </div>
            </Sticky>
            <div className='single-tos-content'>
              <div className='row'>
                <div className='general-info space-between'>
                  <div className='version-details col-xs-12'>
                    { TOSMetaData }
                  </div>
                </div>
                <div className='col-xs-12 button-row'>
                  { this.props.documentState === 'edit' && !this.state.createPhaseMode &&
                  <span className='pull-right'>
                    <Dropdown
                      children={[
                        {
                          text: 'Uusi käsittelyvaihe',
                          icon: 'fa-file-text',
                          style: 'btn-primary',
                          action: () => this.addPhase()
                        }, {
                          text: 'Tuo käsittelyvaihe',
                          icon: 'fa-download',
                          style: 'btn-primary',
                          action: () => this.toggleImportView()
                        }, {
                          text: 'Järjestä käsittelyvaiheita',
                          icon: 'fa-th-list',
                          style: 'btn-primary',
                          action: () => this.toggleReorderView()
                        }
                      ]}
                      small={true}
                    />
                    </span>
                  }
                  <button
                    className='btn btn-default btn-sm pull-right'
                    onClick={() => this.props.setPhasesVisibility(phases, true)}>
                    Avaa kaikki
                  </button>
                  <button
                    className='btn btn-default btn-sm pull-right'
                    onClick={() => this.props.setPhasesVisibility(phases, false)}>
                    Pienennä kaikki
                  </button>
                </div>
                <div className='col-xs-12'>
                  { this.state.createPhaseMode &&
                  <form onSubmit={this.createNewPhase} className='col-xs-12 phase-form'>
                    <h5>Uusi käsittelyvaihe</h5>
                    <div className='col-xs-12 col-md-6'>
                      <input
                        type='text'
                        className='form-control'
                        value={this.state.newPhaseName}
                        onChange={this.onChange}
                        onSubmit={this.createNewPhase}
                        placeholder='Käsittelyvaiheen nimi'
                      />
                    </div>
                    <div className='col-xs-12 col-md-4'>
                      <button
                        className='btn btn-danger pull-left'
                        onClick={this.cancelPhaseCreation}>
                        Peruuta
                      </button>
                      <button className='btn btn-primary pull-left' type='submit'>Lisää</button>
                    </div>
                  </form>
                  }
                  { phaseElements }
                  { this.state.showReorderView &&
                  <Popup
                    content={
                      <ReorderView
                        target='phase'
                        toggleReorderView={() => this.toggleReorderView()}
                        keys={this.props.selectedTOS.phases}
                        values={this.props.phases}
                        changeOrder={this.props.changeOrder}
                        parent={null}
                        parentName={selectedTOS.function_id + ' ' + selectedTOS.name}
                      />
                    }
                    closePopup={() => this.toggleReorderView()}
                  />
                  }
                  { this.state.showImportView &&
                  <Popup
                    content={
                      <ImportView
                        level='phase'
                        toggleImportView={() => this.toggleImportView()}
                        phases={this.props.phases}
                        phasesOrder={this.props.selectedTOS.phases}
                        actions={this.props.actions}
                        records={this.props.records}
                        importItems={this.props.importItems}
                        title='käsittelyvaiheita'
                        targetText={'TOS-kuvaukseen ' + selectedTOS.name}
                        itemsToImportText='käsittelyvaiheet'
                      />
                    }
                    closePopup={() => this.toggleImportView()}
                  />
                  }
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
  // actions: React.PropTypes.object.isRequired,
  addAction: React.PropTypes.func.isRequired,
  addPhase: React.PropTypes.func.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  changeOrder: React.PropTypes.func.isRequired,
  documentState: React.PropTypes.string.isRequired,
  fetchTOS: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  params: React.PropTypes.object.isRequired,
  // phases: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  // records: React.PropTypes.object.isRequired,
  selectedTOS: React.PropTypes.object.isRequired,
  setDocumentState: React.PropTypes.func.isRequired,
  setPhaseVisibility: React.PropTypes.func.isRequired,
  setPhasesVisibility: React.PropTypes.func.isRequired
};

export default ViewTOS;
