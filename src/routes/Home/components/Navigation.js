import React from 'react';
import './Navigation.scss';
import InfinityMenu from 'react-infinity-menu';

export class Navigation extends React.Component {
  constructor (props) {
    super(props);
    this.onNodeMouseClick = this.onNodeMouseClick.bind(this);
    this.onLeafMouseClick = this.onLeafMouseClick.bind(this);
    this.toggleNavigationVisibility = this.toggleNavigationVisibility.bind(this);
    this.state = {
      tree: [],
      isNavigationOpen: true
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
  toggleNavigationVisibility () {
    const value = this.state.isNavigationOpen;
    this.setState({ isNavigationOpen: !value });
  }
  onNodeMouseClick (event, tree, node, level, keyPath) {
    this.setState({
      tree: tree
    });
  }
  onLeafMouseClick (event, leaf) {
    this.props.fetchTOS(leaf.id);
  }
  render () {
    return (
      <div className='col-xs-12'>
        <button className='button pull-right' onClick={this.toggleNavigationVisibility}>
          <span
            className={'fa black-icon ' + (this.state.isNavigationOpen ? 'fa-minus' : 'fa-plus')}
            aria-hidden='true'
          />
        </button>
        {this.state.isNavigationOpen &&
          <InfinityMenu
            tree={this.state.tree}
            onNodeMouseClick={this.onNodeMouseClick}
            onLeafMouseClick={this.onLeafMouseClick}
          />
        }
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
