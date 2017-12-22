import React, { PropTypes } from 'react';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import includes from 'lodash/includes';
import InfinityMenu from '../InfinityMenu/infinityMenu';

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
    const { tree } = this.state;
    if (!tree.length) {
      this.props.fetchNavigation();
    }
  }

  componentWillReceiveProps (nextProps) {
    const { items, tosPath } = nextProps;
    this.setState({
      tree: items
    }, () => {
      if (!tosPath.length) {
        this.props.setNavigationVisibility(true);
      }
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
    if (leaf.function) {
      this.props.push(`/view-tos/${leaf.function}`);
    } else if (leaf.parent) {
      this.props.push(`/view-classification/${leaf.id}`);
    }
    this.toggleNavigationVisibility();
  }

  getFilteredTree (filterStatuses) {
    const { items } = this.props;
    let treeCopy = JSON.parse(JSON.stringify(items));

    if (filterStatuses.length) {
      this.filter(treeCopy, filterStatuses);
      return treeCopy;
    }
    return items;
  }

  filter (filterTree, filterStatuses) {
    let indexesToRemove = [];

    forEach(filterTree, (item, index) => {
      if (item.children) {
        this.filter(item.children, filterStatuses);
      }
      if ((!item.children && !includes(filterStatuses, item.function_state)) ||
        (item.children && !item.children.length)) {
        if (item.children && !item.children.length) {
        }
        indexesToRemove.push(index);
      }
    });

    if (indexesToRemove.length) {
      for (let i = filterTree.length - 1; i >= 0; i--) {
        if (includes(indexesToRemove, i)) {
          filterTree.splice(i, 1);
        }
      }
    }
  }

  handleStatusFilterChange (valArray) {
    const mappedValues = map(valArray, (val) => val.value);
    this.setState({
      filterStatuses: mappedValues,
      tree: this.getFilteredTree(mappedValues)
    });
  }

  render () {
    const { onLeafMouseClick } = this.props;
    let navigationTitle = 'Navigaatio';
    if (!this.props.is_open && this.props.tosPath.length) {
      navigationTitle = this.props.tosPath.map((section, index) => {
        return <div key={index}>{section}</div>;
      });
    }

    return (
      <div className='container-fluid'>
        <InfinityMenu
          filterStatuses={filterStatuses}
          handleStatusFilterChange={this.handleStatusFilterChange}
          isOpen={this.props.is_open}
          onLeafMouseClick={onLeafMouseClick ? (event, leaf) => onLeafMouseClick(event, leaf) : this.onLeafMouseClick}
          onNodeMouseClick={this.onNodeMouseClick}
          statusValue={this.state.filterStatuses}
          title={navigationTitle}
          path={this.props.tosPath}
          toggleNavigationVisibility={this.toggleNavigationVisibility}
          tree={this.state.tree}
        />
      </div>
    );
  }
}

Navigation.propTypes = {
  fetchNavigation: PropTypes.func.isRequired,
  is_open: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired,
  onLeafMouseClick: PropTypes.func,
  push: PropTypes.func.isRequired,
  setNavigationVisibility: PropTypes.func.isRequired,
  tosPath: PropTypes.array.isRequired
};

export default Navigation;
