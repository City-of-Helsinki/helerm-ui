import React from 'react';
import './TOSMetadata.scss';

export class TOSMetadata extends React.Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.generateInput = this.generateInput.bind(this);
    this.state = {
      name: this.props.name,
      mode: this.props.mode
    };
  }
  componentWillReceiveProps (nextProps) {
    this.setState({ mode: nextProps.mode });
  }
  onChange (event) {
    this.setState({ name: event.target.value });
  }
  generateInput (input) {
    if (input.values.length) {
      const options = input.values.map((option, index) => {
        return <option key={index} value={option.value}>{option.value}</option>;
      });
      return (
        <select
          className='col-xs-6 form-control metadata-input'
          value={this.state.name}
          onChange={this.onChange}
          onBlur={() => this.setState({ mode: 'view' })}
          autoFocus>
          <option value={null}>[ Tyhjä ]</option>
          { options }
        </select>
      );
    } else if (input.values.length === 0) {
      return (
        <input
          className='col-xs-6 form-control metadata-input'
          value={this.state.name}
          onChange={this.onChange}
        />
      );
    } else {
      return null;
    }
  }
  changeState (newState) {
    if (this.props.documentState === 'edit') {
      this.setState({ mode: newState });
    }
  }
  render () {
    const { name, type, typeIndex, editable } = this.props;
    if (editable === false) {
      return (
        <a className='list-group-item metadata-row col-md-6 col-xs-12'>
          <strong>{type}:</strong> <div>{this.state.name}</div>
        </a>
      );
    }
    if (this.state.mode === 'view') {
      return (
        <a className='list-group-item metadata-row col-md-6 col-xs-12' onClick={() => this.changeState('edit')}>
          <strong>{type}:</strong> <div>{this.state.name}</div>
        </a>
      );
    } else if (this.state.mode === 'edit') {
      const metadataInput = this.generateInput(this.props.attributes[typeIndex], name);
      return (
        <a className='list-group-item metadata-input-wrapper metadata-row col-md-6 col-xs-12'>
          <label className='metadata-input-label'>{type}:
            { this.props.attributes[typeIndex].required &&
              <span className='fa fa-asterisk required-asterisk' />
            }
          </label>
          { metadataInput }
        </a>
      );
    } else {
      return null;
    }
  }
}

TOSMetadata.propTypes = {
  typeIndex: React.PropTypes.string,
  attributes: React.PropTypes.object,
  documentState: React.PropTypes.string,
  type: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  mode: React.PropTypes.string.isRequired,
  editable: React.PropTypes.bool.isRequired
};

export default TOSMetadata;
