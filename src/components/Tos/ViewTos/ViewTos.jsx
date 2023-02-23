/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/prop-types */
/* eslint-disable class-methods-use-this */
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Prompt } from 'react-router-dom';
import Sticky from 'react-sticky-el';
import classnames from 'classnames';
import { min } from 'lodash';

import { HEADER_HEIGHT } from '../../../constants';
import Phase from '../Phase/Phase';
import AddElementInput from '../AddElementInput/AddElementInput';
import Attribute from '../Attribute/Attribute';
import ReorderView from '../Reorder/ReorderView';
import ImportView from '../ImportView/ImportView';
import CloneView from '../CloneView/CloneView';
import EditorForm from '../EditorForm/EditorForm';
import TosHeader from '../Header/TosHeader';
import ClassificationHeader from '../Header/ClassificationHeader';
import ValidationBarContainer from '../ValidationBar/ValidationBarContainer';
import VersionData from '../Version/VersionData';
import VersionSelector from '../VersionSelector/VersionSelector';
import Popup from '../../Popup';
import { getStatusLabel } from '../../../utils/helpers';
import {
  validateTOS,
  validatePhase,
  validateAction,
  validateRecord,
  validateConditionalRules,
} from '../../../utils/validators';

import './ViewTos.scss';

class ViewTOS extends React.Component {
  constructor(props) {
    super(props);
    this.setDocumentState = this.setDocumentState.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.cancelMetaDataEdit = this.cancelMetaDataEdit.bind(this);
    this.cancelMetaDataComplement = this.cancelMetaDataComplement.bind(this);
    this.cancelPhaseCreation = this.cancelPhaseCreation.bind(this);
    this.changeStatus = this.changeStatus.bind(this);
    this.cloneFromTemplate = this.cloneFromTemplate.bind(this);
    this.createNewPhase = this.createNewPhase.bind(this);
    this.editMetaDataWithForm = this.editMetaDataWithForm.bind(this);
    this.fetchTOS = this.fetchTOS.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.onPhaseDefaultAttributeChange = this.onPhaseDefaultAttributeChange.bind(this);
    this.onPhaseTypeChange = this.onPhaseTypeChange.bind(this);
    this.onPhaseTypeInputChange = this.onPhaseTypeInputChange.bind(this);
    this.onPhaseTypeSpecifierChange = this.onPhaseTypeSpecifierChange.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.setPhaseVisibility = this.setPhaseVisibility.bind(this);
    this.updateFunctionAttribute = this.updateFunctionAttribute.bind(this);
    this.setTosVisibility = this.setTosVisibility.bind(this);
    this.setValidationVisibility = this.setValidationVisibility.bind(this);
    this.review = this.review.bind(this);
    this.onEditFormShowMoreMetaData = this.onEditFormShowMoreMetaData.bind(this);
    this.onAddFormShowMorePhase = this.onAddFormShowMorePhase.bind(this);
    this.scrollToMetadata = this.scrollToMetadata.bind(this);
    this.scrollToType = this.scrollToType.bind(this);
    this.getClassificationInfo = this.getClassificationInfo.bind(this);
    this.updateTopOffsetForSticky = this.updateTopOffsetForSticky.bind(this);

    this.state = {
      complementingMetaData: false,
      createPhaseMode: false,
      editingMetaData: false,
      phaseDefaultAttributes: {},
      phaseTypeSpecifier: '',
      phaseType: '',
      originalTos: {},
      isDirty: false,
      scrollTop: HEADER_HEIGHT,
      showCancelEditView: false,
      showCloneView: false,
      showImportView: false,
      showReorderView: false,
      showMore: false,
      topOffset: 0,
    };

    this.phases = {};
  }

