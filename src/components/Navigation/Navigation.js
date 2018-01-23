import React, { PropTypes } from 'react';
import map from 'lodash/map';
import filter from 'lodash/filter';
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
  { value: APPROVED, label: 'Hyväksytty', default: true }
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
      tree: props.items,
      search: {
        isSearching: false,
        searchInput: ''
      }
    };
  }

  componentDidMount () {
    this.props.fetchNavigation();
  }

  componentWillReceiveProps (nextProps) {
    const { itemsTimestamp: nextTimestamp, items } = nextProps;
    const { itemsTimestamp: currentTimestamp } = this.props;
    const isReceivingNewlyFetchedItems = nextTimestamp !== currentTimestamp;
    if (isReceivingNewlyFetchedItems) {
      this.receiveItemsAndResetNavigation(items);
    }
  }

  receiveItemsAndResetNavigation (items) {
    this.setState(() => ({
      tree: items,
      filterStatuses: []
    }));

    this.stopSearching();
  }

  updateNavigation () {
    this.stopSearching();
    this.props.fetchNavigation();
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

  setSearchInput = (event) => {
    this.setState({
      search: {
        isSearching: true,
        searchInput: event.target.value
      }
    });
  }

  stopSearching = () => {
    this.setState({
      search: {
        isSearching: false,
        searchInput: ''
      }
    });
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

  /**
   * Sets isOpen to nodes according to selected filters.
   * Note! Method mutates the objects inside `filterTree`
   * @param  {Object[]}  [filterTree=[]]
   * @param  {Array}  [filterStatuses=[]]
   * @return {Object[]}
   */
  openNodesIfFilterStatusIsSelected (filterTree = [], filterStatuses = []) {
    forEach(filterTree, item => {
      item.isOpen = Boolean(filterStatuses.length);
    });
    return filterTree;
  }

  filter (filterTree, filterStatuses) {
    let indexesToRemove = [];

    forEach(filterTree, (item, index) => {
      if (item.children) {
        this.filter(item.children, filterStatuses);
      }
      if ((!item.children && !includes(filterStatuses, item.function_state)) ||
        (item.children && !item.children.length)) {
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
    this.openNodesIfFilterStatusIsSelected(filterTree, filterStatuses);
  }

  handleStatusFilterChange (valArray) {
    const mappedValues = map(valArray, (val) => val.value);
    this.setState({
      filterStatuses: mappedValues,
      tree: this.getFilteredTree(mappedValues)
    });
  }

  render () {
    const { onLeafMouseClick, isUser } = this.props;
    const { searchInput, isSearching } = this.state.search;
    const filterStatusOptions = isUser ? filterStatuses : filter(filterStatuses, { default:true });
    let navigationTitle = 'Navigaatio';
    if (!this.props.is_open && this.props.tosPath.length) {
      navigationTitle = this.props.tosPath.map((section, index) => {
        return <div key={index}>{section}</div>;
      });
    }

    return (
      <div className='container-fluid helerm-navigation'>
        <InfinityMenu
          filterStatuses={filterStatusOptions}
          handleStatusFilterChange={this.handleStatusFilterChange}
          isOpen={this.props.is_open}
          onLeafMouseClick={onLeafMouseClick ? (event, leaf) => onLeafMouseClick(event, leaf) : this.onLeafMouseClick}
          onNodeMouseClick={this.onNodeMouseClick}
          statusValue={this.state.filterStatuses}
          title={navigationTitle}
          path={this.props.tosPath}
          toggleNavigationVisibility={this.toggleNavigationVisibility}
          tree={this.state.tree}
          setSearchInput={this.setSearchInput}
          searchInput={searchInput}
          isSearching={isSearching}
          isUser={isUser}
        />
      </div>
    );
  }
}

Navigation.propTypes = {
  fetchNavigation: PropTypes.func.isRequired,
  isUser: PropTypes.bool.isRequired,
  is_open: PropTypes.bool.isRequired,
  // One does not simply mutate props unless one is Navigation and the prop is `items`.
  // Sorry, didn't find out where the devil is doing the mutations :'(
  items: PropTypes.array.isRequired,
  itemsTimestamp: PropTypes.string,
  onLeafMouseClick: PropTypes.func,
  push: PropTypes.func.isRequired,
  setNavigationVisibility: PropTypes.func.isRequired,
  tosPath: PropTypes.array.isRequired
};

export default Navigation;
