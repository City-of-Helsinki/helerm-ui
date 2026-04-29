import classnames from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import _get from 'lodash/get';
import NestedObjects from 'nested-objects';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Sticky from 'react-sticky-el';

import { matchesFilters, parseDetailFilters } from './searchUtils';
import Exporter from '../Exporter';
import ClassificationLink from './ClassificationLink';
import EmptyTree from './EmptyTree';
import SearchFilters from './SearchFilter/SearchFilters';
import SearchInputs from './SearchInput/SearchInputs';

const DEFAULT_FILTER_CONDITION = 'and';
const EMPTY_TREE = [];

/**
 * Extracted from https://github.com/socialtables/react-infinity-menu
 */

const InfinityMenu = ({
  isDetailSearch,
  isSearchChanged,
  searchInputs,
  tree = EMPTY_TREE,
  isSearching,
  maxLeaves = Infinity,
  onNodeMouseClick = () => {},
  toggleNavigationVisibility,
  path,
  emptyTreeComponent = EmptyTree,
  emptyTreeComponentProps = {},
  isFetching,
  attributeTypes,
  addSearchInput,
  setSearchInput,
  removeSearchInput,
  isUser,
  filters,
  handleFilterChange,
  isOpen,
  customComponentMappings,
  onLeafMouseDown = () => {},
  onLeafMouseUp = () => {},
  onLeafMouseClick = () => {},
  filter = (node, searchInput) => node.name.toLowerCase().indexOf(searchInput.toLowerCase()) >= 0,
  headerProps = {},
}) => {
  const [filteredTree, setFilteredTree] = useState([]);
  const [filterCondition, setFilterCondition] = useState(DEFAULT_FILTER_CONDITION);
  const [isInitializing, setIsInitializing] = useState(true);

  const setDisplayTreeRef = useRef();
  const filteredTreeLengthRef = useRef(0);
  const filterTreeRef = useRef();

  // Keep filtered tree length ref in sync
  React.useEffect(() => {
    filteredTreeLengthRef.current = filteredTree.length;
  }, [filteredTree.length]);

  const getDetailFilters = useCallback(
    (searchInputs) => ({
      parsedFilters: parseDetailFilters(searchInputs),
      condition: filterCondition,
    }),
    [filterCondition],
  );

  const getNodeMatchesSearchFilter = useCallback(
    (filters, node) => {
      if (isDetailSearch) {
        return matchesFilters(node, filters.parsedFilters, filters.condition);
      }
      if (filters) {
        return filter(node, filters);
      }
      return true;
    },
    [isDetailSearch, filter],
  );

  const findFiltered = useCallback(
    (trees, node, key, filters) => {
      const newNode = cloneDeep(node);

      if (!node.children?.length) {
        const nodeMatchesSearchFilter = getNodeMatchesSearchFilter(filters, node);

        if (nodeMatchesSearchFilter) {
          newNode.isSearchDisplay = true;
          trees.push(newNode);
        }
        return trees;
      }

      const filteredSubFolder = node.children.length
        ? node.children.reduce((p, c, k) => findFiltered(p, c, k, filters), [])
        : [];

      const shouldDisplay =
        filteredSubFolder.some((child) => child.isSearchDisplay) || (!isDetailSearch && filter(node, filters));

      if (shouldDisplay) {
        newNode.isSearchOpen = true;
        newNode.children = filteredSubFolder;
        newNode.isSearchDisplay = true;
        newNode.maxLeaves = newNode.maxLeaves ? newNode.maxLeaves : maxLeaves;
        trees.push(newNode);
      }

      return trees;
    },
    [getNodeMatchesSearchFilter, filter, maxLeaves, isDetailSearch],
  );

  const filterTree = useCallback(
    (searchInputs, tree, isDetailSearch) => {
      const filters = isDetailSearch ? getDetailFilters(searchInputs) : searchInputs[0];

      const hasNoFilters = isDetailSearch ? filters.parsedFilters.length === 0 : !filters?.trim();

      if (hasNoFilters) {
        setFilteredTree(tree);
        return;
      }

      const newFilteredTree = tree.reduce((prev, curr, key) => {
        if (key === undefined) {
          return prev;
        }
        return findFiltered(prev, curr, key, filters);
      }, []);

      setFilteredTree(newFilteredTree);
    },
    [getDetailFilters, findFiltered],
  );

  // Keep filterTree ref updated
  React.useEffect(() => {
    filterTreeRef.current = filterTree;
  }, [filterTree]);

  const onNodeClick = useCallback(
    (tree, node, keyPath, event) => {
      event.preventDefault();
      if (!isSearching) {
        const updatedNode = {
          ...node,
          isOpen: !node.isOpen,
          maxLeaves: maxLeaves,
        };

        const newTree = cloneDeep(tree);
        NestedObjects.set(newTree, keyPath, updatedNode);

        if (onNodeMouseClick) {
          const currLevel = Math.floor(keyPath.split('.').length / 2);
          onNodeMouseClick(event, newTree, updatedNode, currLevel, keyPath);
        }
      }
    },
    [isSearching, maxLeaves, onNodeMouseClick],
  );

  const onLoadMoreClick = useCallback(
    (tree, node, keyPath, event) => {
      event.preventDefault();

      const keyPathArray = keyPath.split('.');
      const parentPath = Object.assign([], keyPathArray).splice(0, keyPathArray.length - 2);
      const parentNode = _get(tree, parentPath);

      const updatedParentNode = {
        ...parentNode,
        maxLeaves: !parentNode.maxLeaves ? maxLeaves : parentNode.maxLeaves + maxLeaves,
      };

      const newTree = cloneDeep(tree);

      NestedObjects.set(newTree, parentPath.join('.'), updatedParentNode);

      if (onNodeMouseClick) {
        const currLevel = Math.floor(keyPath.split('.').length / 2);
        onNodeMouseClick(event, newTree, node, currLevel, keyPath);
      }
    },
    [maxLeaves, onNodeMouseClick],
  );

  const onFilterConditionChange = useCallback(
    (option) => {
      setFilterCondition(option.value);
      setTimeout(() => {
        if (filterTreeRef.current) {
          filterTreeRef.current(searchInputs, tree, isDetailSearch);
        }
      }, 0);
    },
    [searchInputs, tree, isDetailSearch],
  );

  const setDisplayTree = useCallback(
    // eslint-disable-next-line sonarjs/cognitive-complexity
    (tree, prevs, curr, keyPath) => {
      const currLevel = Math.floor(keyPath.length / 2);
      const currCustomComponent =
        typeof curr.customComponent === 'string' ? customComponentMappings[curr.customComponent] : curr.customComponent;
      const shouldDisplay = (isSearching && curr.isSearchDisplay) || !isSearching;

      if (!curr.children) {
        const keyPathArray = keyPath.split('.');
        const parentPath = Object.assign([], keyPathArray).splice(0, keyPathArray.length - 2);
        const parentNode = _get(tree, parentPath);
        if (!parentNode?.children) {
          return prevs;
        }
        const filteredChildren = parentNode.children.some((child) => child.isSearchDisplay === true)
          ? parentNode.children.filter((child) => child.isSearchDisplay === true)
          : parentNode.children;
        const itemKey = `infinity-menu-leaf-${curr.id}`;
        const visIds = filteredChildren.map((e) => e.id);

        let relativeIndex = visIds.indexOf(curr.id);
        relativeIndex = relativeIndex === -1 ? Infinity : relativeIndex;

        const parentMaxLeaves = parentNode.maxLeaves || maxLeaves;
        if (shouldDisplay && parentMaxLeaves > relativeIndex) {
          if (curr.customComponent) {
            const componentProps = {
              key: itemKey,
              onMouseDown: (e) => {
                if (onLeafMouseDown) {
                  onLeafMouseDown(e, curr);
                }
              },
              onMouseUp: (e) => {
                if (onLeafMouseUp) {
                  onLeafMouseUp(e, curr);
                }
              },
              onClick: (e) => {
                if (onLeafMouseClick) {
                  onLeafMouseClick(e, curr);
                }
              },
              name: curr.name,
              icon: curr.icon,
              data: curr,
            };
            prevs.push(React.createElement(currCustomComponent, componentProps));
          } else {
            prevs.push(
              <li
                key={itemKey}
                className={`infinity-menu-leaf-container${!curr.function ? ' new-leaf' : ''}`}
                onMouseDown={(e) => (onLeafMouseDown ? onLeafMouseDown(e, curr) : null)}
                onMouseUp={(e) => (onLeafMouseUp ? onLeafMouseUp(e, curr) : null)}
                onClick={(e) => (onLeafMouseClick ? onLeafMouseClick(e, curr) : null)}
                onKeyUp={(e) => {
                  if (onLeafMouseClick && e.key === 'Enter') {
                    onLeafMouseClick(e, curr);
                  }
                }}
              >
                <span>
                  {curr.name} <ClassificationLink id={curr.id} />
                </span>
              </li>,
            );
          }
        } else if (shouldDisplay && relativeIndex === filteredChildren.length - 1) {
          prevs.push(
            <li
              key={itemKey}
              className='infinity-menu-load-more-container'
              onClick={(e) => onLoadMoreClick(tree, curr, keyPath, e)}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  onLoadMoreClick(tree, curr, keyPath, e);
                }
              }}
            >
              <span>Näytä lisää</span>
            </li>,
          );
        }
        return prevs;
      }
      const key = `infinity-menu-node-${currLevel}-${curr.id}`;
      const nodeName = curr.name;
      if ((!curr.isOpen && !isSearching) || (!curr.isSearchOpen && isSearching)) {
        if (shouldDisplay) {
          if (curr.customComponent) {
            const nodeProps = {
              onClick: (e) => onNodeClick(tree, curr, keyPath, e),
              name: nodeName,
              isOpen: curr.isOpen,
              isSearching: false,
              data: curr,
              key,
            };
            prevs.push(React.createElement(currCustomComponent, nodeProps));
          } else {
            prevs.push(
              <button
                type='button'
                key={key}
                onClick={(e) => onNodeClick(tree, curr, keyPath, e)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    onNodeClick(tree, curr, keyPath, e);
                  }
                }}
                className={classnames('infinity-menu-node-container', {
                  opened: !!curr.isOpen,
                })}
              >
                <label>
                  {nodeName} <ClassificationLink id={curr.id} />
                </label>
              </button>,
            );
          }
        }
        return prevs;
      }
      const openedNode = [];
      if (shouldDisplay) {
        if (curr.customComponent) {
          const nodeProps = {
            onClick: (e) => onNodeClick(tree, curr, keyPath, e),
            name: nodeName,
            isOpen: curr.isOpen,
            data: curr,
            key,
            isSearching,
          };
          openedNode.push(React.createElement(currCustomComponent, nodeProps));
        } else {
          openedNode.push(
            <button
              type='button'
              key={key}
              onClick={(e) => onNodeClick(tree, curr, keyPath, e)}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  onNodeClick(tree, curr, keyPath, e);
                }
              }}
              className={classnames('infinity-menu-node-container', {
                opened: !!curr.isOpen,
              })}
            >
              <label>
                {nodeName} <ClassificationLink id={curr.id} />
              </label>
            </button>,
          );
        }

        const childrenList = curr.children.length
          ? curr.children.reduce((p, c, k) => {
              if (c === undefined || k === undefined) {
                return p;
              }
              return setDisplayTreeRef.current(tree, p, c, `${keyPath}.children.${k}`);
            }, [])
          : [];

        if (childrenList.length > 0) {
          openedNode.push(<ul key={`infinity-menu-children-list${currLevel}`}>{childrenList}</ul>);
        }
        prevs.push(openedNode);
      }
      return prevs;
    },
    [
      customComponentMappings,
      isSearching,
      maxLeaves,
      onLeafMouseDown,
      onLeafMouseUp,
      onLeafMouseClick,
      onNodeClick,
      onLoadMoreClick,
    ],
  );

  useEffect(() => {
    setDisplayTreeRef.current = setDisplayTree;
  }, [setDisplayTree]);

  const renderBody = useCallback(
    (displayTree) => {
      if (displayTree.length) {
        return displayTree;
      }

      // Only show empty tree component when we're not fetching/initializing and have no items
      if (!isFetching && !isInitializing && emptyTreeComponent) {
        return React.createElement(emptyTreeComponent, emptyTreeComponentProps);
      }

      return null;
    },
    [emptyTreeComponent, emptyTreeComponentProps, isFetching, isInitializing],
  );

  useEffect(() => {
    if (tree !== undefined) {
      setFilteredTree(tree);
    }
  }, [tree]);

  // End initialization when fetching starts or data arrives
  useEffect(() => {
    if (isInitializing && (isFetching || tree.length > 0)) {
      setIsInitializing(false);
    }
  }, [isInitializing, isFetching, tree]);

  useEffect(() => {
    if (!tree || isInitializing) return;

    const allInputsEmpty = searchInputs.every((input) => !input || input.length === 0);

    const shouldFilter =
      (isSearchChanged && searchInputs?.some((input) => input.length > 0)) ||
      (isDetailSearch && isSearchChanged) ||
      (!isDetailSearch && allInputsEmpty && filteredTreeLengthRef.current !== tree.length);

    if (shouldFilter && filterTreeRef.current) {
      filterTreeRef.current(searchInputs, tree, isDetailSearch);
    }
  }, [isSearchChanged, isDetailSearch, searchInputs, tree, isInitializing]);

  const displayTree = React.useMemo(() => {
    return filteredTree.reduce((prev, curr, key) => {
      if (key === undefined) {
        return prev;
      }
      return setDisplayTree(filteredTree, prev, curr, key.toString());
    }, []);
  }, [filteredTree, setDisplayTree]);

  const bodyContent = renderBody(displayTree);

  return (
    <div
      id='navigation-menu'
      className={classnames('navigation-menu', {
        'navigation-open': isOpen,
      })}
    >
      <Sticky stickyClassName='navigation-sticky'>
        <>
          <div className='navigation-header clearfix'>
            <button type='button' className='pull-left nav-button' onClick={toggleNavigationVisibility}>
              <span className='fa-solid fa-list' aria-hidden='true' />
            </button>
            {!!path?.length && (
              <ol
                className='breadcrumb'
                onClick={toggleNavigationVisibility}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    toggleNavigationVisibility();
                  }
                }}
              >
                {path.map((item, index) => (
                  <li
                    className={classnames({
                      active: index === path.length,
                    })}
                    // eslint-disable-next-line @eslint-react/no-array-index-key
                    key={index}
                  >
                    {item}
                  </li>
                ))}
              </ol>
            )}
          </div>
          {isOpen && (
            <div className='navigation-container'>
              <div className='navigation-toggle'>
                <button type='button' className='nav-button' onClick={toggleNavigationVisibility}>
                  <span className='fa-solid fa-xmark' aria-hidden='true' />
                </button>
              </div>
              <div className='navigation-filters clearfix'>
                <div className='navigation-filters-container'>
                  {isDetailSearch && (
                    <div className='row navigation-filters-header'>
                      <div className='col-xs-6'>
                        <h2>Sisältöhaku</h2>
                      </div>
                      <div className='col-xs-6'>
                        <Exporter
                          attributeTypes={attributeTypes}
                          data={filteredTree}
                          isVisible={filteredTree.length > 0}
                        />
                      </div>
                    </div>
                  )}
                  <div className='row'>
                    <SearchInputs
                      headerProps={headerProps}
                      isDetailSearch={isDetailSearch}
                      searchInputs={searchInputs}
                      filterCondition={filterCondition}
                      addSearchInput={addSearchInput}
                      setSearchInput={setSearchInput}
                      removeSearchInput={removeSearchInput}
                      onFilterConditionChange={onFilterConditionChange}
                      disabled={isFetching || isInitializing}
                    />
                    <div
                      className={classnames({
                        'col-xs-12': isDetailSearch,
                        'col-sm-6': !isDetailSearch,
                      })}
                    >
                      <SearchFilters
                        attributeTypes={attributeTypes}
                        isDetailSearch={isDetailSearch}
                        isUser={isUser}
                        filters={filters}
                        handleFilterChange={handleFilterChange}
                        disabled={isFetching || isInitializing}
                      />
                    </div>
                  </div>
                </div>
                {!isDetailSearch && (
                  <div className='classification-link'>
                    <Link className='btn btn-primary btn-sm' to='/classification-tree'>
                      <span className='fa-solid fa-info' aria-hidden='true' />
                    </Link>
                  </div>
                )}
              </div>
              <div className='infinity-menu-container'>
                <div className='infinity-menu-display-tree-container'>{bodyContent}</div>
              </div>
            </div>
          )}
        </>
      </Sticky>
    </div>
  );
};

InfinityMenu.propTypes = {
  addSearchInput: PropTypes.func.isRequired,
  attributeTypes: PropTypes.object,
  customComponentMappings: PropTypes.object,
  emptyTreeComponent: PropTypes.any,
  emptyTreeComponentProps: PropTypes.object,
  filter: PropTypes.func,
  headerProps: PropTypes.object,
  isDetailSearch: PropTypes.bool,
  isFetching: PropTypes.bool,
  isOpen: PropTypes.bool,
  isSearchChanged: PropTypes.bool,
  isSearching: PropTypes.bool,
  isUser: PropTypes.bool.isRequired,
  maxLeaves: PropTypes.number,
  onLeafMouseClick: PropTypes.func,
  onLeafMouseDown: PropTypes.func,
  onLeafMouseUp: PropTypes.func,
  onNodeMouseClick: PropTypes.func,
  path: PropTypes.array,
  removeSearchInput: PropTypes.func.isRequired,
  searchInputs: PropTypes.array.isRequired,
  setSearchInput: PropTypes.func.isRequired,
  toggleNavigationVisibility: PropTypes.func,
  tree: PropTypes.array,
  filters: PropTypes.object.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
};

export default InfinityMenu;
