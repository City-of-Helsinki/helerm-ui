import React from 'react';
import './AddRecord.scss';

export class AddRecord extends React.Component {
  constructor (props) {
    super(props);
    this.addRecord = this.addRecord.bind(this);
    this.generateAttributeElements = this.generateAttributeElements.bind(this);
    this.cancelRecordCreation = this.cancelRecordCreation.bind(this);
    this.state = {
      mode: this.props.mode
    };
  }
  generateAttributeElements (attributes) {
    const attributeElements = [];
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        if (attributes[key].values.length) {
          const options = attributes[key].values.map((option, index) => {
            return <option key={index} value={option.value}>{option.value}</option>;
          });
          attributeElements.push(
            <div key={key} className='col-xs-12 col-lg-8'>
              <label className='col-xs-2'>Käytössä <input type='checkbox' defaultChecked /></label>
              <label className='col-xs-4'>{attributes[key].name}</label>
              <select className='col-xs-6'>
                { options }
              </select>
            </div>
          );
        } else if (attributes[key].values.length === 0) {
          attributeElements.push(
            <div key={key} className='col-xs-12 col-lg-8'>
              <label className='col-xs-2'>Käytössä <input type='checkbox' defaultChecked /></label>
              <label className='col-xs-4'>{attributes[key].name}</label>
              <input
                className='col-xs-6'
                placeholder={attributes[key].name}
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
        options.push(<option key={key} value={recordTypes[key]}>{recordTypes[key]}</option>);
      }
    }
    return (
      <select className='col-xs-6'>
        {options}
      </select>
    );
  }
  addRecord(event) {
    event.preventDefault();
    // this.props.addAction(this.props.phaseIndex, this.props.actionIndex, this.state.newRecord);
    this.setState({mode: 'view'});
  }
  cancelRecordCreation () {
    this.setState({mode: 'view'});
  }
  render () {
    const { attributes, recordTypes } = this.props;
    const attributeElements = this.generateAttributeElements(attributes);
    const typeDropdown = this.generateDropdown(recordTypes);
    if (this.state.mode === 'add') {
      return (
        <div>
          <h4>Uusi toimenpide</h4>
          <form onSubmit={this.addRecord}>
            <div className='col-xs-12 col-lg-8'>
              <label className='col-xs-2'>Käytössä <input type='checkbox' defaultChecked /></label>
              <label className='col-xs-4'>Asiakirjatyypin tarkenne</label>
              <input className='col-xs-6' placeholder='Tarkenne'  />
            </div>
            <div className='col-xs-12 col-lg-8'>
              <label className='col-xs-2'>Käytössä <input type='checkbox' defaultChecked /></label>
              <label className='col-xs-4'>Tyyppi</label>
              { typeDropdown }
            </div>
            { attributeElements }
            <div className='col-xs-12'>
            <button className='btn btn-primary pull-right' type='submit'>Valmis</button>
            <button className='btn btn-default pull-right' onClick={() => this.cancelRecordCreation()}>Peruuta</button>
          </div>

          </form>
        </div>
      );
    } else if (this.state.mode === 'view') {
      return null;
    }
  }
}

AddRecord.propTypes = {
  attributes: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  mode: React.PropTypes.string.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  actionIndex: React.PropTypes.number.isRequired,
  phaseIndex: React.PropTypes.string.isRequired
};

export default AddRecord;
