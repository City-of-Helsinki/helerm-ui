import React from 'react';
import './RecordForm.scss';
import update from 'immutability-helper';

export class RecordForm extends React.Component {
  constructor (props) {
    super(props);
    this.generateAttributeElements = this.generateAttributeElements.bind(this);
    this.getActiveOptionValues = this.getActiveOptionValues.bind(this);
    this.closeRecordForm = this.closeRecordForm.bind(this);
    this.state = {
      newAttributes: this.initializeState(this.props.attributeTypes),
      recordName: {
        name: '',
        checked: true
      },
      recordType: {
        name: '',
        checked: true
      },
      editForm: !!this.props.editRecordWithForm
    };
  }

  initializeState (attributeTypes) {
    const { attributes } = this.props.record;
    let initialState = {};
    for (const key in attributeTypes) {
      if (attributeTypes.hasOwnProperty(key)) {
        initialState = Object.assign({}, initialState, {
          [key]: {
            name: attributes[key] ? attributes[key] : null,
            checked: true
          }
        });
      }
    };
    return initialState;
  }

  onChange (e, key, field) {
    const newValue = e;
    this.setState(update(this.state, {
      newAttributes: {
        [key]: {
          [field]: {
            $set: newValue
          }
        }
      }
    }));
  }

  onBaseAttributeChange (e, key, field) {
    const newValue = e;
    this.setState(update(this.state, {
      [key]: {
        [field]: {
          $set: newValue
        }
      }
    }));
  }

  getActiveOptionValues (key) {
    if (this.state.newAttributes[key].name) {
      return this.state.newAttributes[key].name;
    }
  }

  generateAttributeElements (attributeTypes) {
    const attributeElements = [];
    for (const key in attributeTypes) {
      if (attributeTypes.hasOwnProperty(key)) {
        if (attributeTypes[key].values.length) {
          const options = attributeTypes[key].values.map((option, index) => (
            <option key={index} value={option.value}>{option.value}</option>
          ));
          attributeElements.push(
            <div key={key} className='col-xs-12 col-lg-6 form-group'>
              <input
                type='checkbox'
                checked={this.state.newAttributes[key].checked}
                value={this.state.newAttributes[key].checked}
                onChange={(e) => this.onChange(!this.state.newAttributes[key].checked, key, 'checked')}/>
              <label className='edit-record__label'>
                {attributeTypes[key].name}
                { attributeTypes[key].required &&
                <span className='fa fa-asterisk required-asterisk'/>
                }
              </label>
              <select
                value={this.getActiveOptionValues(key)}
                className='form-control edit-record__select'
                onChange={(e) => this.onChange(e.target.value, key, 'name')}
                disabled={!this.state.newAttributes[key].checked}>
                <option value={null}>[ Tyhjä ]</option>
                { options }
              </select>
            </div>
          );
        } else if (attributeTypes[key].values.length === 0) {
          attributeElements.push(
            <div key={key} className='col-xs-12 col-lg-6 form-group'>
              <input
                type='checkbox'
                checked={this.state.newAttributes[key].checked}
                value={this.state.newAttributes[key].checked}
                onChange={(e) => this.onChange(!this.state.newAttributes[key].checked, key, 'checked')}
              />
              <label className='edit-record__label'>
                {attributeTypes[key].name}
                { attributeTypes[key].required &&
                <span className='fa fa-asterisk required-asterisk'/>
                }
              </label>
              <input
                className='form-control edit-record__input'
                placeholder={attributeTypes[key].name}
                onChange={(e) => this.onChange(e.target.value, key, 'name')}
                disabled={!this.state.newAttributes[key].checked}
              />
            </div>
          );
        }
      }
    }
    return attributeElements;
  }

  generateDropdown (recordTypes) {
    const options = [];
    for (const key in recordTypes) {
      if (recordTypes.hasOwnProperty(key)) {
        options.push(<option key={key} value={key}>{recordTypes[key]}</option>);
      }
    }
    return (
      <select
        className='form-control col-xs-6'
        onChange={(e) => this.onBaseAttributeChange(e.target.value, 'recordType', 'name')}>
        <option value={null}>[ Tyhjä ]</option>
        {options}
      </select>
    );
  }

  addRecord (e, actionId) {
    e.preventDefault();
    const { recordName, recordType, newAttributes } = this.state;
    this.props.createRecord(actionId, recordName.name, recordType.name, newAttributes);
    this.props.displayMessage({
      text: 'Asiakirjan lisäys onnistui!',
      success: true
    });
  }

  editRecord (e, actionId) {
    e.preventDefault();
    const { recordName, recordType, newAttributes } = this.state;
    this.props.editRecordWithForm(this.props.record.id, recordName.name, recordType.name, newAttributes);
    this.props.displayMessage({
      text: 'Asiakirjan muokkaus onnistui!',
      success: true
    });
  }

  closeRecordForm (e) {
    e.preventDefault();
    this.props.closeRecordForm();
  }

  render () {
    const { attributeTypes, recordTypes, actionId } = this.props;
    const { editForm } = this.state;
    const attributeElements = this.generateAttributeElements(attributeTypes);
    const typeDropdown = this.generateDropdown(recordTypes);
    return (
      <div className='action add-box col-xs-12'>
        <h4>{ editForm ? 'Muokkaa asiakirjaa' : 'Uusi asiakirja' }</h4>
        <form onSubmit={(e) => editForm
                ? this.editRecord(e, actionId)
                : this.addRecord(e, actionId)}
              className='edit-record'>
          <div className='col-xs-12 col-lg-6 form-group'>
            <label className='edit-record__label'>Asiakirjatyypin tarkenne</label>
            <span className='fa fa-asterisk required-asterisk'/>
            <input
              className='col-xs-6 form-control edit-record__input'
              placeholder='Tarkenne'
              value={this.state.recordName.name}
              onChange={(e) => this.onBaseAttributeChange(e.target.value, 'recordName', 'name')}/>
          </div>
          <div className='col-xs-12 col-lg-6 form-group'>
            <label className='edit-record__label'>Tyyppi</label>
            <span className='fa fa-asterisk required-asterisk'/>
            { typeDropdown }
          </div>
          { attributeElements }
          <div className='col-xs-12'>
            <button className='btn btn-primary pull-right edit-record__submit' type='submit'>Valmis</button>
            <button
              className='btn btn-danger pull-right edit-record__cancel'
              onClick={(e) => this.closeRecordForm(e)}>
              Peruuta
            </button>
          </div>
        </form>
      </div>
    );
  }
}

RecordForm.propTypes = {
  actionId: React.PropTypes.string,
  attributeTypes: React.PropTypes.object.isRequired,
  closeRecordForm: React.PropTypes.func.isRequired,
  createRecord: React.PropTypes.func,
  displayMessage: React.PropTypes.func.isRequired,
  editRecordWithForm: React.PropTypes.func,
  record: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    attributes: React.PropTypes.object.isRequired
  }),
  recordTypes: React.PropTypes.object.isRequired
};

export default RecordForm;
