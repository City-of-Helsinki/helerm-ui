import React from 'react';
import classNames from 'classnames';
import './Action.scss';
import Record from '../Record/Record';
import EditorForm from '../EditorForm/EditorForm';
import Popup from 'components/Popup';
import Dropdown from 'components/Dropdown';
import DeleteView from '../DeleteView/DeleteView';
import ReorderView from '../Reorder/ReorderView';
import ImportView from '../ImportView/ImportView';

import { StickyContainer, Sticky } from 'react-sticky';

export class Action extends React.Component {
  constructor (props) {
    super(props);
    this.saveActionTitle = this.saveActionTitle.bind(this);
    this.createRecord = this.createRecord.bind(this);
    this.cancelRecordCreation = this.cancelRecordCreation.bind(this);
    this.editRecordForm = this.editRecordForm.bind(this);
    this.editRecordWithForm = this.editRecordWithForm.bind(this);
    this.cancelRecordEdit = this.cancelRecordEdit.bind(this);
    this.state = {
      mode: 'view',
      name: this.props.action ? this.props.action.name : 'ERROR',
      creating: false,
      editing: false,
      deleting: false,
      showReorderView: false,
      showImportView: false
    };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.action && nextProps.action.name) {
      this.setState({ name: nextProps.action.name });
    }
    if (nextProps.documentState === 'view') {
      this.setState({ editing: false });
    }
  }

  editActionTitle () {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: 'edit' });
    }
  }

  saveActionTitle (event) {
    event.preventDefault();
    const updatedAction = {
      id: this.props.action.id,
      name: this.state.name
    };
    this.props.editAction(updatedAction);
    if (this.state.name.length > 0) {
      this.setState({ mode: 'view' });
    }
  }

  onChange (e) {
    this.setState({ name: e.target.value });
  }

  generateRecords (records) {
    const elements = [];
    for (const key in records) {
      if (records.hasOwnProperty(key)) {
        elements.push(
          <Record
            key={key}
            record={this.props.records[records[key]]}
            editRecordForm={this.editRecordForm}
            editRecordAttribute={this.props.editRecordAttribute}
            removeRecord={this.props.removeRecord}
            recordTypes={this.props.recordTypes}
            documentState={this.props.documentState}
            attributeTypes={this.props.attributeTypes}
            displayMessage={this.props.displayMessage}
          />
        );
      }
    }
    return elements;
  }

  generateDropdownItems () {
    return [
      {
        text: 'Uusi asiakirja',
        icon: 'fa-file-text',
        style: 'btn-primary',
        action: () => this.createNewRecord()
      }, {
        text: 'Järjestä asiakirjoja',
        icon: 'fa-th-list',
        style: 'btn-primary',
        action: () => this.toggleReorderView()
      }, {
        text: 'Tuo asiakirjoja',
        icon: 'fa-download',
        style: 'btn-primary',
        action: () => this.toggleImportView()
      }, {
        text: 'Poista toimenpide',
        icon: 'fa-trash',
        style: 'btn-delete',
        action: () => this.setState({ deleting: true })
      }
    ];
  }

  createNewRecord () {
    this.setState({ creating: true });
  }

  cancelRecordCreation () {
    this.setState({ creating: false });
  }

  editRecordForm (recordId, recordName, recordAttributes) {
    this.setState({
      record: {
        id: recordId,
        name: recordName,
        attributes: recordAttributes
      }
    }, () => {
      this.setState({ editing: true });
    });
  }

  cancelRecordEdit () {
    this.setState({
      editing: false,
      recordId: undefined
    });
  }

  editRecordWithForm (actionId, name, type, attributes) {
    this.setState({
      editing: false,
      recordId: undefined
    });
    this.props.editRecord(actionId, name, type, attributes);
  }

  delete () {
    this.setState({ deleting: false });
    this.props.removeAction(this.props.action.id, this.props.action.phase);
  }

  cancelDeletion () {
    this.setState({ deleting: false });
  }

  createRecord (actionId, name, type, attributes) {
    this.setState({ creating: false });
    this.props.addRecord(actionId, name, type, attributes);
  }

  toggleReorderView () {
    const current = this.state.showReorderView;
    this.setState({ showReorderView: !current });
  }

  toggleImportView () {
    const current = this.state.showImportView;
    this.setState({ showImportView: !current });
  }

  render () {
    // TODO: Handle errors where we don't have an valid action (i.e 400 error from API)
    const { action } = this.props;
    const recordElements = action && action.records ? this.generateRecords(action.records) : [];
    const dropdownItems = this.generateDropdownItems();
    let actionTitle;
    if (this.state.mode === 'view') {
      actionTitle = (
        <span>
          <span onClick={() => this.editActionTitle()}>
            {this.state.name}
          </span>
          { this.props.documentState === 'edit' &&
          <span className='action-dropdown-button'>
            <Dropdown children={dropdownItems} extraSmall={true}/>
          </span>
          }
        </span>
      );
    }
    if (this.state.mode === 'edit') {
      actionTitle = (
        <form onSubmit={this.saveActionTitle}>
          <input
            className='input-title form-control col-xs-11'
            value={this.state.name}
            onChange={(e) => this.onChange(e)}
            onBlur={this.saveActionTitle}
            autoFocus={true}
          />
        </form>
      );
    }
    return (
      <div>
        <StickyContainer className='row box action'>
          <Sticky className='action-title'>
            { actionTitle }
          </Sticky>
          { this.state.creating &&
          <EditorForm
            targetId={this.props.action.id}
            attributes={{}}
            attributeTypes={this.props.attributeTypes}
            recordConfig={{
              recordTypes: this.props.recordTypes,
              createRecord: this.createRecord
            }}
            editorConfig={{
              type: 'record',
              action: 'add'
            }}
            closeEditorForm={this.cancelRecordCreation}
            displayMessage={this.props.displayMessage}
          />
          }
          { this.state.editing &&
          <EditorForm
            targetId={this.state.record.id}
            attributes={this.state.record.attributes}
            attributeTypes={this.props.attributeTypes}
            recordConfig={{
              recordTypes: this.props.recordTypes,
              recordId: this.state.record.id,
              recordName: this.state.record.name,
              editRecordWithForm: this.editRecordWithForm
            }}
            editorConfig={{
              type: 'record',
              action: 'edit'
            }}
            closeEditorForm={this.cancelRecordEdit}
            displayMessage={this.props.displayMessage}
          />
          }
          { !this.state.editing && !!recordElements.length &&
          <div>
            <span className='col-xs-6 attribute-label'>
            Asiakirjatyypin tarkenne
            </span>
            <span className='col-xs-6 attribute-label'>
            Tyyppi
            </span>
            <div
              className={classNames('col-xs-12 records', { 'records-editing': this.props.documentState === 'edit' })}>
              { recordElements }
            </div>
          </div>
          }

          { this.state.deleting &&
          <Popup
            content={
              <DeleteView
                type='action'
                target={this.state.name}
                action={() => this.delete()}
                cancel={() => this.cancelDeletion()}
              />
            }
            closePopup={() => this.cancelDeletion()}
          />
          }
          { this.state.showReorderView &&
          <Popup
            content={
              <ReorderView
                target='record'
                toggleReorderView={() => this.toggleReorderView()}
                keys={this.props.action.records}
                values={this.props.records}
                changeOrder={this.props.changeOrder}
                parent={this.props.action.id}
                parentName={this.state.name}
              />
            }
            closePopup={() => this.toggleReorderView()}
          />
          }
          { this.state.showImportView &&
          <Popup
            content={
              <ImportView
                level='record'
                toggleImportView={() => this.toggleImportView()}
                title='asiakirjoja'
                targetText={'toimenpiteeseen ' + action.name}
                itemsToImportText='asiakirjat'
                phasesOrder={this.props.phasesOrder}
                phases={this.props.phases}
                actions={this.props.actions}
                records={this.props.records}
                importItems={this.props.importItems}
                parent={action.id}
                parentName={action.name}
              />
            }
            closePopup={() => this.toggleImportView()}
          />
          }
        </StickyContainer>
      </div>
    );
  }
}

Action.propTypes = {
  action: React.PropTypes.object.isRequired,
  actions: React.PropTypes.object.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  changeOrder: React.PropTypes.func.isRequired,
  displayMessage: React.PropTypes.func.isRequired,
  documentState: React.PropTypes.string.isRequired,
  editAction: React.PropTypes.func.isRequired,
  editRecord: React.PropTypes.func.isRequired,
  editRecordAttribute: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired,
  phases: React.PropTypes.object.isRequired || React.PropTypes.array.isRequired,
  phasesOrder: React.PropTypes.array.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  records: React.PropTypes.object.isRequired,
  removeAction: React.PropTypes.func.isRequired,
  removeRecord: React.PropTypes.func.isRequired
};

export default Action;
