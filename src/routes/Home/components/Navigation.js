import React from 'react';
import './Navigation.scss';
import InfinityMenu from 'react-infinity-menu';

export class Navigation extends React.Component {
  constructor (props) {
    super(props);
    this.onNodeMouseClick = this.onNodeMouseClick.bind(this);
    this.onLeafMouseClick = this.onLeafMouseClick.bind(this);
    this.state = {
      tree: []
    };
  }
  componentWillMount () {
    this.props.fetchNavigation();
  }
  componentWillReceiveProps (nextProps) {
    this.setState({
      tree: nextProps.navigationMenuItems
    });
  }
  onNodeMouseClick (event, tree, node, level, keyPath) {
    this.setState({
      tree: tree
    });
  }
  onLeafMouseClick (event, leaf) {
    this.props.fetchTOS();
  }
  render () {
    return (
      <div className='col-xs-12'>
        <InfinityMenu
          tree={this.state.tree}
          onNodeMouseClick={this.onNodeMouseClick}
          onLeafMouseClick={this.onLeafMouseClick} />
      </div>
    );
  }
}

Navigation.propTypes = {
  fetchTOS: React.PropTypes.func.isRequired,
  fetchNavigation: React.PropTypes.func.isRequired,
  navigationMenuItems: React.PropTypes.array.isRequired
};

Navigation.headerProps = {
  title: 'Luokat',
  className: 'nav--empty-tree'
};

Navigation.emptyTreeComponentProps = {
  className: 'nav--empty-tree'
};

export default Navigation;
