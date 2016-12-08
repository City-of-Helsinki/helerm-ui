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
  generateAttributeElements (attributeTypes) {
    const attributeElements = [];
    for (const key in attributeTypes) {
      if (attributeTypes.hasOwnProperty(key)) {
        if (attributeTypes[key].values.length) {
          const options = attributeTypes[key].values.map((option, index) => {
            return <option key={index} value={option.value}>{option.value}</option>;
          });
          attributeElements.push(
            <div key={key} className='col-xs-12 col-lg-6 form-group'>
              <div className='col-lg-2'>
                <div className='checkbox edit-record__checkbox'>
                  <label><input type='checkbox' defaultChecked /> Käytössä</label>
                </div>
              </div>
              <label className='col-lg-10 edit-record__label'>{attributeTypes[key].name}</label>
              { attributeTypes[key].required &&
                <span className='fa fa-asterisk required-asterisk' />
              }
              <select className='form-control edit-record__select'>
                <option value={null}>[ Tyhjä ]</option>
                { options }
              </select>
            </div>
          );
        } else if (attributeTypes[key].values.length === 0) {
          attributeElements.push(
            <div key={key} className='col-xs-12 col-lg-6 form-group'>
              <div className='col-lg-2'>
                <div className='checkbox edit-record__checkbox'>
                  <label><input type='checkbox' defaultChecked /> Käytössä</label>
                </div>
              </div>
              <label className='col-lg-10 edit-record__label'>{attributeTypes[key].name}</label>
              { attributeTypes[key].required &&
                <span className='fa fa-asterisk required-asterisk' />
              }
              <input
                className='form-control edit-record__input'
                placeholder={attributeTypes[key].name}
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
        <option value={null}>[ Tyhjä ]</option>
        {options}
      </select>
    );
  }
  addRecord (event) {
    event.preventDefault();
    // this.props.addAction(this.props.phaseIndex, this.props.actionIndex, this.state.newRecord);
    this.setState({ mode: 'view' });
  }
  cancelRecordCreation (event) {
    event.preventDefault();
    this.setState({ mode: 'view' });
    this.props.cancelRecordCreation();
  }
  render () {
    const { attributeTypes, recordTypes } = this.props;
    const attributeElements = this.generateAttributeElements(attributeTypes);
    const typeDropdown = this.generateDropdown(recordTypes);
    if (this.state.mode === 'add') {
      return (
        <div>
          <h4>Uusi asiakirja</h4>
          <span className='fa fa-asterisk required-asterisk required-legend col-xs-12'> Pakollinen tieto</span>
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
                className='btn btn-danger pull-right edit-record__cancel'
                onClick={this.cancelRecordCreation}>
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
  attributeTypes: React.PropTypes.object.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  mode: React.PropTypes.string.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  cancelRecordCreation: React.PropTypes.func.isRequired,
  actionIndex: React.PropTypes.string.isRequired,
  phaseIndex: React.PropTypes.string.isRequired
};

export default AddRecord;
