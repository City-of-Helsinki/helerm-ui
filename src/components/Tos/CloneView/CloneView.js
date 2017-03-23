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
    const { toggleCloneView, templates, clone } = this.props;
    const { selectedItem } = this.state;
    return (
      <div className='row clone__view'>
        <h3>Kloonaa TOS:n sisältö</h3>
        <h5>Valitse listalta kloonattava TOS</h5>
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
          <button
            onClick={() => this.cloneFromTemplate(selectedItem)}
            className='btn btn-primary pull-right'
            disabled={!selectedItem}>
            Kloonaa
          </button>
          <button onClick={toggleCloneView} className='btn btn-danger pull-right'>Peruuta</button>
        </div>
      </div>
    );
  }
};
