import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { isEmpty } from 'lodash';

import {
  fetchNavigationThunk,
  setNavigationVisibility,
  itemsSelector,
  isOpenSelector,
  isFetchingSelector,
  timestampSelector,
} from '../../store/reducers/navigation';
import { attributeTypesSelector } from '../../store/reducers/ui';
import { userDataSelector } from '../../store/reducers/user';
import { classificationSelector } from '../../store/reducers/classification';
import { selectedTOSSelector } from '../../store/reducers/tos-toolkit';
import { itemById } from '../../utils/helpers';
import useAuth from '../../hooks/useAuth';
import InfinityMenu from '../InfinityMenu/InfinityMenu';
import './Navigation.scss';
import { navigationStateFilters } from '../../constants';

const getValueForItemWithAttributePath = (item, path) => {
  if (!path.length) return item;

  const [current, ...rest] = path;

  if (current === undefined) return item;

  if (item === null || item === undefined) return undefined;

  const next = item[current];
  return getValueForItemWithAttributePath(next, rest);
};

const SEARCH_TIMEOUT = 500;

const Navigation = () => {
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

    const getItemFilters = (item, currentPath, nextPath) => {
      if (Array.isArray(item[currentPath])) {
        return item[currentPath].flatMap((arrayItem, i) => {
          if (nextPath) {
            const filters = getItemFilters(arrayItem, nextPath.split('.')[0], nextPath.split('.').slice(1).join('.'));
            // eslint-disable-next-line sonarjs/no-nested-functions
            return filters.map((path) => `${currentPath}.${i}.${path}`);
          } else {
            return `${currentPath}.${i}`;
          }
        });
      } else if (item[currentPath] && nextPath) {
        const filters = getItemFilters(
          item[currentPath],
          nextPath.split('.')[0],
          nextPath.split('.').slice(1).join('.'),
        );
        return filters.map((path) => `${currentPath}.${path}`);
      } else {
        return [currentPath];
      }
    };

    // returns item filter paths e.g.
    // [
    //   ['phases', 0, 'actions', 0, 'records', 0, 'attributes', 'RetentionPeriod'],
    //   ['phases', 1, 'actions', 0, 'records', 0, 'attributes', 'RetentionPeriod']
    // ]
    const getItemFilterPaths = (path, item) =>
      path.split('.').reduce((currentFilters, currentPath) => {
        if (!currentFilters.length) {
          return getItemFilters(item, currentPath, path.split('.').slice(1).join('.'));
        }

        return (
          currentFilters
            // eslint-disable-next-line sonarjs/no-nested-functions
            .map((filterPath) =>
              getItemFilters(
                getValueForItemWithAttributePath(item, filterPath.split('.')),
                currentPath,
                path
                  .split('.')
                  .slice(path.split('.').indexOf(currentPath) + 1)
                  .join('.'),
              ).map((newPath) => `${filterPath}.${newPath}`),
            )
            // eslint-disable-next-line sonarjs/no-nested-functions
            .reduce((a, b) => a.concat(b), [])
        );
      }, []);

    const filterFunction = (item) => {
      const matchesFilters = Object.keys(filters)
        .map((key) => {
          const currentFilter = filters[key].values;
          const paths = filters[key].path;

          if (!currentFilter || currentFilter.length === 0) {
            return true;
          }

          if (paths?.length) {
            // eslint-disable-next-line sonarjs/no-nested-functions
            return paths.some((path) => {
              const itemPaths = getItemFilterPaths(path, item);

              return itemPaths.some((itemPath) => {
                const value = getValueForItemWithAttributePath(item, itemPath.split('.'));

                if (value !== undefined && value !== null) {
                  return currentFilter.includes(value.toString());
                }

                return false;
              });
            });
          }

          return true;
        })
        .every(Boolean);

      if (item.children) {
        item.children = item.children.filter(filterFunction);
      }

      return matchesFilters || (item.children && item.children.length > 0);
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

    return items.map(itemsCopy).filter(filterFunction).map(setAllOpen);
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

  useEffect(() => {
    setTree(getFilteredTree());
  }, [filters, getFilteredTree]);

  useEffect(() => {
    fetchNavigation(isDetailSearch());
  }, [fetchNavigation, isDetailSearch, authenticated]);

  const onNodeMouseClick = useCallback((event, newTree) => {
    setTree(newTree);
  }, []);

  const handleLeafMouseClick = useCallback(
    (event, leaf) => {
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
    [navigate, toggleNavigationVisibility],
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

export default Navigation;
