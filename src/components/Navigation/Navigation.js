import React, { PropTypes } from 'react';
import classnames from 'classnames';
import filter from 'lodash/filter';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import update from 'immutability-helper';

import InfinityMenu from '../InfinityMenu/infinityMenu';
import SearchFilter from './SearchFilter';

import { statusFilters, navigationStateFilters } from '../../../config/constants';

import './Navigation.scss';

const SEARCH_TIMEOUT = 500;

export class Navigation extends React.Component {

  static propTypes = {
    attributeTypes: PropTypes.object,
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
      searchInputs: [''],
      searchTimestamp: 0,
      isSearchChanged: false
    };
  }

  componentDidMount () {
    this.props.fetchNavigation(this.isDetailSearch());
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
    this.props.fetchNavigation(this.isDetailSearch());
  }

  stopSearching = () => {
    this.setState({
      isSearchChanged: false,
      searchInputs: [''],
      searchTimestamp: 0
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

  setSearchInput = (index, value) => {
    const isDetailSearch = this.isDetailSearch();
    this.setState(update(this.state, {
      isSearchChanged: {
        $set: !isDetailSearch
      },
      searchInputs: {
        [index]: {
          $set: value
        }
      },
      searchTimestamp: {
        $set: Date.now()
      }
    }));
    if (isDetailSearch) {
      setTimeout(this.onSearchTimeout, SEARCH_TIMEOUT);
    }
  }

  addSearchInput = () => {
    this.setState(update(this.state, {
      searchInputs: {
        $push: ['']
      }
    }));
  }

  removeSearchInput = (index) => {
    const searchInputs = this.state.searchInputs.length === 1
      ? { $set: [''] }
      : { $splice: [[index, 1]] };
    this.setState(update(this.state, {
      searchInputs,
      searchTimestamp: {
        $set: Date.now()
      },
      isSearchChanged: {
        $set: false
      }
    }));
    if (this.state.searchInputs[index].length > 0) {
      setTimeout(this.onSearchTimeout, SEARCH_TIMEOUT);
    }
  }

  onSearchTimeout = () => {
    if (!this.state.isSearchChanged) {
      if (Date.now() - this.state.searchTimestamp >= SEARCH_TIMEOUT) {
        this.setState({ isSearchChanged: true });
      }
    }
  }

  getFilteredTree = () => {
    const { items } = this.props;
    const { filters } = this.state;

    if (!this.hasFilters()) {
      return items;
    }

    // Deepcopy original item to disable mutation
    const deepCopy = (item) => JSON.parse(JSON.stringify(item));

    const getItemFilters = (item, currentPath, nextPath) => {
      const itemFilters = [];
      const itemValue = get(item, currentPath.concat([nextPath]).join('.'));
      if (isArray(itemValue)) {
        Object.keys(itemValue).forEach((index) => itemFilters.push(currentPath.concat([nextPath, index])));
      } else if (!isEmpty(itemValue)) {
        itemFilters.push(currentPath.concat([nextPath]));
      }
      return itemFilters;
    };

    const getItemFilterPaths = (path, item) => {
      // returns item filter paths e.g.
      // [
      //   ['phases', 0, 'actions', 0, 'records', 0, 'attributes', 'RetentionPeriod'],
      //   ['phases', 1, 'actions', 0, 'records', 0, 'attributes', 'RetentionPeriod']
      // ]
      return path.split('.').reduce((currentFilters, currentPath) => {
        const next = [];
        if (currentFilters.length) {
          currentFilters.forEach((a) => {
            const itemFilters = getItemFilters(item, a, currentPath);
            itemFilters.forEach((itemFilter) => next.push(itemFilter));
          });
        } else {
          const itemFilters = getItemFilters(item, [], currentPath);
          itemFilters.forEach((itemFilter) => next.push(itemFilter));
        }
        return next;
      }, []);
    };

    // The actual filtering
    const filterFunction = (item) => {
      const matchesFilters = Object.keys(filters).map((key) => {
        const currentFilter = filters[key].values;
        const paths = filters[key].path;
        if (currentFilter.length) {
          return paths.some((path) => {
            const filterPaths = getItemFilterPaths(path, item);
            return filterPaths.some((filterPath) => {
              if (includes(currentFilter, get(item, filterPath.join('.')))) {
                return true;
              }
            });
          });
        }
        return true;
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
    const { attributeTypes, isUser } = this.props;
    const isDetailSearch = this.isDetailSearch();
    const statusFilterOptions = isUser ? statusFilters : filter(statusFilters, { default:true });
    const statusFilterPlaceholder = this.props.isUser ? 'Suodata viimeisen tilan mukaan...' : 'Suodata tilan mukaan...';
    const retentionPeriods = attributeTypes && attributeTypes.RetentionPeriod ? attributeTypes.RetentionPeriod.values : [];
    const retentionPeriodOptions = retentionPeriods.map((option) => ({ value: option.value, label: option.value }));

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
          options={retentionPeriodOptions}
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
    const { onLeafMouseClick, isFetching, attributeTypes, items, itemsTimestamp } = this.props;
    const { isSearchChanged, searchInputs } = this.state;

    if (!isFetching && isEmpty(items) && !isEmpty(itemsTimestamp)) {
      return (
        <div className='container-fluid helerm-navigation'>
          <div className='navigation-error'>
            <div className='alert alert-danger'>Navigaatiota ei löytynyt</div>
          </div>
        </div>
      );
    }
    return (
      <div className='container-fluid helerm-navigation'>
        <InfinityMenu
          addSearchInput={this.addSearchInput}
          attributeTypes={attributeTypes}
          isOpen={this.props.is_open}
          isSearchChanged={isSearchChanged}
          isSearching={searchInputs.filter(input => input.length > 0).length > 0}
          isFetching={isFetching}
          items={items}
          onLeafMouseClick={onLeafMouseClick ? (event, leaf) => onLeafMouseClick(event, leaf) : this.onLeafMouseClick}
          onNodeMouseClick={this.onNodeMouseClick}
          path={this.props.tosPath}
          removeSearchInput={this.removeSearchInput}
          searchInputs={searchInputs}
          setSearchInput={this.setSearchInput}
          title={this.createNavigationTitle()}
          toggleNavigationVisibility={this.toggleNavigationVisibility}
          tree={this.state.tree}
          filters={this.getFilters()}
          isDetailSearch={this.isDetailSearch()}
        />
      </div>
    );
  }
}

export default Navigation;

