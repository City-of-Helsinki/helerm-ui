import React from 'react';
import { StickyContainer, Sticky } from 'react-sticky';
import formatDate from 'occasion';

import Phase from 'components/TOS/Phase';
import Attribute from 'components/TOS/Attribute';
import ReorderView from 'components/TOS/ReorderView';
import ImportView from 'components/TOS/ImportView';

import Popup from 'components/Popup';
import Dropdown from 'components/Dropdown';

import IsAuthenticated from 'components/IsAuthenticated/IsAuthenticated';

import './ViewTOS.scss';

export class ViewTOS extends React.Component {
  constructor (props) {
    super(props);
    this.fetchTOS = this.fetchTOS.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.sendForInspection = this.sendForInspection.bind(this);
    this.onChange = this.onChange.bind(this);
    this.createNewPhase = this.createNewPhase.bind(this);
    this.cancelPhaseCreation = this.cancelPhaseCreation.bind(this);
    this.setPhaseVisibility = this.setPhaseVisibility.bind(this);
    this.state = {
      createPhaseMode: false,
      newPhaseName: '',
      originalTos: {},
      showImportView: false,
      showMetadata: false,
      showReorderView: false,
      update: ''
    };
  }

  componentDidMount () {
    const { id } = this.props.params;
    this.fetchTOS(id);
  }

  componentWillReceiveProps (nextProps) {
    const { route } = nextProps;

    // If we have selectedTOS & selectedTOS hasn't change during receiveProps
    // => cache it to state to be able to discard changes
    if (
      (this.props.selectedTOS.id || nextProps.selectedTOS.id) &&
      nextProps.selectedTOS.id !== this.props.selectedTOS.id
    ) {
      this.setState({ originalTos: nextProps.selectedTOS });
    }
    if (nextProps.params.id !== this.props.params.id) {
      const { id } = nextProps.params;
      this.fetchTOS(id);
    }
    if (route && route.path === 'view-tos/:id') {
      this.props.setNavigationVisibility(false);
    }
  }

  componentWillUnmount () {
    this.props.clearTOS();
  }

  fetchTOS (id) {
    this.props.fetchTOS(id)
      .then(() => this.props.setNavigationVisibility(false))
      .catch((err) => {
        if (err instanceof URIError) {
          // We have a 404 from API
          this.props.push(`/404?tos-id=${id}`);
        }
      });
  }

  cancelEdit () {
    console.log(this.state.originalTos);
    return this.props.resetTOS(this.state.originalTos);
  }

