import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DeleteView.scss';

class DeleteView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: {
        phase: {
          name: 'käsittelyvaihetta',
          childrenText: 'käsittelyvaiheen',
          children: true,
        },
        action: {
          name: 'toimenpidettä',
          childrenText: 'toimenpiteen',
          children: true,
        },
        record: {
          name: 'asiakirjaa',
          children: false,
        },
      },
    };
  }

  render() {
    return (
      <div className='delete-view row'>
        <h3>
          Olet poistamassa {this.state.type[this.props.type].name} &quot;
          {this.props.target}&quot;
        </h3>
        {this.state.type[this.props.type].children && (
          <span className='has-children-text'>
            Huomioi, että kaikki {this.state.type[this.props.type].childrenText} sisältämät tiedot poistetaan
          </span>
        )}
        <h4>Vahvista poisto</h4>
        <div className='popup-buttons'>
          <button type='button' onClick={this.props.cancel} className='btn btn-default'>
            Peruuta
          </button>
          <button type='button' onClick={this.props.action} className='btn btn-delete'>
            Poista
          </button>
        </div>
      </div>
    );
  }
}

DeleteView.propTypes = {
  action: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  target: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default DeleteView;