  componentDidMount() {
    const { id, version } = this.props.match.params;
    const params = {};
    if (typeof version !== 'undefined') {
      params.version = version;
    }
    this.fetchTOS(id, params);
    this.updateTopOffsetForSticky();
    window.addEventListener('resize', this.updateTopOffsetForSticky);
    document.addEventListener('scroll', this.handleScroll);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { match } = nextProps;
    // If we have selectedTOS & selectedTOS hasn't change during receiveProps
    // => cache it to state to be able to discard changes
    if (
      ((this.props.selectedTOS.id || nextProps.selectedTOS.id) &&
        nextProps.selectedTOS.id !== this.props.selectedTOS.id) ||
      nextProps.selectedTOS.version !== this.props.selectedTOS.version
    ) {
      this.setState({ originalTos: nextProps.selectedTOS });
    }

    if (match.params.id !== this.props.match.params.id || match.params.version !== this.props.match.params.version) {
      const { id, version } = match.params;
      const params = {};
      if (typeof version !== 'undefined') {
        params.version = version;
      }
      this.fetchTOS(id, params);
    }

    if (match && match.path === '/view-tos/:id') {
      this.props.setNavigationVisibility(false);
    }

    if (nextProps.selectedTOS.documentState === 'view') {
      this.setState({
        editingMetaData: false,
        complementingMetaData: false,
      });
    }
  }

