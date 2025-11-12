import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { navigationStateFilters } from '../../constants';
import useAuth from '../../hooks/useAuth';
import { classificationSelector } from '../../store/reducers/classification';
import {
  fetchNavigationThunk,
  isFetchingSelector,
  isOpenSelector,
  itemsSelector,
  setNavigationVisibility,
  timestampSelector,
} from '../../store/reducers/navigation';
import { selectedTOSSelector } from '../../store/reducers/tos-toolkit';
import { attributeTypesSelector } from '../../store/reducers/ui';
import { loginStatusSelector, userDataSelector } from '../../store/reducers/user';
import { itemById } from '../../utils/helpers';
import InfinityMenu from '../InfinityMenu/InfinityMenu';
import './Navigation.scss';

const SEARCH_TIMEOUT = 500;

const Navigation = ({ onLeafMouseClick: customOnLeafMouseClick } = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getApiToken, authenticated } = useAuth();

  const attributeTypes = useSelector(attributeTypesSelector);
  const is_open = useSelector(isOpenSelector);
  const items = useSelector(itemsSelector);
  const isFetching = useSelector(isFetchingSelector);
  const itemsTimestamp = useSelector(timestampSelector);
  const userData = useSelector(userDataSelector);
  const loginStatus = useSelector(loginStatusSelector);
  const selectedTOS = useSelector(selectedTOSSelector);
  const classification = useSelector(classificationSelector);

  const [filters, setFilters] = useState(navigationStateFilters);
  const [tree, setTree] = useState(items);
  const [searchInputs, setSearchInputs] = useState(['']);
  const [searchTimestamp, setSearchTimestamp] = useState(0);
  const [isSearchChanged, setIsSearchChanged] = useState(false);

  const searchTimeoutRef = useRef(null);

  const fetchNavigation = useCallback(
    (includeRelated) => {
      const token = getApiToken();
      dispatch(fetchNavigationThunk({ includeRelated, token }));
    },
    [dispatch, getApiToken],
  );

  const toggleNavigationVisibility = useCallback(() => {
    dispatch(setNavigationVisibility(!is_open));
  }, [dispatch, is_open]);

  const isDetailSearch = useCallback(() => {
    return location.pathname === '/filter';
  }, [location.pathname]);

  const hasFilters = useCallback(() => {
    return !!Object.keys(filters)
      .map((key) => filters[key].values.length)
      .reduce((a, b) => a + b, 0);
  }, [filters]);

  const getFilteredTree = useCallback(() => {
    if (!hasFilters()) {
      return items;
    }

    const itemsCopy = (item) => JSON.parse(JSON.stringify(item));

    const getValueByPath = (obj, path) => {
      return path.split('.').reduce((current, key) => {
        if (current === null || current === undefined) return undefined;
        return current[key];
      }, obj);
    };

    const matchesFilter = (item, filterKey, filterValues, filterPaths) => {
      if (!filterValues || filterValues.length === 0) {
        return true;
      }

      // Handle direct property access (like function_state)
      if (filterPaths.length === 1 && !filterPaths[0].includes('.')) {
        const value = item[filterPaths[0]];
        return value !== undefined && value !== null && filterValues.includes(value.toString());
      }

      // Handle nested paths for complex attributes
      return filterPaths.some((path) => {
        const value = getValueByPath(item, path);
        return value !== undefined && value !== null && filterValues.includes(value.toString());
      });
    };

    const filterFunction = (item) => {
      const clonedItem = itemsCopy(item);

      const matchesFilters = Object.entries(filters).every(([filterKey, filterConfig]) => {
        return matchesFilter(clonedItem, filterKey, filterConfig.values, filterConfig.path);
      });

      // Recursively filter children
      if (clonedItem.children) {
        clonedItem.children = clonedItem.children.map(filterFunction).filter((child) => child !== null);
      }

      // Return item if it matches filters OR has matching children
      return matchesFilters || (clonedItem.children && clonedItem.children.length > 0) ? clonedItem : null;
    };

    const setAllOpen = (item) => {
      if (item.children) {
        return {
          ...item,
          isOpen: true,
          children: item.children.map(setAllOpen),
        };
      }
      return item;
    };

    return items
      .map(filterFunction)
      .filter((item) => item !== null)
      .map(setAllOpen);
  }, [hasFilters, items, filters]);
  const handleFilterChange = useCallback((filterValues, filterName) => {
    const mappedValues = filterValues.map(({ value }) => value);

    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        [filterName]: {
          ...prevFilters[filterName],
          values: mappedValues,
        },
      };
      return newFilters;
    });
  }, []);

  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);
  const [lastAuthState, setLastAuthState] = useState(null);
  const [lastUserData, setLastUserData] = useState(null);
  const [lastLoginStatus, setLastLoginStatus] = useState(null);

  useEffect(() => {
    setTree(getFilteredTree());
  }, [filters, getFilteredTree]);

  // Effect to handle initial fetch and authentication state changes
  useEffect(() => {
    const currentAuthState = authenticated;
    const currentUserDataId = userData?.id;
    const currentLoginStatus = loginStatus;

    // Check if this is the initial fetch or if auth state has changed
    const shouldFetch =
      !hasInitiallyFetched ||
      lastAuthState !== currentAuthState ||
      lastUserData !== currentUserDataId ||
      lastLoginStatus !== currentLoginStatus;

    if (shouldFetch) {
      fetchNavigation(isDetailSearch());
      setHasInitiallyFetched(true);
      setLastAuthState(currentAuthState);
      setLastUserData(currentUserDataId);
      setLastLoginStatus(currentLoginStatus);
    }
  }, [
    fetchNavigation,
    isDetailSearch,
    hasInitiallyFetched,
    authenticated,
    userData?.id,
    loginStatus,
    lastAuthState,
    lastUserData,
    lastLoginStatus,
  ]);

  const onNodeMouseClick = useCallback((event, newTree) => {
    setTree(newTree);
  }, []);

  const handleLeafMouseClick = useCallback(
    (event, leaf) => {
      // If a custom onLeafMouseClick is provided (e.g., from CloneView), use it
      if (customOnLeafMouseClick) {
        return customOnLeafMouseClick(event, leaf);
      }

      // Default navigation behavior
      if (leaf.function) {
        navigate(`/view-tos/${leaf.function}`);

        return toggleNavigationVisibility();
      }
      if (leaf.parent) {
        navigate(`/view-classification/${leaf.id}`);
        return toggleNavigationVisibility();
      }

      return toggleNavigationVisibility();
    },
    [navigate, toggleNavigationVisibility, customOnLeafMouseClick],
  );

  const onSearchTimeout = useCallback(() => {
    if (!isSearchChanged && Date.now() - searchTimestamp >= SEARCH_TIMEOUT) {
      const searchQuery = searchInputs.filter((input) => input).join(' ');

      if (searchQuery) {
        navigate(`/search/${encodeURIComponent(searchQuery)}`);
        toggleNavigationVisibility();
      }
    }
  }, [isSearchChanged, navigate, searchInputs, searchTimestamp, toggleNavigationVisibility]);

  const setSearchInput = useCallback(
    (index, value) => {
      const isDetailSearchActive = isDetailSearch();

      setSearchInputs((prev) => {
        const newInputs = [...prev];
        newInputs[index] = value;
        return newInputs;
      });

      setIsSearchChanged(!isDetailSearchActive);
      setSearchTimestamp(Date.now());

      if (isDetailSearchActive) {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          setIsSearchChanged(false);
        }, SEARCH_TIMEOUT);
      }
    },
    [isDetailSearch],
  );

  const addSearchInput = useCallback(() => {
    setSearchInputs((prev) => [...prev, '']);
  }, []);

  const removeSearchInput = useCallback(
    (index) => {
      if (searchInputs.length === 1) {
        setSearchInputs(['']);
      } else {
        setSearchInputs((prev) => prev.filter((_, i) => i !== index));
      }

      setSearchTimestamp(Date.now());
      setIsSearchChanged(false);

      if (searchInputs[index].length > 0) {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          onSearchTimeout();
        }, SEARCH_TIMEOUT);
      }
    },
    [onSearchTimeout, searchInputs],
  );

  useEffect(() => {
    if (isSearchChanged) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        onSearchTimeout();
      }, SEARCH_TIMEOUT);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isSearchChanged, onSearchTimeout]);

  const calculatedTosPath = React.useMemo(() => {
    let tos = null;

    if (selectedTOS.classification) {
      tos = itemById(items, selectedTOS.classification.id);
    } else if (classification.id) {
      tos = itemById(items, classification.id);
    }

    if (tos) {
      return tos.path;
    }

    return [];
  }, [selectedTOS.classification, classification.id, items]);

  if (!isFetching && isEmpty(items) && !isEmpty(itemsTimestamp) && !hasFilters()) {
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
        onLeafMouseClick={handleLeafMouseClick}
        onNodeMouseClick={onNodeMouseClick}
        path={calculatedTosPath}
        removeSearchInput={removeSearchInput}
        searchInputs={searchInputs}
        setSearchInput={setSearchInput}
        toggleNavigationVisibility={toggleNavigationVisibility}
        tree={tree}
        isDetailSearch={isDetailSearch()}
        isUser={!isEmpty(userData)}
        filters={filters}
        handleFilterChange={handleFilterChange}
      />
    </div>
  );
};

Navigation.propTypes = {
  onLeafMouseClick: PropTypes.func,
};

export default Navigation;