  sendForInspection () {
    return this.props.sendForInspection(this.props.selectedTOS)
      .then(() => {
        return this.props.displayMessage({
          text: 'Luonnos lähetettiin tarkastettavaksi',
          success: true
        });
      })
      .catch(err => {
        return this.props.displayMessage({
          text: err.message,
          success: false
        });
      });
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
    this.props.displayMessage({
      text: 'Käsittelyvaiheen lisäys onnistui!',
      success: true
    });
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
    const { modified_at, documentState, editRecord, version } = this.props.selectedTOS;
    const modifiedDateTime = this.formatDateTime(modified_at);
    const formattedDate = formatDate(modifiedDateTime.date, 'DD.MM.YYYY');
    const dateTime = formattedDate + ' ' + modifiedDateTime.time;
    const attributeElements = [];
    const versionData = [
      { type: 'Versionumero', name: version.toString() },
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
          documentState={documentState}
          attributeTypes={attributeTypes}
          mode='view'
          type='attribute'
          editable={false}
          editRecord={editRecord}
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
            attributeTypes={attributeTypes}
            documentState={documentState}
            editable={true}
            editRecord={this.props.editRecord}
            showAttributes={this.state.showMetadata}
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
    const phasesOrder = Object.keys(this.props.selectedTOS.phases);
    for (const key in phases) {
      if (phases.hasOwnProperty(key)) {
        phaseElements.push(
          <Phase
            key={key}
            phaseIndex={phases[key].id}
            phase={this.props.selectedTOS.phases[key]}
            phasesOrder={phasesOrder}
            setPhaseVisibility={this.setPhaseVisibility}
            actions={this.props.selectedTOS.actions}
            phases={this.props.selectedTOS.phases}
            records={this.props.selectedTOS.records}
            recordTypes={this.props.recordTypes}
            documentState={this.props.selectedTOS.documentState}
            attributeTypes={this.props.attributeTypes}
            addAction={this.props.addAction}
            addRecord={this.props.addRecord}
            editAction={this.props.editAction}
            editPhase={this.props.editPhase}
            editRecord={this.props.editRecord}
            removeAction={this.props.removeAction}
            removePhase={this.props.removePhase}
            removeRecord={this.props.removeRecord}
            displayMessage={this.props.displayMessage}
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
    const { selectedTOS, isFetching } = this.props;
    if (!isFetching && selectedTOS.id) {
      const phaseElements = this.generatePhases(selectedTOS.phases);
      const TOSMetaData = this.generateMetaData(this.props.attributeTypes, selectedTOS.attributes);

      return (
        <div>
          <StickyContainer className='col-xs-12 single-tos-container'>
            <Sticky className='single-tos-header'>
              <div className='row'>
                <h4 className='col-md-6 col-xs-12'>{selectedTOS.function_id} {selectedTOS.name}</h4>
                <div className='document-buttons col-xs-12 col-md-6'>
                  { selectedTOS.documentState !== 'edit' &&
                  <IsAuthenticated>
                    <span>
                      <button
                        className='btn btn-default btn-sm pull-right'
                        onClick={this.sendForInspection}>
                        Lähetä tarkastettavaksi
                      </button>
                      <button
                        className='btn btn-primary btn-sm pull-right'
                        onClick={() => this.props.setDocumentState('edit')}>
                        Muokkaustila
                      </button>
                    </span>
                  </IsAuthenticated>
                  }
                  { selectedTOS.documentState === 'edit' &&
                  <span>
                    <button
                      className='btn btn-primary btn-sm pull-right'
                      onClick={() => this.props.setDocumentState('view')}>
                      Tallenna luonnos
                    </button>
                    <button
                      className='btn btn-danger btn-sm pull-right'
                      onClick={this.cancelEdit}>
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
                  { selectedTOS.documentState === 'edit' && !this.state.createPhaseMode &&
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
                    onClick={() => this.props.setPhasesVisibility(selectedTOS.phases, true)}>
                    Avaa kaikki
                  </button>
                  <button
                    className='btn btn-default btn-sm pull-right'
                    onClick={() => this.props.setPhasesVisibility(selectedTOS.phases, false)}>
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
                        keys={Object.keys(selectedTOS.phases)}
                        values={selectedTOS.phases}
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
                        phases={selectedTOS.phases}
                        phasesOrder={selectedTOS.phases}
                        actions={selectedTOS.actions}
                        records={selectedTOS.records}
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
  addAction: React.PropTypes.func.isRequired,
  addPhase: React.PropTypes.func.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  changeOrder: React.PropTypes.func.isRequired,
  clearTOS: React.PropTypes.func.isRequired,
  displayMessage: React.PropTypes.func.isRequired,
  editAction: React.PropTypes.func.isRequired,
  editPhase: React.PropTypes.func.isRequired,
  editRecord: React.PropTypes.func.isRequired,
  fetchTOS: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  params: React.PropTypes.object.isRequired,
  push: React.PropTypes.func.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  removeAction: React.PropTypes.func.isRequired,
  removePhase: React.PropTypes.func.isRequired,
  removeRecord: React.PropTypes.func.isRequired,
  resetTOS: React.PropTypes.func.isRequired,
  route: React.PropTypes.object.isRequired,
  selectedTOS: React.PropTypes.object.isRequired,
  sendForInspection: React.PropTypes.func.isRequired,
  setDocumentState: React.PropTypes.func.isRequired,
  setNavigationVisibility: React.PropTypes.func.isRequired,
  setPhaseVisibility: React.PropTypes.func.isRequired,
  setPhasesVisibility: React.PropTypes.func.isRequired
};

export default ViewTOS;