  componentWillUnmount() {
    this.props.clearTOS();
    this.props.clearClassification();
    this.props.setValidationVisibility(false);
    document.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.updateTopOffsetForSticky);
  }

  handleScroll(event) {
    const element = event.srcElement.scrollingElement || event.srcElement.documentElement || {};
    const scrollTop = HEADER_HEIGHT - min([HEADER_HEIGHT, element.scrollTop || 0]);
    if (scrollTop >= 0 && scrollTop !== this.state.scrollTop) {
      this.setState({ scrollTop });
    }
  }

  onPhaseTypeSpecifierChange(event) {
    this.setState({ phaseTypeSpecifier: event.target.value });
  }

  onEditFormShowMoreMetaData(e) {
    e.preventDefault();
    this.setState((prevState) => ({
      complementingMetaData: !prevState.complementingMetaData,
      editingMetaData: !prevState.editingMetaData,
    }));
  }

  onPhaseDefaultAttributeChange(key, value) {
    const { phaseDefaultAttributes } = this.state;
    phaseDefaultAttributes[key] = value;
    this.setState({ phaseDefaultAttributes });
  }

  onPhaseTypeInputChange(event) {
    this.setState({ phaseType: event.target.value });
  }

  onPhaseTypeChange(value) {
    this.setState({ phaseType: value });
  }

  onAddFormShowMorePhase(e) {
    e.preventDefault();
    this.setState((prevState) => ({
      showMore: !prevState.showMore,
    }));
  }

  setTosVisibility(basicDataVisibility, metaDataVisibility) {
    this.props.setTosVisibility(this.props.selectedTOS, basicDataVisibility, metaDataVisibility);
  }

  setValidationVisibility(value) {
    this.props.setValidationVisibility(value);
  }

  getClassificationInfo(tosResponse, tosId) {
    const { payload } = tosResponse;
    if (payload && payload.entities && payload.entities.tos && payload.entities.tos[tosId]) {
      const tos = payload.entities.tos[tosId];
      return tos.classification;
    }
    return null;
  }

  setPhaseVisibility(x, y) {
    this.props.setPhaseVisibility(x, y);
  }

  setDocumentState(state) {
    return this.setState({ isDirty: true }, () => this.props.setDocumentState(state));
  }

  fetchTOS(id, params = {}) {
    this.props
      .fetchTOS(id, params)
      .then((res) => {
        this.props.setNavigationVisibility(false);
        this.setTosVisibility(true, false);
        const classificationInfo = this.getClassificationInfo(res, id);
        if (classificationInfo) {
          this.props
            .fetchClassification(classificationInfo.id, {
              version: classificationInfo.version,
            })
            .catch(() => {
              this.props.displayMessage(
                {
                  title: 'Virhe',
                  body: `Tehtäväluokan versio ${classificationInfo.version} haku epäonnistui`,
                },
                { type: 'error' },
              );
            });
        }
      })
      .catch((err) => {
        if (err instanceof URIError) {
          // We have a 404 from API
          this.props.push(`/404?tos-id=${id}`);
        }
      });
  }

  review(status) {
    if (this.validateAttributes()) {
      this.changeStatus(status);
    } else {
      this.props.setValidationVisibility(true);
    }
  }

  validateAttributes() {
    const { selectedTOS, attributeTypes } = this.props;
    const invalidTOSAttributes = validateTOS(selectedTOS, attributeTypes).length > 0;
    const invalidPhaseAttributes = !this.evaluateAttributes(selectedTOS.phases, validatePhase, attributeTypes);
    const invalidActionAttributes = !this.evaluateAttributes(selectedTOS.actions, validateAction, attributeTypes);
    const invalidRecordAttributes = !this.evaluateAttributes(selectedTOS.records, validateRecord, attributeTypes);
    return !invalidTOSAttributes && !invalidPhaseAttributes && !invalidActionAttributes && !invalidRecordAttributes;
  }

  evaluateAttributes(items, validate, attributeTypes) {
    let isValid = true;
    Object.keys(items).forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(items, item)) {
        const validAttributes = validate(items[item], attributeTypes).length === 0;
        if (!validAttributes) {
          isValid = false;
        }
      }
    });
    return isValid;
  }

  updateTopOffsetForSticky() {
    // calculates heights for elements that are already sticking (navigation menu)
    const menuEl = document.getElementById('navigation-menu');
    const menuHeight = menuEl ? menuEl.getBoundingClientRect().height : 0;
    this.setState({ topOffset: menuHeight });
  }

  scrollToMetadata() {
    if (this.metadata) {
      window.scrollTo(0, this.metadata.offsetTop + HEADER_HEIGHT);
    }
  }

  scrollToType(type, id) {
    if (type === 'phase') {
      const element = this.phases[id] || null;
      if (element) {
        element.scrollToPhase();
      }
    } else if (type === 'action') {
      const action = this.props.selectedTOS.actions[id];
      if (action && action.phase) {
        const phase = this.phases[action.phase] || null;
        if (phase) {
          phase.scrollToAction(id);
        }
      }
    } else if (type === 'record') {
      const record = this.props.selectedTOS.records[id];
      if (record && record.action) {
        const action = this.props.selectedTOS.actions[record.action];
        if (action && action.phase) {
          const phase = this.phases[action.phase] || null;
          if (phase) {
            phase.scrollToActionRecord(record.action, id);
          }
        }
      }
    }
  }

  cancelEdit() {
    this.setState({ showCancelEditView: true });
  }

  cancelMetaDataEdit() {
    this.setState({ editingMetaData: false });
  }

  cancelMetaDataComplement() {
    this.setState({ complementingMetaData: false });
  }

  saveDraft() {
    this.setState({ isDirty: false });
    return this.props
      .saveDraft()
      .then((res) => {
        if (res && res.version && res.id) {
          // fetch tos so that history will be intact and url shows up-to-date version
          this.props.history.push(`/view-tos/${res.id}/version/${res.version}`);
        }
        return this.props.displayMessage({
          title: 'Luonnos',
          body: 'Luonnos tallennettu!',
        });
      })
      .catch((err) =>
        this.props.displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`,
          },
          { type: 'error' },
        ),
      );
  }

  changeStatus(status) {
    const { state } = this.props.selectedTOS;
    return this.props
      .changeStatus(status)
      .then(() =>
        this.props.displayMessage({
          title: 'Tila vaihdettu!',
          body: `${getStatusLabel(state)} => ${getStatusLabel(status)}`,
        }),
      )
      .catch((err) =>
        this.props.displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`,
          },
          { type: 'error' },
        ),
      );
  }

  addPhase() {
    this.setState({ createPhaseMode: true });
  }

  createNewPhase(event) {
    event.preventDefault();
    this.props.addPhase(
      this.state.phaseTypeSpecifier || '',
      this.state.phaseType || '',
      this.state.phaseDefaultAttributes || {},
      this.props.selectedTOS.id,
    );
    this.setState({
      createPhaseMode: false,
      phaseDefaultAttributes: {},
      phaseTypeSpecifier: '',
      phaseType: '',
    });
    this.props.displayMessage({
      title: 'Käsittelyvaihe',
      body: 'Käsittelyvaiheen lisäys onnistui!',
    });
  }

  cancelPhaseCreation(event) {
    event.preventDefault();
    this.setState({
      phaseDefaultAttributes: {},
      phaseTypeSpecifier: '',
      createPhaseMode: false,
    });
  }

  cloneFromTemplate(selectedMethod, id) {
    const { cloneFromTemplate } = this.props;
    return cloneFromTemplate(selectedMethod, id)
      .then(() =>
        this.props.displayMessage({
          title: 'Kuvaus',
          body: 'Kuvauksen tuonti onnistui!',
        }),
      )
      .catch((err) =>
        this.props.displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`,
          },
          { type: 'warning' },
        ),
      );
  }

  updateFunctionAttribute(attribute, attributeIndex) {
    const updatedTOSAttribute = {
      tosAttribute: attribute,
      attributeIndex,
    };
    this.props.editRecordAttribute(updatedTOSAttribute);
  }

  editMetaDataWithForm(attributes, stopEditing = true) {
    if (stopEditing) {
      this.setState({
        editingMetaData: false,
        complementingMetaData: false,
      });
    }
    this.props.editMetaData(attributes);
  }

  toggleReorderView() {
    const current = this.state.showReorderView;
    this.setState({ showReorderView: !current });
  }

  toggleImportView() {
    const current = this.state.showImportView;
    this.setState({ showImportView: !current });
  }

  toggleCloneView() {
    const current = this.state.showCloneView;
    this.setState({ showCloneView: !current });
  }

  toggleCancelEditView(confirmed) {
    this.setState({ isDirty: false, showCancelEditView: false }, () => {
      if (confirmed) {
        this.props.resetTOS(this.state.originalTos);
      }
    });
  }

  generateDefaultAttributes(attributeTypes, type) {
    const attributes = {};
    Object.keys(attributeTypes).forEach((key) => {
      if (
        Object.prototype.hasOwnProperty.call(attributeTypes, key) &&
        ((this.state.showMore && attributeTypes[key].allowedIn.indexOf(type) >= 0 && key !== 'PhaseType') ||
          (!this.state.showMore && attributeTypes[key].defaultIn.indexOf(type) >= 0)) &&
        key !== 'TypeSpecifier'
      ) {
        attributes[key] = attributeTypes[key];

        if (attributeTypes[key].requiredIf.length) {
          if (validateConditionalRules(key, attributeTypes)) {
            attributes[key] = attributeTypes[key];
          }
        } else {
          attributes[key] = attributeTypes[key];
        }
      }
    });
    return attributes;
  }

  generateTypeOptions(typeOptions) {
    const options = [];

    Object.keys(typeOptions).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(typeOptions, key)) {
        options.push({
          label: typeOptions[key].value,
          value: typeOptions[key].value,
        });
      }
    });

    return options;
  }

  generateMetaDataButtons() {
    const { documentState, is_open: isOpen } = this.props.selectedTOS;
    const isEdit = documentState === 'edit';
    return (
      <div className='pull-right'>
        {isEdit && (
          <button type='button' className='btn btn-link' onClick={() => this.toggleCloneView()}>
            Tuo kuvaus
          </button>
        )}
        {isEdit && (
          <button type='button' className='btn btn-link' onClick={() => this.setState({ editingMetaData: true })}>
            Muokkaa metatietoja
          </button>
        )}
        <button
          type='button'
          className='btn btn-info btn-sm'
          title={isOpen ? 'Pienennä' : 'Laajenna'}
          onClick={() => this.props.setMetadataVisibility(!isOpen)}
        >
          <span className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-plus'}`} aria-hidden='true' />
        </button>
      </div>
    );
  }

  generateMetaData(attributeTypes, attributes) {
    const { documentState, is_open: isOpen } = this.props.selectedTOS;
    const attributeElements = [];

    Object.keys(attributeTypes).forEach((key) => {
      if ((Object.prototype.hasOwnProperty.call(attributes, key) && attributes[key]) || key === 'InformationSystem') {
        attributeElements.push(
          <Attribute
            key={key}
            attributeIndex={key}
            attributeKey={this.props.attributeTypes[key].name}
            attribute={attributes[key]}
            type='attribute'
            attributeTypes={attributeTypes}
            documentState={documentState}
            editable
            editRecord={this.props.editRecord}
            showAttributes={isOpen}
            tosAttribute
            updateFunctionAttribute={this.updateFunctionAttribute}
            parentType='function'
          />,
        );
      }
    });

    return (
      <div>
        <div className={`metadata-data-row__secondary ${this.props.selectedTOS.is_open ? '' : 'hidden'}`}>
          {attributeElements}
        </div>
      </div>
    );
  }

  generatePhases(phases, phasesOrder) {
    const phaseElements = [];
    if (phases) {
      Object.keys(phases).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(phases, key)) {
          phaseElements.push(
            <Phase
              key={key}
              phaseIndex={phases[key].id}
              phase={this.props.selectedTOS.phases[key]}
              phasesOrder={phasesOrder}
              setActionVisibility={this.props.setActionVisibility}
              setPhaseAttributesVisibility={this.props.setPhaseAttributesVisibility}
              setPhaseVisibility={this.setPhaseVisibility}
              setRecordVisibility={this.props.setRecordVisibility}
              actions={this.props.selectedTOS.actions}
              actionTypes={this.props.actionTypes}
              phases={this.props.selectedTOS.phases}
              phaseTypes={this.props.phaseTypes}
              records={this.props.selectedTOS.records}
              recordTypes={this.props.recordTypes}
              documentState={this.props.selectedTOS.documentState}
              attributeTypes={this.props.attributeTypes}
              addAction={this.props.addAction}
              addRecord={this.props.addRecord}
              editAction={this.props.editAction}
              editActionAttribute={this.props.editActionAttribute}
              editPhase={this.props.editPhase}
              editPhaseAttribute={this.props.editPhaseAttribute}
              editRecord={this.props.editRecord}
              editRecordAttribute={this.props.editRecordAttribute}
              removeAction={this.props.removeAction}
              removePhase={this.props.removePhase}
              removeRecord={this.props.removeRecord}
              displayMessage={this.props.displayMessage}
              changeOrder={this.props.changeOrder}
              importItems={this.props.importItems}
              ref={(element) => {
                this.phases[key] = element;
              }}
            />,
          );
        }
      });
    }
    return phaseElements;
  }

  render() {
    const {
      attributeTypes,
      classification,
      displayMessage,
      editValidDates,
      selectedTOS,
      isFetching,
      templates,
      showValidationBar,
      setClassificationVisibility,
      setVersionVisibility,
    } = this.props;
    const {
      params: { id, version },
    } = this.props.match;
    if (!isFetching && selectedTOS.id) {
      const phasesOrder = Object.keys(selectedTOS.phases);
      const phaseElements = this.generatePhases(selectedTOS.phases, phasesOrder);
      const metaDataButtons = this.generateMetaDataButtons();
      const TOSMetaData = this.generateMetaData(attributeTypes, selectedTOS.attributes);
      const { scrollTop } = this.state;
      const headerHeight = this.header ? this.header.clientHeight : 0;
      return (
        <div key={`${id}.${version}`}>
          <Prompt when={this.state.isDirty} message='Muutoksia ei ole tallennettu, haluatko silti jatkaa?' />
          <div className='col-xs-12 single-tos-container'>
            <div
              id='single-tos-header-container'
              ref={(element) => {
                this.header = element;
              }}
            >
              <Sticky
                topOffset={-1 * this.state.topOffset}
                stickyStyle={{
                  position: 'fixed',
                  top: this.state.topOffset,
                  left: 0,
                }}
                stickyClassName='single-tos-header-sticky'
              >
                <div className='single-tos-header-wrapper'>
                  <TosHeader
                    cancelEdit={this.cancelEdit}
                    classification={classification}
                    classificationId={selectedTOS.classification.id}
                    changeStatus={this.changeStatus}
                    currentVersion={selectedTOS.version}
                    documentState={selectedTOS.documentState}
                    fetchTos={this.fetchTOS}
                    functionId={selectedTOS.function_id}
                    isValidationBarVisible={showValidationBar}
                    name={selectedTOS.name}
                    state={selectedTOS.state}
                    setDocumentState={(state) => this.setDocumentState(state)}
                    setTosVisibility={this.setTosVisibility}
                    setValidationVisibility={this.setValidationVisibility}
                    review={this.review}
                    saveDraft={this.saveDraft}
                    tosId={selectedTOS.id}
                    versions={selectedTOS.version_history}
                  />
                </div>
              </Sticky>
            </div>
            <div className='single-tos-wrapper'>
              <div className={classnames([showValidationBar ? 'col-xs-9 validation-bar-open' : 'col-xs-12'])}>
                <div className='single-tos-content'>
                  <ClassificationHeader
                    classification={classification}
                    isOpen={selectedTOS.is_classification_open}
                    setVisibility={setClassificationVisibility}
                  />
                  <VersionSelector
                    tosId={selectedTOS.id}
                    currentVersion={selectedTOS.version}
                    versions={selectedTOS.version_history}
                  />
                  <VersionData
                    attributeTypes={attributeTypes}
                    displayMessage={displayMessage}
                    editValidDates={editValidDates}
                    selectedTOS={selectedTOS}
                    setVersionVisibility={setVersionVisibility}
                  />
                  <div
                    className='row tos-metadata-header'
                    ref={(element) => {
                      this.metadata = element;
                    }}
                  >
                    <div className='col-xs-6'>
                      <h4>Käsittelyprosessin tiedot</h4>
                    </div>
                    <div className='col-xs-6'>{metaDataButtons}</div>
                  </div>
                  <div className='row tos-metadata'>
                    {this.state.editingMetaData && (
                      <EditorForm
                        onShowMore={this.onEditFormShowMoreMetaData}
                        targetId={selectedTOS.id}
                        attributes={selectedTOS.attributes}
                        attributeTypes={attributeTypes}
                        editMetaDataWithForm={this.editMetaDataWithForm}
                        editorConfig={{
                          type: 'function',
                          action: 'edit',
                        }}
                        closeEditorForm={this.cancelMetaDataEdit}
                        displayMessage={displayMessage}
                      />
                    )}
                    {this.state.complementingMetaData && (
                      <EditorForm
                        onShowMore={this.onEditFormShowMoreMetaData}
                        targetId={selectedTOS.id}
                        attributes={selectedTOS.attributes}
                        attributeTypes={attributeTypes}
                        editMetaDataWithForm={this.editMetaDataWithForm}
                        editorConfig={{
                          type: 'function',
                          action: 'complement',
                        }}
                        closeEditorForm={this.cancelMetaDataComplement}
                        displayMessage={displayMessage}
                      />
                    )}
                    {!this.state.editingMetaData && !this.state.complementingMetaData && (
                      <div className='col-xs-12'>{TOSMetaData}</div>
                    )}
                  </div>
                  <div className='row'>
                    <div className='col-xs-3'>
                      <h4 className='phases-title'>Vaiheet</h4>
                    </div>
                    {selectedTOS.documentState === 'edit' && !this.state.createPhaseMode && (
                      <div className='col-xs-9 phases-actions'>
                        <button
                          type='button'
                          className='btn btn-link pull-right'
                          onClick={() => this.toggleReorderView()}
                        >
                          Järjestä käsittelyvaiheita
                        </button>
                        <button
                          type='button'
                          className='btn btn-link pull-right'
                          onClick={() => this.toggleImportView()}
                        >
                          Tuo käsittelyvaihe
                        </button>
                        <button type='button' className='btn btn-link pull-right' onClick={() => this.addPhase()}>
                          Uusi käsittelyvaihe
                        </button>
                      </div>
                    )}
                  </div>
                  <div className='row'>
                    <div className='col-xs-12'>
                      {this.state.createPhaseMode && (
                        <AddElementInput
                          type='phase'
                          submit={this.createNewPhase}
                          typeOptions={this.generateTypeOptions(this.props.phaseTypes)}
                          defaultAttributes={this.generateDefaultAttributes(attributeTypes, 'phase')}
                          newDefaultAttributes={this.state.phaseDefaultAttributes}
                          newTypeSpecifier={this.state.phaseTypeSpecifier}
                          newType={this.state.phaseType}
                          onDefaultAttributeChange={this.onPhaseDefaultAttributeChange}
                          onTypeSpecifierChange={this.onPhaseTypeSpecifierChange}
                          onTypeChange={this.onPhaseTypeChange}
                          onTypeInputChange={this.onPhaseTypeInputChange}
                          cancel={this.cancelPhaseCreation}
                          onAddFormShowMore={this.onAddFormShowMorePhase}
                          showMoreOrLess={this.state.showMore}
                        />
                      )}
                      {phaseElements}
                      {this.state.showReorderView && (
                        <Popup
                          content={
                            <ReorderView
                              target='phase'
                              toggleReorderView={() => this.toggleReorderView()}
                              keys={Object.keys(selectedTOS.phases)}
                              values={selectedTOS.phases}
                              changeOrder={this.props.changeOrder}
                              parent={null}
                              attributeTypes={this.props.attributeTypes}
                              parentName={`${selectedTOS.function_id} ${selectedTOS.name}`}
                            />
                          }
                          closePopup={() => this.toggleReorderView()}
                        />
                      )}
                      {this.state.showImportView && (
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
                              targetText={`Tos-kuvaukseen ${selectedTOS.name}`}
                              itemsToImportText='käsittelyvaiheet'
                            />
                          }
                          closePopup={() => this.toggleImportView()}
                        />
                      )}
                      {this.state.showCloneView && (
                        <Popup
                          content={
                            <CloneView
                              cloneFromTemplate={(selectedMethod, idd) => this.cloneFromTemplate(selectedMethod, idd)}
                              setNavigationVisibility={this.props.setNavigationVisibility}
                              templates={templates}
                              toggleCloneView={() => this.toggleCloneView()}
                            />
                          }
                          closePopup={() => this.toggleCloneView()}
                        />
                      )}
                      {this.state.showCancelEditView && (
                        <Popup
                          content={
                            <div className='cancelEditView'>
                              <h3>Peruutetaanko muutokset?</h3>
                              <button
                                type='button'
                                className='btn btn-default'
                                onClick={() => this.toggleCancelEditView(false)}
                              >
                                Ei
                              </button>
                              <button
                                type='button'
                                className='btn btn-danger'
                                onClick={() => this.toggleCancelEditView(true)}
                              >
                                Kyllä
                              </button>
                            </div>
                          }
                          closePopup={() => this.toggleCancelEditView(false)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {showValidationBar && (
                <div className='col-xs-3 validation-bar-container'>
                  <ValidationBarContainer
                    scrollToMetadata={this.scrollToMetadata}
                    scrollToType={this.scrollToType}
                    top={headerHeight + scrollTop}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}

ViewTOS.propTypes = {
  actionTypes: PropTypes.object.isRequired,
  addAction: PropTypes.func.isRequired,
  addPhase: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
  attributeTypes: PropTypes.object.isRequired,
  changeOrder: PropTypes.func.isRequired,
  changeStatus: PropTypes.func.isRequired,
  classification: PropTypes.object,
  clearClassification: PropTypes.func.isRequired,
  clearTOS: PropTypes.func.isRequired,
  cloneFromTemplate: PropTypes.func.isRequired,
  displayMessage: PropTypes.func.isRequired,
  editAction: PropTypes.func.isRequired,
  editActionAttribute: PropTypes.func.isRequired,
  editMetaData: PropTypes.func.isRequired,
  editPhase: PropTypes.func.isRequired,
  editPhaseAttribute: PropTypes.func.isRequired,
  editRecord: PropTypes.func.isRequired,
  editRecordAttribute: PropTypes.func.isRequired,
  editValidDates: PropTypes.func.isRequired,
  fetchClassification: PropTypes.func.isRequired,
  fetchTOS: PropTypes.func.isRequired,
  importItems: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
  phaseTypes: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired,
  recordTypes: PropTypes.object.isRequired,
  removeAction: PropTypes.func.isRequired,
  removePhase: PropTypes.func.isRequired,
  removeRecord: PropTypes.func.isRequired,
  resetTOS: PropTypes.func.isRequired,
  saveDraft: PropTypes.func.isRequired,
  selectedTOS: PropTypes.object.isRequired,
  setActionVisibility: PropTypes.func.isRequired,
  setClassificationVisibility: PropTypes.func.isRequired,
  setDocumentState: PropTypes.func.isRequired,
  setMetadataVisibility: PropTypes.func.isRequired,
  setNavigationVisibility: PropTypes.func.isRequired,
  setPhaseAttributesVisibility: PropTypes.func.isRequired,
  setPhaseVisibility: PropTypes.func.isRequired,
  setRecordVisibility: PropTypes.func.isRequired,
  setTosVisibility: PropTypes.func.isRequired,
  setValidationVisibility: PropTypes.func.isRequired,
  setVersionVisibility: PropTypes.func.isRequired,
  showValidationBar: PropTypes.bool.isRequired,
  templates: PropTypes.array.isRequired,
};

export default withRouter(ViewTOS);
