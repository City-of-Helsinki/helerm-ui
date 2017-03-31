import React, { PropTypes, createElement } from 'react';
import classNames from 'classnames';

import './CloneView.scss';
import NavigationContainer from '../../Navigation/NavigationContainer';

const METHOD_TEMPLATE = 'template';
const METHOD_FUNCTION = 'function';

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
    this.selectMethod = this.selectMethod.bind(this);

    this.state = {
      selectedItem: {},
      selectedMethod: METHOD_TEMPLATE
    };
  }

  cloneFromTemplate (id) {
    const { toggleCloneView, cloneFromTemplate } = this.props;
    toggleCloneView();
    return cloneFromTemplate(id);
  }

  selectItem ({ id, name }) {
    this.setState({ selectedItem: { id, name } });
  }

  selectMethod (selectedMethod) {
    return this.setState({ selectedMethod });
  }

  render () {
    const { toggleCloneView, templates } = this.props;
    const { selectedItem, selectedMethod } = this.state;

    const treeViewProps = {
      tosPath: [],
      onLeafMouseClick: (event, leaf) => {
        const { id, name } = leaf;
        return this.selectItem({ id, name });
      }
    };

    const treeView = createElement(NavigationContainer, treeViewProps);

    return (
      <div className='row clone__view'>
        <ul className='nav nav-tabs'>
          <li role='presentation' className={classNames({ 'active': selectedMethod === METHOD_TEMPLATE })}>
            <a onClick={() => this.selectMethod(METHOD_TEMPLATE)}>Tuo kuvaus templatesta</a>
          </li>
          <li role='presentation' className={classNames({ 'active': selectedMethod === METHOD_FUNCTION })}>
            <a onClick={() => this.selectMethod(METHOD_FUNCTION)}>Tuo kuvaus kuvauksesta</a>
          </li>
        </ul>

        {selectedMethod === METHOD_TEMPLATE &&
        <div className='importable-elements'>
          <div className='list-group'>
            {templates.map(({ name, id }) => (
              <button key={id}
                      type='button'
                      className={classNames('list-group-item', { 'active': selectedItem.id === id })}
                      onClick={() => this.selectItem({ id, name })}>
                {name}
              </button>
            ))}
          </div>
        </div>
        }

        {selectedMethod === METHOD_FUNCTION && <div className='row'>{treeView}</div>}

        <div className='clone-controls clearfix'>
          {selectedItem.id &&
          <div className='alert alert-danger' role='alert'><strong>Huom!</strong> Aiemmat tiedot korvataan
            kuvauksella {selectedItem.name}.</div>
          }
          <button
            onClick={() => this.cloneFromTemplate(selectedItem.id)}
            className='btn btn-primary pull-right'
            disabled={!selectedItem.id}>
            Tuo
          </button>
          <button onClick={toggleCloneView} className='btn btn-danger pull-right'>Peruuta</button>
        </div>
      </div>
    );
  }
};
