import React from 'react';
import { withRouter, routerShape } from 'react-router';
import { StickyContainer } from 'react-sticky';

import Phase from 'components/Tos/Phase/Phase';
import CreatePhaseForm from 'components/Tos/Phase/CreatePhaseForm';
import Attribute from 'components/Tos/Attribute/Attribute';
import ReorderView from 'components/Tos/Reorder/ReorderView';
import ImportView from 'components/Tos/ImportView/ImportView';
import CloneView from 'components/Tos/CloneView/CloneView';
import EditorForm from 'components/Tos/EditorForm/EditorForm';
import TosHeader from 'components/Tos/Header/TosHeader';

import Popup from 'components/Popup';
import Dropdown from 'components/Dropdown';

import { formatDateTime, getStatusLabel } from '../../../utils/helpers';
import {
  validateTOS,
  validatePhase,
  validateAction,
  validateRecord
} from '../../../utils/validators';

import './ViewTos.scss';

export class ViewTOS extends React.Component {
  constructor (props) {
    super(props);
    this.setDocumentState = this.setDocumentState.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.cancelMetaDataEdit = this.cancelMetaDataEdit.bind(this);
    this.cancelMetaDataComplement = this.cancelMetaDataComplement.bind(this);
    this.cancelPhaseCreation = this.cancelPhaseCreation.bind(this);
    this.changeStatus = this.changeStatus.bind(this);
    this.cloneFromTemplate = this.cloneFromTemplate.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.onChange = this.onChange.bind(this);
    this.createNewPhase = this.createNewPhase.bind(this);
    this.editMetaDataWithForm = this.editMetaDataWithForm.bind(this);
    this.fetchTOS = this.fetchTOS.bind(this);
    this.onChange = this.onChange.bind(this);
    this.routerWillLeave = this.routerWillLeave.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.setPhaseVisibility = this.setPhaseVisibility.bind(this);
    this.updateTOSAttribute = this.updateTOSAttribute.bind(this);
    this.setValidationVisibility = this.setValidationVisibility.bind(this);
    this.review = this.review.bind(this);

    this.state = {
      createPhaseMode: false,
      newPhaseName: '',
      originalTos: {},
      isDirty: false,
      showCloneView: false,
      showImportView: false,
      showReorderView: false,
      showMetadata: false,
      showValidationBar: false,
      update: ''
    };
  }

  componentDidMount () {
    const { params: { id }, router, route } = this.props;
    router.setRouteLeaveHook(route, this.routerWillLeave);

    this.fetchTOS(id);
  }

