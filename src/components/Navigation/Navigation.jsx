import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import update from 'immutability-helper';

import InfinityMenu from '../InfinityMenu/InfinityMenu';
import { navigationStateFilters } from '../../constants';
import withRouter from '../hoc/withRouter';

import './Navigation.scss';

const SEARCH_TIMEOUT = 500;

const Navigation = ({
  attributeTypes,
  fetchNavigation,
  isFetching,
  isUser,
  is_open,
  items,
  itemsTimestamp,
  onLeafMouseClick: propOnLeafMouseClick,
  navigate,
  setNavigationVisibility,
  tosPath,
  location,
}) => {
  const [filters, setFilters] = useState(navigationStateFilters);
  const [tree, setTree] = useState(items);
  const [searchInputs, setSearchInputs] = useState(['']);
  const [searchTimestamp, setSearchTimestamp] = useState(0);
  const [isSearchChanged, setIsSearchChanged] = useState(false);

  const isDetailSearchFn = useRef(() => location.pathname === '/filter').current;

  const stopSearchingFn = useRef(() => {
    setIsSearchChanged(false);
    setSearchInputs(['']);
    setSearchTimestamp(0);
  }).current;

  const receiveItemsAndResetNavigationFn = useRef((newItems) => {
    setTree(newItems);
    setFilters(navigationStateFilters);
    stopSearchingFn();
  }).current;

  useEffect(() => {
    fetchNavigation(isDetailSearchFn());
  }, [fetchNavigation, isDetailSearchFn]);

  const prevItemsTimestamp = useRef();

  useEffect(() => {
    prevItemsTimestamp.current = itemsTimestamp;
  }, [itemsTimestamp]);

  useEffect(() => {
    const isReceivingNewlyFetchedItems = itemsTimestamp !== prevItemsTimestamp.current;

    if (isReceivingNewlyFetchedItems) {
      receiveItemsAndResetNavigationFn(items);
    }
  }, [itemsTimestamp, items, receiveItemsAndResetNavigationFn]);

  const handleFilterChange = (filterValues, filterName) => {
    const mappedValues = filterValues.map(({ value }) => value);

    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: {
        ...prevFilters[filterName],
        values: mappedValues,
      },
    }));

    setTree(getFilteredTree());
  };

  const onNodeMouseClick = (event, newTree) => {
    setTree(newTree);
  };

  const onLeafMouseClick = (event, leaf) => {
    if (leaf.function) {
      return navigate(`/view-tos/${leaf.function}`);
    }
    if (leaf.parent) {
      return navigate(`/view-classification/${leaf.id}`);
    }

    return toggleNavigationVisibility();
  };

  const onSearchTimeout = () => {
    if (!isSearchChanged && Date.now() - searchTimestamp >= SEARCH_TIMEOUT) {
      setIsSearchChanged(true);
    }
  };

  const checkIncludesFilter = (item, filterPath, currentFilter) => {
    return includes(currentFilter, get(item, filterPath.join('.')));
  };

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

  const processFilters = (currentFilters, item, currentPath) => {
    if (!currentFilters.length) {
      return getItemFilters(item, [], currentPath);
    }

    return currentFilters.flatMap((filter) => getItemFilters(item, filter, currentPath));
  };

  const filterSinglePath = (path, item, currentFilter) => {
    const filterPaths = getItemFilterPaths(path, item);

    return filterPaths.some((filterPath) => checkIncludesFilter(item, filterPath, currentFilter));
  };

  const filterByPath = (paths, item, currentFilter) => {
    return paths.some((path) => filterSinglePath(path, item, currentFilter));
  };

  const getItemFilterPaths = (path, item) => {
    const processSinglePath = (currentFilters, currentPath) => {
      return processFilters(currentFilters, item, currentPath);
    };

    return path.split('.').reduce(processSinglePath, []);
  };

  const filterFunction = (item) => {
    const matchesFilters = Object.keys(filters)
      .map((key) => {
        const { values: currentFilter, path: paths } = filters[key];
        return currentFilter.length ? filterByPath(paths, item, currentFilter) : true;
      })
      .every(Boolean);

    if (item.children) {
      item.children = item.children.filter(filterFunction);
    }

    return matchesFilters || (item.children && item.children.length > 0);
  };

  const getFilteredTree = () => {
    if (!hasFilters()) {
      return items;
    }

    const itemsCopy = (item) => JSON.parse(JSON.stringify(item));

    const setAllOpen = (item) => {
      if (item.children) {
        item.children.map(setAllOpen);
      }

      item.isOpen = true;

      return item;
    };

    return items.map(itemsCopy).filter(filterFunction).map(setAllOpen);
  };

  const setSearchInput = (index, value) => {
    const detailSearch = isDetailSearchFn();

    const newState = update(
      {
        isSearchChanged: isSearchChanged,
        searchInputs: searchInputs,
        searchTimestamp: searchTimestamp,
      },
      {
        isSearchChanged: {
          $set: !detailSearch,
        },
        searchInputs: {
          [index]: {
            $set: value,
          },
        },
        searchTimestamp: {
          $set: Date.now(),
        },
      },
    );

    setIsSearchChanged(newState.isSearchChanged);
    setSearchInputs(newState.searchInputs);
    setSearchTimestamp(newState.searchTimestamp);

    if (detailSearch) {
      setTimeout(onSearchTimeout, SEARCH_TIMEOUT);
    }
  };

  const addSearchInput = () => {
    setSearchInputs([...searchInputs, '']);
  };

  const removeSearchInput = (index) => {
    let newSearchInputs;

    if (searchInputs.length === 1) {
      newSearchInputs = [''];
    } else {
      newSearchInputs = [...searchInputs.slice(0, index), ...searchInputs.slice(index + 1)];
    }

    setSearchInputs(newSearchInputs);
    setSearchTimestamp(Date.now());
    setIsSearchChanged(false);

    if (searchInputs[index].length > 0) {
      setTimeout(onSearchTimeout, SEARCH_TIMEOUT);
    }
  };

  const toggleNavigationVisibility = () => {
    const currentVisibility = is_open;

    setNavigationVisibility(!currentVisibility);
  };

  const hasFilters = () => {
    return !!Object.keys(filters)
      .map((key) => filters[key].values.length)
      .reduce((a, b) => a + b, 0);
  };

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
        addSearchInput={addSearchInput}
        attributeTypes={attributeTypes}
        isOpen={is_open}
        isSearchChanged={isSearchChanged}
        isSearching={searchInputs.filter((input) => input.length > 0).length > 0}
        isFetching={isFetching}
        items={items}
        onLeafMouseClick={propOnLeafMouseClick ? (event, leaf) => propOnLeafMouseClick(event, leaf) : onLeafMouseClick}
        onNodeMouseClick={onNodeMouseClick}
        path={tosPath}
        removeSearchInput={removeSearchInput}
        searchInputs={searchInputs}
        setSearchInput={setSearchInput}
        toggleNavigationVisibility={toggleNavigationVisibility}
        tree={tree}
        isDetailSearch={isDetailSearchFn()}
        isUser={isUser}
        filters={filters}
        handleFilterChange={handleFilterChange}
      />
    </div>
  );
};

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
  navigate: PropTypes.func.isRequired,
  setNavigationVisibility: PropTypes.func.isRequired,
  tosPath: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
};

export default withRouter(Navigation);
