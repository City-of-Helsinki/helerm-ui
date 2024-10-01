/* eslint-disable react/forbid-prop-types */
/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import update from 'immutability-helper';

import InfinityMenu from '../InfinityMenu/InfinityMenu';
import { navigationStateFilters } from '../../constants';

import './Navigation.scss';

const SEARCH_TIMEOUT = 500;

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: navigationStateFilters,
      tree: props.items,
      searchInputs: [''],
      searchTimestamp: 0,
      isSearchChanged: false,
    };

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.onNodeMouseClick = this.onNodeMouseClick.bind(this);
    this.onLeafMouseClick = this.onLeafMouseClick.bind(this);
    this.onSearchTimeout = this.onSearchTimeout.bind(this);
    this.getFilteredTree = this.getFilteredTree.bind(this);
    this.setSearchInput = this.setSearchInput.bind(this);
    this.receiveItemsAndResetNavigation = this.receiveItemsAndResetNavigation.bind(this);
    this.addSearchInput = this.addSearchInput.bind(this);
    this.removeSearchInput = this.removeSearchInput.bind(this);
    this.toggleNavigationVisibility = this.toggleNavigationVisibility.bind(this);
    this.hasFilters = this.hasFilters.bind(this);
    this.isDetailSearch = this.isDetailSearch.bind(this);
  }

  componentDidMount() {
    this.props.fetchNavigation(this.isDetailSearch());
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { itemsTimestamp: nextTimestamp, items } = nextProps;
    const { itemsTimestamp: currentTimestamp } = this.props;
    const isReceivingNewlyFetchedItems = nextTimestamp !== currentTimestamp;

    if (isReceivingNewlyFetchedItems) {
      this.receiveItemsAndResetNavigation(items);
    }
  }

  handleFilterChange(filterValues, filterName) {
    const mappedValues = filterValues.map(({ value }) => value);

    return this.setState(
      (prevState) => ({
        filters: {
          ...prevState.filters,
          [filterName]: {
            ...prevState.filters[filterName],
            values: mappedValues,
          },
        },
      }),
      () => this.setState(() => ({ tree: this.getFilteredTree() })),
    );
  }

  onNodeMouseClick(event, tree) {
    this.setState({
      tree,
    });
  }

  onLeafMouseClick(event, leaf) {
    if (leaf.function) {
      return this.props.push(`/view-tos/${leaf.function}`);
    }
    if (leaf.parent) {
      return this.props.push(`/view-classification/${leaf.id}`);
    }

    return this.toggleNavigationVisibility();
  }

  onSearchTimeout() {
    if (!this.state.isSearchChanged && Date.now() - this.state.searchTimestamp >= SEARCH_TIMEOUT) {
      this.setState({ isSearchChanged: true });
    }
  }

  getFilteredTree() {
    const { items } = this.props;
    const { filters } = this.state;

    if (!this.hasFilters()) {
      return items;
    }

    // Deepcopy original item to disable mutation
    const itemsCopy = (item) => JSON.parse(JSON.stringify(item));

    const getItemFilters = (item, currentPath, nextPath) => {
      const itemValue = get(item, currentPath.concat([nextPath]).join('.'));

      if (isArray(itemValue)) {
        return Object.keys(itemValue).map((index) => currentPath.concat([nextPath, index]));
      }

      if (!isEmpty(itemValue)) {
        return [currentPath.concat([nextPath])];
      }

      return [];
    };

    // returns item filter paths e.g.
    // [
    //   ['phases', 0, 'actions', 0, 'records', 0, 'attributes', 'RetentionPeriod'],
    //   ['phases', 1, 'actions', 0, 'records', 0, 'attributes', 'RetentionPeriod']
    // ]
    const getItemFilterPaths = (path, item) =>
      path.split('.').reduce((currentFilters, currentPath) => {
        if (currentFilters.length) {
          return currentFilters.map((a) => getItemFilters(item, a, currentPath)).map((itemFilter) => itemFilter);
        }

        return getItemFilters(item, [], currentPath).map((itemFilter) => itemFilter);
      }, []);

    // The actual filtering
    const filterFunction = (item) => {
      const matchesFilters = Object.keys(filters)
        .map((key) => {
          const { values: currentFilter, path: paths } = filters[key];

          if (currentFilter.length) {
            return paths.some((path) =>
              getItemFilterPaths(path, item).some((filterPath) =>
                includes(currentFilter, get(item, filterPath.join('.'))),
              ),
            );
          }

          return true;
        })
        .every((finalItem) => !!finalItem);

      item.children = item.children?.filter(filterFunction);

      return matchesFilters || item.children?.length;
    };

    // Modify filtered items to be open
    const setAllOpen = (item) => {
      if (item.children) {
        item.children.map(setAllOpen);
      }

      item.isOpen = true;

      return item;
    };

    return items.map(itemsCopy).filter(filterFunction).map(setAllOpen);
  }

  setSearchInput(index, value) {
    const isDetailSearch = this.isDetailSearch();
    this.setState((prev) =>
      update(prev, {
        isSearchChanged: {
          $set: !isDetailSearch,
        },
        searchInputs: {
          [index]: {
            $set: value,
          },
        },
        searchTimestamp: {
          $set: Date.now(),
        },
      }),
    );
    if (isDetailSearch) {
      setTimeout(this.onSearchTimeout, SEARCH_TIMEOUT);
    }
  }

  receiveItemsAndResetNavigation(items) {
    this.setState({
      tree: items,
      filters: navigationStateFilters,
    });

    this.stopSearching();
  }

  addSearchInput() {
    this.setState(
      update(this.state, {
        searchInputs: {
          $push: [''],
        },
      }),
    );
  }

  removeSearchInput(index) {
    const searchInputs = this.state.searchInputs.length === 1 ? { $set: [''] } : { $splice: [[index, 1]] };
    this.setState(
      update(this.state, {
        searchInputs,
        searchTimestamp: {
          $set: Date.now(),
        },
        isSearchChanged: {
          $set: false,
        },
      }),
    );
    if (this.state.searchInputs[index].length > 0) {
      setTimeout(this.onSearchTimeout, SEARCH_TIMEOUT);
    }
  }

  toggleNavigationVisibility() {
    const currentVisibility = this.props.is_open;
    this.props.setNavigationVisibility(!currentVisibility);
  }

  hasFilters() {
    const { filters } = this.state;
    return !!Object.keys(filters)
      .map((key) => filters[key].values.length)
      .reduce((a, b) => a + b, 0);
  }

  isDetailSearch() {
    return this.props.match.path === '/filter';
  }

  stopSearching() {
    this.setState({
      isSearchChanged: false,
      searchInputs: [''],
      searchTimestamp: 0,
    });
  }

  render() {
    const { onLeafMouseClick, isFetching, attributeTypes, items, itemsTimestamp } = this.props;
    const { isSearchChanged, searchInputs } = this.state;

    if (!isFetching && isEmpty(items) && !isEmpty(itemsTimestamp)) {
      return (
        <div className='container-fluid helerm-navigation'>
          <div className='navigation-error'>
            <div className='alert alert-danger'>Järjestelmä ei ole käytettävissä. Yritä hetken päästä uudestaan.</div>
          </div>
        </div>
      );
    }
    return (
      <div className='helerm-navigation'>
        <InfinityMenu
          addSearchInput={this.addSearchInput}
          attributeTypes={attributeTypes}
          isOpen={this.props.is_open}
          isSearchChanged={isSearchChanged}
          isSearching={searchInputs.filter((input) => input.length > 0).length > 0}
          isFetching={isFetching}
          items={items}
          onLeafMouseClick={onLeafMouseClick ? (event, leaf) => onLeafMouseClick(event, leaf) : this.onLeafMouseClick}
          onNodeMouseClick={this.onNodeMouseClick}
          path={this.props.tosPath}
          removeSearchInput={this.removeSearchInput}
          searchInputs={searchInputs}
          setSearchInput={this.setSearchInput}
          toggleNavigationVisibility={this.toggleNavigationVisibility}
          tree={this.state.tree}
          isDetailSearch={this.isDetailSearch()}
          isUser={this.props.isUser}
          filters={this.state.filters}
          handleFilterChange={this.handleFilterChange}
        />
      </div>
    );
  }
}

Navigation.propTypes = {
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
  setNavigationVisibility: PropTypes.func.isRequired,
  tosPath: PropTypes.array.isRequired,
  match: PropTypes.object.isRequired,
};

export default Navigation;
