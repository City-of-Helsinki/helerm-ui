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
      tree: []
    };
  }
  componentWillMount () {
    this.props.fetchNavigation();
  }
  componentWillReceiveProps (nextProps) {
    this.setState({
      tree: nextProps.navigation.items
    });
  }
  toggleNavigationVisibility () {
    const currentVisibility = this.props.navigation.is_open;
    this.props.setNavigationVisibility(!currentVisibility);
  }
  onNodeMouseClick (event, tree, node, level, keyPath) {
    this.setState({
      tree: tree
    });
  }
  onLeafMouseClick (event, leaf) {
    this.props.fetchTOS(leaf.id, leaf.path);
  }
  render () {
    let navigationTitle = 'Navigaatio';
    if (!this.props.navigation.is_open && this.props.selectedTOSPath.length > 0) {
      navigationTitle = this.props.selectedTOSPath.map((section, index) => {
        return <div key={index}>{section}</div>;
      });
    }
    return (
      <div className='navigation-menu'>
        <button className='btn btn-default btn-sm pull-right' onClick={this.toggleNavigationVisibility}>
          <span
            className={'fa ' + (this.props.navigation.is_open ? 'fa-minus' : 'fa-plus')}
            aria-hidden='true'
          />
        </button>
        {!this.props.navigation.is_open &&
          <div className='nav-path-list' onClick={this.toggleNavigationVisibility}>{navigationTitle}</div>
        }
        {this.props.navigation.is_open &&
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
  setNavigationVisibility: React.PropTypes.func.isRequired,
  navigation: React.PropTypes.object.isRequired,
  selectedTOSPath: React.PropTypes.array.isRequired
};

export default Navigation;
