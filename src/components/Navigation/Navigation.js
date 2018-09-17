import React, { PropTypes } from 'react';
import classnames from 'classnames';
import filter from 'lodash/filter';
import get from 'lodash/get';
import includes from 'lodash/includes';
import InfinityMenu from '../InfinityMenu/infinityMenu';
import SearchFilter from './SearchFilter';

import { statusFilters, retentionPeriodFilters, navigationStateFilters } from '../../../config/constants';

import './Navigation.scss';

export class Navigation extends React.Component {

  static propTypes = {
    fetchNavigation: PropTypes.func.isRequired,
    isFetching: PropTypes.bool,
    isUser: PropTypes.bool.isRequired,
    is_open: PropTypes.bool.isRequired,
    // One does not simply mutate props unless one is Navigation and the prop is `items`.
    // Sorry, didn't find out where the devil is doing the mutations :'(
    items: PropTypes.array.isRequired,
    itemsTimestamp: PropTypes.string,
    onLeafMouseClick: PropTypes.func,
    push: PropTypes.func.isRequired,
    router: PropTypes.object,
    setNavigationVisibility: PropTypes.func.isRequired,
    tosPath: PropTypes.array.isRequired
  }

  constructor (props) {
    super(props);
    this.state = {
      filters: navigationStateFilters,
      tree: props.items,
      searchInput: ''
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
    this.setState({
      tree: items,
      filters: navigationStateFilters
    });

    this.stopSearching();
  }

  updateNavigation () {
    this.stopSearching();
    this.props.fetchNavigation();
  }

  stopSearching = () => {
    this.setState({
      searchInput: ''
    });
  }

  toggleNavigationVisibility = () => {
    const currentVisibility = this.props.is_open;
    this.props.setNavigationVisibility(!currentVisibility);
  }

  onNodeMouseClick = (event, tree, node, level, keyPath) => {
    this.setState({
      tree
    });
  }

  onLeafMouseClick = (event, leaf) => {
    if (leaf.function) {
      return this.props.push(`/view-tos/${leaf.function}`);
    } else if (leaf.parent) {
      return this.props.push(`/view-classification/${leaf.id}`);
    }

    return this.toggleNavigationVisibility();
  }

  setSearchInput = (event) => {
    this.setState({
      searchInput: event.target.value
    });
  }

  getFilteredTree = () => {
    const { items } = this.props;
    const { filters } = this.state;

    if (!this.hasFilters()) {
      return items;
    }

    // Deepcopy original item to disable mutation
    const deepCopy = (item) => JSON.parse(JSON.stringify(item));

    // The actual filtering
    const filterFunction = (item) => {
      const matchesFilters = Object.keys(filters).map((key) => {
        const currentFilter = filters[key].values;
        return currentFilter.length ? includes(currentFilter, get(item, filters[key].path)) : true;
      }).every((item) => !!item);

      return matchesFilters || item.children && (item.children = item.children.filter(filterFunction)).length;
    };

    // Modify filtered items to be open
    const setAllOpen = (item) => {
      if (item.children) {
        item.children.map(setAllOpen);
      }

      item.isOpen = true;
      return item;
    };

    return items.map(deepCopy).filter(filterFunction).map(setAllOpen);
  };

  hasFilters = () => {
    const { filters } = this.state;
    return !!Object.keys(filters).map((key) => filters[key].values.length).reduce((a, b) => a + b, 0);
  }

  isDetailSearch = () => {
    return this.props.router.isActive('search');
  }

  handleFilterChange = (filterValues, filterName) => {
    const mappedValues = filterValues.map(({ value }) => value);

    return this.setState({
      filters: { ...this.state.filters, [filterName]: { ...this.state.filters[filterName], values: mappedValues } }
    }, () => {
      return this.setState({ tree: this.getFilteredTree() });
    });
  }

  getFilters = () => {
    const { isUser } = this.props;
    const isDetailSearch = this.isDetailSearch();
    const statusFilterOptions = isUser ? statusFilters : filter(statusFilters, { default:true });
    const statusFilterPlaceholder = this.props.isUser ? 'Suodata viimeisen tilan mukaan...' : 'Suodata tilan mukaan...';

    return (
      <div className={classnames({ 'filters row': isDetailSearch })}>
        <SearchFilter
          className={classnames({ '': !isDetailSearch, 'col-sm-6': isDetailSearch })}
          placeholder={statusFilterPlaceholder}
          value={this.state.filters.statusFilters.values}
          options={statusFilterOptions}
          handleChange={(values) => this.handleFilterChange(values, 'statusFilters')}
        />
        <SearchFilter
          placeholder={'Suodata säilytysajan mukaan'}
          value={this.state.filters.retentionPeriodFilters.values}
          options={retentionPeriodFilters}
          handleChange={(values) => this.handleFilterChange(values, 'retentionPeriodFilters')}
          isVisible={isDetailSearch}
        />
      </div>
    );
  }

  createNavigationTitle = () => {
    if (!this.props.is_open && this.props.tosPath.length) {
      return this.props.tosPath.map((section, index) => {
        return <div key={index}>{section}</div>;
      });
    }

    return 'Navigaatio';
  }

  render () {
    const { onLeafMouseClick, isFetching } = this.props;
    const { searchInput } = this.state;
    const displayExporter = this.hasFilters() && !!this.state.tree.length && this.isDetailSearch();

    return (
      <div className='container-fluid helerm-navigation'>
        <InfinityMenu
          isOpen={this.props.is_open}
          isSearching={searchInput !== ''}
          isFetching={isFetching}
          onLeafMouseClick={onLeafMouseClick ? (event, leaf) => onLeafMouseClick(event, leaf) : this.onLeafMouseClick}
          onNodeMouseClick={this.onNodeMouseClick}
          path={this.props.tosPath}
          searchInput={searchInput}
          setSearchInput={this.setSearchInput}
          title={this.createNavigationTitle()}
          toggleNavigationVisibility={this.toggleNavigationVisibility}
          tree={this.state.tree}
          filters={this.getFilters()}
          isDetailSearch={this.isDetailSearch()}
          displayExporter={displayExporter}
        />
      </div>
    );
  }
}

export default Navigation;
