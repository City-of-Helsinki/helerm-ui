import React, { PropTypes } from 'react';
import classNames from 'classnames';

import './CloneView.scss';

export default class CloneView extends React.Component {

  static propTypes = {
    cloneFromTemplate: PropTypes.func,
    templates: PropTypes.array,
    toggleCloneView: PropTypes.func
  };

  constructor (props) {
    super(props);

    this.cloneFromTemplate = this.cloneFromTemplate.bind(this);
    this.selectItem = this.selectItem.bind(this);

    this.state = {
      selectedItem: null
    };
  }

  cloneFromTemplate (id) {
    const { toggleCloneView, cloneFromTemplate } = this.props;
    toggleCloneView();
    return cloneFromTemplate(id);
  }

  selectItem (key) {
    this.setState({ selectedItem: key });
  }

  render () {
    const { toggleCloneView, templates } = this.props;
    const { selectedItem } = this.state;
    return (
      <div className='row clone__view'>
        <h3>Tuo kuvaus</h3>
        <h5>Valitse listalta tuotava kuvaus</h5>
        <div className='importable-elements '>
          <div className='list-group'>
            {templates.map(({ name, id }) => (
              <button key={id}
                      type='button'
                      className={classNames('list-group-item', { 'active': selectedItem === id })}
                      onClick={() => this.selectItem(id)}>
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className='clone-controls clearfix'>
          <div className='alert alert-danger' role='alert'><strong>Huom!</strong> Aiemmat tiedot korvataan.</div>
          <button
            onClick={() => this.cloneFromTemplate(selectedItem)}
            className='btn btn-primary pull-right'
            disabled={!selectedItem}>
            Tuo
          </button>
          <button onClick={toggleCloneView} className='btn btn-danger pull-right'>Peruuta</button>
        </div>
      </div>
    );
  }
};
