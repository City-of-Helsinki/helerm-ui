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
            <div key={key} className='col-xs-12 col-lg-6 form-group'>
              <div className='col-lg-2'>
                <div className='checkbox edit-record__checkbox'>
                  <label><input type='checkbox' defaultChecked /> Käytössä</label>
                </div>
              </div>
              <label className='col-lg-10 edit-record__label'>{attributes[key].name}</label>
              <select className='form-control edit-record__select'>
                <option value={ null }>[ Tyhjä ]</option>
                { options }
              </select>
            </div>
          );
        } else if (attributes[key].values.length === 0) {
          attributeElements.push(
            <div key={key} className='col-xs-12 col-lg-6 form-group'>
              <div className='col-lg-2'>
                <div className='checkbox edit-record__checkbox'>
                  <label><input type='checkbox' defaultChecked /> Käytössä</label>
                </div>
              </div>
              <label className='col-lg-10 edit-record__label'>{attributes[key].name}</label>
              <input
                className='form-control edit-record__input'
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
      <select className='form-control col-xs-6'>
        <option value={ null }>[ Tyhjä ]</option>
        {options}
      </select>
    );
  }
  addRecord (event) {
    event.preventDefault();
    // this.props.addAction(this.props.phaseIndex, this.props.actionIndex, this.state.newRecord);
    this.setState({ mode: 'view' });
  }
  cancelRecordCreation () {
    this.setState({ mode: 'view' });
  }
  render () {
    const { attributes, recordTypes } = this.props;
    const attributeElements = this.generateAttributeElements(attributes);
    const typeDropdown = this.generateDropdown(recordTypes);
    if (this.state.mode === 'add') {
      return (
        <div>
          <h4>Uusi asiakirja</h4>
          <form onSubmit={this.addRecord} className='edit-record'>
            <div className='col-xs-12 col-lg-6 form-group'>
              <div className='col-lg-2'>
                <div className='checkbox edit-record__checkbox'>
                  <label><input type='checkbox' defaultChecked /> Käytössä</label>
                </div>
              </div>
              <label className='col-lg-10 edit-record__label'>Asiakirjatyypin tarkenne</label>
              <input className='col-xs-6 form-control edit-record__input' placeholder='Tarkenne' />
            </div>
            <div className='col-xs-12 col-lg-6 form-group'>
              <div className='col-lg-2'>
                <div className='checkbox edit-record__checkbox'>
                  <label><input type='checkbox' defaultChecked /> Käytössä</label>
                </div>
              </div>
              <label className='col-lg-10 edit-record__label'>Tyyppi</label>
              { typeDropdown }
            </div>
            { attributeElements }
            <div className='col-xs-12'>
              <button className='btn btn-primary pull-right edit-record__submit' type='submit'>Valmis</button>
              <button
                className='btn btn-default pull-right edit-record__cancel'
                onClick={() => this.cancelRecordCreation()}>
                Peruuta
              </button>
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
