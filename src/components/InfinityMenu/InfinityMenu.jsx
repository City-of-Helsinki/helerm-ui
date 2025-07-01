/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import Sticky from 'react-sticky-el';
import cloneDeep from 'lodash/cloneDeep';
import _get from 'lodash/get';
import NestedObjects from 'nested-objects';
import Defiant from 'defiant.js';

import ClassificationLink from './ClassificationLink';
import EmptyTree from './EmptyTree';
import Exporter from '../Exporter';
import SearchInputs from './SearchInput/SearchInputs';
import SearchFilters from './SearchFilter/SearchFilters';

const DEFAULT_FILTER_CONDITION = 'and';

/**
 * Extracted from https://github.com/socialtables/react-infinity-menu
 */

const InfinityMenu = ({
  isDetailSearch,
  isSearchChanged,
  items,
  searchInputs,
  tree = [],
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
  const [snapshots, setSnapshots] = useState({});
  const [filterCondition, setFilterCondition] = useState(DEFAULT_FILTER_CONDITION);
  const [isInitializing, setIsInitializing] = useState(true);

  const setDisplayTreeRef = useRef();
  const initialRenderRef = useRef(true);

  const formatDetailFilter = useCallback((field, value) => {
    // returns xpath query e.g.
    // InformationSystem=*ahjo returns: contains(InformationSystem, "ahjo")
    // InformationSystem=ahjo* returns: starts-with(InformationSystem, "ahjo")
    // InformationSystem=ahjo returns: InformationSystem="ahjo"
    const wildcardIndex = value.indexOf('*');
    const fieldValue = value.replace(/\*/g, '');
    if (!fieldValue) {
      return null;
    }
    if (wildcardIndex === 0) {
      return `contains(${field}, "${fieldValue}")`;
    }
    if (wildcardIndex > 0) {
      return `starts-with(${field}, "${fieldValue}")`;
    }
    return `${field}="${fieldValue}"`;
  }, []);

  const getDetailFilters = useCallback(
    (searchInputs) => {
      const filters = [];
      searchInputs.forEach((input) => {
        const splitted = input.split('=').map((m) => m.trim());
        let filter;
        if (splitted.length === 2 && splitted[0] && splitted[1]) {
          filter = formatDetailFilter(splitted[0], splitted[1]);
        } else if (splitted[0]) {
          filter = formatDetailFilter('.', splitted[0]);
        }
        if (filter) {
          filters.push(filter);
        }
      });

      const filterConditionString = ` ${filterCondition} `;

      return filters.length ? `//*[${filters.join(filterConditionString)}]` : '';
    },
    [filterCondition, formatDetailFilter],
  );

  const getNodeMatchesSearchFilter = useCallback(
    (filters, node) => {
      if (filters.length) {
        if (isDetailSearch) {
          const snapshot = snapshots[node.id] ? snapshots[node.id] : null;
          const result = snapshot ? JSON.search(snapshot, filters) : [];

          return result.length > 0;
        }

        return filter(node, filters);
      }

      return true;
    },
    [isDetailSearch, snapshots, filter],
  );

  const findSnapshot = useCallback((snapshots, node) => {
    if (!node.children) {
      return {
        ...snapshots,
        [node.id]: Defiant.getSnapshot(node),
      };
    }
    return node.children.length ? node.children.reduce((prev, curr) => findSnapshot(prev, curr), snapshots) : snapshots;
  }, []);

  const createSnapshots = useCallback(
    (tree) => {
      const newSnapshots = tree.reduce((prev, curr, key) => {
        if (key === undefined) {
          return prev;
        }
        return findSnapshot(prev, curr);
      }, {});
      setSnapshots(newSnapshots);
    },
    [findSnapshot],
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

      const shouldDisplay = filteredSubFolder.some((child) => child.isSearchDisplay) || filter(node, filters);

      if (shouldDisplay) {
        newNode.isSearchOpen = true;
        newNode.children = filteredSubFolder;
        newNode.isSearchDisplay = true;
        newNode.maxLeaves = newNode.maxLeaves ? newNode.maxLeaves : maxLeaves;
        trees.push(newNode);
      }

      return trees;
    },
    [getNodeMatchesSearchFilter, filter, maxLeaves],
  );

  const filterTree = useCallback(
    (searchInputs, tree, isDetailSearch) => {
      const filters = isDetailSearch ? getDetailFilters(searchInputs) : searchInputs[0];

      if (!filters || (typeof filters === 'string' && !filters.trim())) {
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
        filterTree(searchInputs, tree, isDetailSearch);
      }, 0);
    },
    [searchInputs, tree, isDetailSearch, filterTree],
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
      if (emptyTreeComponent && !isFetching) {
        return React.createElement(emptyTreeComponent, emptyTreeComponentProps);
      }
      return null;
    },
    [emptyTreeComponent, emptyTreeComponentProps, isFetching],
  );

  useEffect(() => {
    if (isDetailSearch && items !== undefined) {
      createSnapshots(items);
    }
  }, [isDetailSearch, items, createSnapshots]);

  useEffect(() => {
    if (tree !== undefined) {
      if (initialRenderRef.current) {
        initialRenderRef.current = false;
        setFilteredTree(tree);

        setTimeout(() => {
          setIsInitializing(false);
        }, 300);
      } else if (!isInitializing) {
        setFilteredTree(tree);
      }
    }
  }, [tree, isInitializing]);

  useEffect(() => {
    if (!tree || isInitializing) return;

    const allInputsEmpty = searchInputs.every((input) => !input || input.length === 0);

    const shouldFilter =
      (isSearchChanged && searchInputs?.some((input) => input.length > 0)) ||
      (isDetailSearch && isSearchChanged) ||
      (!isDetailSearch && allInputsEmpty && filteredTree.length !== tree.length);

    if (shouldFilter) {
      filterTree(searchInputs, tree, isDetailSearch);
    }
  }, [isSearchChanged, isDetailSearch, searchInputs, tree, filterTree, isInitializing, filteredTree.length]);

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
  items: PropTypes.array,
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
