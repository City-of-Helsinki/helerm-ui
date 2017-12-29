import React, { PropTypes, createElement } from 'react';
import classnames from 'classnames';

import './CloneView.scss';
import NavigationContainer from '../../Navigation/NavigationContainer';

const METHOD_TEMPLATE = 'template';
const METHOD_FUNCTION = 'function';

export class CloneView extends React.Component {

  static propTypes = {
    cloneFromTemplate: PropTypes.func,
    setNavigationVisibility: PropTypes.func,
    templates: PropTypes.array,
    toggleCloneView: PropTypes.func
  };

  constructor (props) {
    super(props);

    this.cloneFromTemplate = this.cloneFromTemplate.bind(this);
    this.clearSelected = this.clearSelected.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.selectMethod = this.selectMethod.bind(this);
    this.toggleCloneView = this.toggleCloneView.bind(this);

    this.state = {
      selectedItem: {},
      selectedMethod: METHOD_TEMPLATE
    };
  }

  componentDidMount () {
    this.props.setNavigationVisibility(true);
  }

  componentWillUnmount () {
    this.props.setNavigationVisibility(false);
  }

  cloneFromTemplate (id) {
    const { selectedMethod } = this.state;
    const { toggleCloneView, cloneFromTemplate, setNavigationVisibility } = this.props;
    setNavigationVisibility(false);
    toggleCloneView();
    return cloneFromTemplate(selectedMethod, id);
  }

  clearSelected () {
    return this.setState({ selectedItem: {} });
  }

  selectItem ({ id, name }) {
    this.setState({ selectedItem: { id, name } });
  }

  selectMethod (selectedMethod) {
    return this.setState({ selectedMethod });
  }

  toggleCloneView () {
    const { toggleCloneView, setNavigationVisibility } = this.props;
    setNavigationVisibility(false);
    return toggleCloneView();
  }

  render () {
    const { templates } = this.props;
    const { selectedItem, selectedMethod } = this.state;
    const hasSelectedItem = !!selectedItem.id;

    const treeViewProps = {
      tosPath: [],
      onLeafMouseClick: (event, leaf) => {
        const { name } = leaf;
        return this.selectItem({ id: leaf.function, name });
      }
    };

    const treeView = createElement(NavigationContainer, treeViewProps);

    return (
      <div className='row clone__view'>
        <ul className='nav nav-tabs disabled'>
          <li role='presentation'
              className={classnames({ 'disabled': hasSelectedItem, 'active': selectedMethod === METHOD_TEMPLATE })}>
            <a onClick={() => this.selectMethod(METHOD_TEMPLATE)}>Tuo kuvaus moduulista</a>
          </li>
          <li role='presentation'
              className={classnames({ 'disabled': hasSelectedItem, 'active': selectedMethod === METHOD_FUNCTION })}>
            <a onClick={() => this.selectMethod(METHOD_FUNCTION)}>Tuo kuvaus toisesta kuvauksesta</a>
          </li>
        </ul>

        {!hasSelectedItem && selectedMethod === METHOD_TEMPLATE &&
        <div className='importable-elements'>
          <div className='list-group'>
            {templates.map(({ name, id }) => (
              <button key={id}
                      type='button'
                      className={classnames('list-group-item', { 'active': selectedItem.id === id })}
                      onClick={() => this.selectItem({ id, name })}>
                {name}
              </button>
            ))}
          </div>
        </div>
        }

        {!hasSelectedItem && selectedMethod === METHOD_FUNCTION && <div className='row'>{treeView}</div>}

        {hasSelectedItem &&
        <div className='clone-controls clearfix'>
          <div className='alert alert-info' role='alert'>
            <strong>Tuotava kuvaus:</strong> <em>{selectedItem.name}</em>
            <button onClick={this.clearSelected} className='btn btn-xs btn-default pull-right'>Tyhjennä valinta <i
              className='fa fa-close'/></button>
          </div>
          <button
            onClick={() => this.cloneFromTemplate(selectedItem.id)}
            className='btn btn-success pull-right'
            disabled={!hasSelectedItem}>
            Tuo <i className='fa fa-clone'/>
          </button>
          <button onClick={this.toggleCloneView} className='btn btn-danger pull-right'>Peruuta</button>
        </div>
        }
      </div>
    );
  }
};

export default CloneView;
