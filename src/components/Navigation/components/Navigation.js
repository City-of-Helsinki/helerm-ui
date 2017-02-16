import React from 'react';
import { withRouter } from 'react-router';
import InfinityMenu from 'react-infinity-menu';

import './Navigation.scss';

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
    const { items } = nextProps;
    this.setState({
      tree: items
    });
  }

  toggleNavigationVisibility () {
    const currentVisibility = this.props.is_open;
    this.props.setNavigationVisibility(!currentVisibility);
  }

  onNodeMouseClick (event, tree, node, level, keyPath) {
    this.setState({
      tree: tree
    });
  }

  onLeafMouseClick (event, leaf) {
    this.props.router.push(`/view-tos/${leaf.id}`);
  }

  render () {
    let navigationTitle = 'Navigaatio';
    if (!this.props.is_open && this.props.TOSPath.length) {
      navigationTitle = this.props.TOSPath.map((section, index) => {
        return <div key={index}>{section}</div>;
      });
    }

    return (
      <div className='container-fluid'>
        <div className='navigation-menu'>
          <button className='btn btn-default btn-sm pull-right' onClick={this.toggleNavigationVisibility}>
            <span
              className={'fa ' + (this.props.is_open ? 'fa-minus' : 'fa-plus')}
              aria-hidden='true'
            />
          </button>
          {!this.props.is_open &&
          <div className='nav-path-list' onClick={this.toggleNavigationVisibility}>{navigationTitle}</div>
          }
          {this.props.is_open &&
          <InfinityMenu
            tree={this.state.tree}
            onNodeMouseClick={this.onNodeMouseClick}
            onLeafMouseClick={this.onLeafMouseClick}
          />
          }
        </div>
      </div>
    );
  }
}

Navigation.propTypes = {
  TOSPath: React.PropTypes.array.isRequired,
  fetchNavigation: React.PropTypes.func.isRequired,
  is_open: React.PropTypes.bool.isRequired,
  items: React.PropTypes.array.isRequired,
  router: React.PropTypes.object.isRequired,
  setNavigationVisibility: React.PropTypes.func.isRequired
};

export default withRouter(Navigation);
