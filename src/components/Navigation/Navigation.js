import React from 'react';
import map from 'lodash/map';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import InfinityMenu from 'react-infinity-menu';
import Select from 'react-select';

import {
  DRAFT,
  SENT_FOR_REVIEW,
  WAITING_FOR_APPROVAL,
  APPROVED
} from '../../../config/constants';

import './Navigation.scss';

const filterStatuses = [
  { value: DRAFT, label: 'Luonnos' },
  { value: SENT_FOR_REVIEW, label: 'Lähetetty tarkastettavaksi' },
  { value: WAITING_FOR_APPROVAL, label: 'Odottaa hyväksymistä' },
  { value: APPROVED, label: 'Hyväksytty' }
];

export class Navigation extends React.Component {
  constructor (props) {
    super(props);
    this.onNodeMouseClick = this.onNodeMouseClick.bind(this);
    this.onLeafMouseClick = this.onLeafMouseClick.bind(this);
    this.toggleNavigationVisibility = this.toggleNavigationVisibility.bind(this);
    this.filter = this.filter.bind(this);
    this.handleStatusFilterChange = this.handleStatusFilterChange.bind(this);
    this.state = {
      filterStatuses: [],
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
    this.props.push(`/view-tos/${leaf.id}`);
    this.toggleNavigationVisibility();
  }

  filter (tree) {
    const { filterStatuses } = this.state;

    const letsFilter = (items) => {
      return filter(items, (item) => {
        console.log(item);
        if (item.children) {
          return letsFilter(item.children);
        }
        return includes(filterStatuses, item.state);
      });
    };

    if (filterStatuses.length) {
      return letsFilter(tree);
    }

    return tree;
  }

  handleStatusFilterChange (valArray) {
    const mappedValues = map(valArray, (val) => val.value);
    this.setState({ filterStatuses: mappedValues });
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
          <div>
            <Select
              autoBlur={true}
              placeholder='Suodata statuksen mukaan...'
              value={this.state.filterStatuses}
              multi={true}
              joinValues={true}
              clearable={false}
              resetValue={filterStatuses}
              options={filterStatuses}
              onChange={this.handleStatusFilterChange}
            />
            <InfinityMenu
              tree={this.filter(this.state.tree)}
              onNodeMouseClick={this.onNodeMouseClick}
              onLeafMouseClick={this.onLeafMouseClick}
            />
          </div>
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
  push: React.PropTypes.func.isRequired,
  setNavigationVisibility: React.PropTypes.func.isRequired
};

export default Navigation;