  componentWillReceiveProps (nextProps) {
    const { route } = nextProps;
    // If we have selectedTOS & selectedTOS hasn't change during receiveProps
    // => cache it to state to be able to discard changes
    if (
      (this.props.selectedTOS.id || nextProps.selectedTOS.id) &&
      nextProps.selectedTOS.id !== this.props.selectedTOS.id ||
      nextProps.selectedTOS.version !== this.props.selectedTOS.version
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

    if (nextProps.selectedTOS.documentState === 'view') {
      this.setState({
        editingMetaData: false,
        complementingMetaData: false
      });
    }
  }

  componentWillUnmount () {
    this.props.clearTOS();
  }

  routerWillLeave (e) {
    const { isDirty } = this.state;

    if (isDirty) {
      const message = 'Muutoksia ei ole tallennettu, haluatko silti jatkaa?';
      (e || window.event).returnValue = message;
      return message;
    }
  }

  fetchTOS (id, params = {}) {
    this.props.fetchTOS(id, params)
      .then(() => this.props.setNavigationVisibility(false))
      .catch((err) => {
        if (err instanceof URIError) {
          // We have a 404 from API
          this.props.push(`/404?tos-id=${id}`);
        }
      });
  }

  review (status) {
    if (this.validateAttributes()) {
      this.changeStatus(status);
    } else {
      this.setState({ invalidAttributes: this.validateAttributes });
      this.props.setValidationVisibility(true);
    }
  }

  validateAttributes () {
    const { selectedTOS, attributeTypes } = this.props;
    const invalidTOSAttributes = validateTOS(selectedTOS, attributeTypes).length > 0;
    const invalidPhaseAttributes = !this.evaluateAttributes(selectedTOS.phases, validatePhase, attributeTypes);
    const invalidActionAttributes = !this.evaluateAttributes(selectedTOS.actions, validateAction, attributeTypes);
    const invalidRecordAttributes = !this.evaluateAttributes(selectedTOS.records, validateRecord, attributeTypes);
    return !invalidTOSAttributes && !invalidPhaseAttributes && !invalidActionAttributes && !invalidRecordAttributes;
  }

  evaluateAttributes (items, validate, attributeTypes) {
    if (Object.keys(items).length > 0) {
      for (const item in items) {
        const validAttributes = validate(items[item], attributeTypes).length === 0;
        if (!validAttributes) {
          return false;
        }
      }
    }
    return true;
  }

  setDocumentState (state) {
    return this.setState({ isDirty: true }, () => {
      return this.props.setDocumentState(state);
    });
  }

  setValidationVisibility (value) {
    this.props.setValidationVisibility(value);
    this.setState({ showValidationBar: value });
  }

  cancelEdit () {
    return this.setState({ isDirty: false }, () => {
      return this.props.resetTOS(this.state.originalTos);
    });
  }

  cancelMetaDataEdit () {
    this.setState({ editingMetaData: false });
  }

  cancelMetaDataComplement () {
    this.setState({ complementingMetaData: false });
  }

  saveDraft () {
    return this.props.saveDraft()
      .then(() => {
        return this.props.displayMessage({
          title: 'Luonnos',
          body: 'Luonnos tallennettu!'
        });
      })
      .catch(err => {
        return this.props.displayMessage({
          title: 'Virhe',
          body: `"${err.message}"`
        }, { type: 'error' });
      });
  }

  changeStatus (status) {
    const { state } = this.props.selectedTOS;
    return this.props.changeStatus(status)
      .then(() => {
        return this.props.displayMessage({
          title: 'Tila vaihdettu!',
          body: `${getStatusLabel(state)} => ${getStatusLabel(status)}`
        });
      })
      .catch(err => {
        return this.props.displayMessage({
          title: 'Virhe',
          body: `"${err.message}"`
        }, { type: 'error' });
      });
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
      title: 'Käsittelyvaihe',
      body: 'Käsittelyvaiheen lisäys onnistui!'
    });
  }

  cancelPhaseCreation (event) {
    event.preventDefault();
    this.setState({ newPhaseName: '', createPhaseMode: false });
  }

  cloneFromTemplate (selectedMethod, id) {
    const { cloneFromTemplate } = this.props;
    return cloneFromTemplate(selectedMethod, id)
      .then(() => {
        return this.props.displayMessage({
          title: 'Kuvaus',
          body: 'Kuvauksen tuonti onnistui!'
        });
      })
      .catch((err) => {
        return this.props.displayMessage({
          title: 'Virhe',
          body: `"${err.message}"`
        }, { type: 'warning' });
      });
  }

  onChange (event) {
    this.setState({ newPhaseName: event.target.value });
  }

  updateTOSAttribute (attribute, attributeIndex) {
    const updatedTOSAttribute = {
      tosAttribute: attribute,
      attributeIndex
    };
    this.props.editRecordAttribute(updatedTOSAttribute);
  }

  editMetaDataWithForm (attributes) {
    this.setState({
      editingMetaData: false,
      complementingMetaData: false
    });
    this.props.editMetaData(attributes);
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

  toggleCloneView () {
    const current = this.state.showCloneView;
    this.setState({ showCloneView: !current });
  }

  generateMetaData (attributeTypes, attributes) {
    const { modified_at, documentState, editRecord, version, state, modified_by } = this.props.selectedTOS;
    const formattedDateTime = formatDateTime(modified_at);

    const attributeElements = [];
    const versionData = [
      { type: 'Versionumero', name: version.toString() },
      { type: 'Tila', name: getStatusLabel(state) },
      { type: 'Muokkausajankohta', name: formattedDateTime },
      { type: 'Muokkaaja', name: modified_by }
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
            tosAttribute={true}
            updateTOSAttribute={this.updateTOSAttribute}
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
          {this.props.selectedTOS.documentState === 'edit' &&
          <span className='action-dropdown-button'>
            <Dropdown
              children={[
                {
                  text: 'Muokkaa metatietoja',
                  icon: 'fa-pencil',
                  style: 'btn-primary',
                  action: () => this.setState({ editingMetaData: true })
                },
                {
                  text: 'Täydennä metatietoja',
                  icon: 'fa-plus-square',
                  style: 'btn-primary',
                  action: () => this.setState({ complementingMetaData: true })
                },
                {
                  text: 'Tuo kuvaus',
                  icon: 'fa-clone',
                  style: 'btn-primary',
                  action: () => this.toggleCloneView()
                }
              ]}
              small={true}
            />
          </span>
          }
        </div>
        <div className={'metadata-data-row__secondary ' + (this.state.showMetadata ? '' : 'hidden')}>
          {attributeElements.slice(2)}
        </div>
      </div>
    );
    return metadataElement;
  }

  generatePhases (phases, phasesOrder) {
    const phaseElements = [];
    if (phases) {
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
              editRecordAttribute={this.props.editRecordAttribute}
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
    }
    return phaseElements;
  }

  render () {
    const { attributeTypes, selectedTOS, isFetching, templates } = this.props;
    if (!isFetching && selectedTOS.id) {
      const phasesOrder = Object.keys(selectedTOS.phases);
      const phaseElements = this.generatePhases(selectedTOS.phases, phasesOrder);
      const TOSMetaData = this.generateMetaData(attributeTypes, selectedTOS.attributes);
      return (
        <div>
          <StickyContainer className='col-xs-12 single-tos-container'>

            <TosHeader
              cancelEdit={this.cancelEdit}
              changeStatus={this.changeStatus}
              documentState={selectedTOS.documentState}
              fetchTos={this.fetchTOS}
              functionId={selectedTOS.function_id}
              name={selectedTOS.name}
              state={selectedTOS.state}
              setDocumentState={(state) => this.setDocumentState(state)}
              setValidationVisibility={this.setValidationVisibility}
              review={this.review}
              saveDraft={this.saveDraft}
              tosId={selectedTOS.id}
            />

            <div className='single-tos-content'>
              <div className='row'>
                <div className='general-info space-between'>
                  {this.state.editingMetaData &&
                  <EditorForm
                    targetId={this.props.selectedTOS.id}
                    attributes={this.props.selectedTOS.attributes}
                    attributeTypes={this.props.attributeTypes}
                    editMetaDataWithForm={this.editMetaDataWithForm}
                    editorConfig={{
                      type: 'function',
                      action: 'edit'
                    }}
                    closeEditorForm={this.cancelMetaDataEdit}
                    displayMessage={this.props.displayMessage}
                  />
                  }
                  {this.state.complementingMetaData &&
                  <EditorForm
                    targetId={this.props.selectedTOS.id}
                    attributes={this.props.selectedTOS.attributes}
                    attributeTypes={this.props.attributeTypes}
                    editMetaDataWithForm={this.editMetaDataWithForm}
                    editorConfig={{
                      type: 'function',
                      action: 'complement'
                    }}
                    closeEditorForm={this.cancelMetaDataComplement}
                    displayMessage={this.props.displayMessage}
                  />
                  }
                  {(!this.state.editingMetaData && !this.state.complementingMetaData) &&
                  <div className='version-details col-xs-12'>
                    { TOSMetaData }
                  </div>
                  }
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
                  <CreatePhaseForm
                    newPhaseName={this.state.newPhaseName}
                    onChange={this.onChange}
                    submit={this.createNewPhase}
                    cancel={this.cancelPhaseCreation}
                  />
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
                        phasesOrder={phasesOrder}
                        actions={selectedTOS.actions}
                        records={selectedTOS.records}
                        importItems={this.props.importItems}
                        title='käsittelyvaiheita'
                        targetText={'Tos-kuvaukseen ' + selectedTOS.name}
                        itemsToImportText='käsittelyvaiheet'
                      />
                    }
                    closePopup={() => this.toggleImportView()}
                  />
                  }
                  { this.state.showCloneView &&
                  <Popup
                    content={
                      <CloneView
                        cloneFromTemplate={(selectedMethod, id) => this.cloneFromTemplate(selectedMethod, id)}
                        setNavigationVisibility={this.props.setNavigationVisibility}
                        templates={templates}
                        toggleCloneView={() => this.toggleCloneView()}
                      />
                    }
                    closePopup={() => this.toggleCloneView()}
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
  changeStatus: React.PropTypes.func.isRequired,
  clearTOS: React.PropTypes.func.isRequired,
  cloneFromTemplate: React.PropTypes.func.isRequired,
  displayMessage: React.PropTypes.func.isRequired,
  editAction: React.PropTypes.func.isRequired,
  editMetaData: React.PropTypes.func.isRequired,
  editPhase: React.PropTypes.func.isRequired,
  editRecord: React.PropTypes.func.isRequired,
  editRecordAttribute: React.PropTypes.func.isRequired,
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
  router: routerShape.isRequired,
  saveDraft: React.PropTypes.func.isRequired,
  selectedTOS: React.PropTypes.object.isRequired,
  setDocumentState: React.PropTypes.func.isRequired,
  setNavigationVisibility: React.PropTypes.func.isRequired,
  setPhaseVisibility: React.PropTypes.func.isRequired,
  setPhasesVisibility: React.PropTypes.func.isRequired,
  setValidationVisibility: React.PropTypes.func.isRequired,
  templates: React.PropTypes.array.isRequired
};

export default withRouter(ViewTOS);
