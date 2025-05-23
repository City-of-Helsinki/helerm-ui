/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import NestedObjects from 'nested-objects';
import Defiant from 'defiant.js';
import Sticky from 'react-sticky-el';

import ClassificationLink from './ClassificationLink';
import EmptyTree from './EmptyTree';
import Exporter from '../Exporter';
import SearchInputs from './SearchInput/SearchInputs';
import SearchFilters from './SearchFilter/SearchFilters';

const DEFAULT_FILTER_CONDITION = 'and';

/**
 * Extracted from https://github.com/socialtables/react-infinity-menu
 */
const InfinityMenu = (props) => {
  const [filteredTree, setFilteredTree] = useState([]);
  const [snapshots, setSnapshots] = useState({});
  const [filterCondition, setFilterCondition] = useState(DEFAULT_FILTER_CONDITION);

  const prevProps = React.useRef(null);

  const getNodeMatchesSearchFilter = useCallback(
    (filters, node) => {
      if (filters.length) {
        if (props.isDetailSearch) {
          const snapshot = snapshots[node.id] ? snapshots[node.id] : null;
          const result = snapshot ? JSON.search(snapshot, filters) : [];

          return result.length > 0;
        }

        return props.filter(node, filters);
      }

      return true;
    },
    [props, snapshots],
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

      const shouldDisplay = filteredSubFolder.some((child) => child.isSearchDisplay) || props.filter(node, filters);

      if (shouldDisplay) {
        newNode.isSearchOpen = true;
        newNode.children = filteredSubFolder;
        newNode.isSearchDisplay = true;
        newNode.maxLeaves = newNode.maxLeaves ? newNode.maxLeaves : props.maxLeaves;
        trees.push(newNode);
      }

      return trees;
    },
    [getNodeMatchesSearchFilter, props],
  );

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
    [filterCondition],
  );

  const filterTree = useCallback(
    (searchInputs, tree, isDetailSearch) => {
      const filters = isDetailSearch ? getDetailFilters(searchInputs) : searchInputs[0];

      const filteredTreeResult = filters
        ? tree.reduce((prev, curr, key) => {
            if (key === undefined) {
              return prev;
            }
            return findFiltered(prev, curr, key, filters);
          }, [])
        : tree;

      setFilteredTree(filteredTreeResult);
    },
    [findFiltered, getDetailFilters],
  );

  const findSnapshot = useCallback((currentSnapshots, node) => {
    if (!node.children) {
      currentSnapshots[node.id] = Defiant.getSnapshot(node);
      return currentSnapshots;
    }
    return node.children.length
      ? node.children.reduce((prev, curr) => findSnapshot(prev, curr), currentSnapshots)
      : currentSnapshots;
  }, []);

  const createSnapshots = useCallback(
    (tree) => {
      const snapshotsResult = tree.reduce((prev, curr, key) => {
        if (key === undefined) {
          return prev;
        }
        return findSnapshot(prev, curr);
      }, {});
      setSnapshots(snapshotsResult);
    },
    [findSnapshot],
  );

  useEffect(() => {
    const { isDetailSearch, isSearchChanged, items, searchInputs, tree } = props;

    if (isDetailSearch && items !== prevProps.current?.items) {
      createSnapshots(items);
    }

    if (tree !== prevProps.current?.tree) {
      setFilteredTree(tree);
    }

    if (
      (tree !== prevProps.current?.tree && isSearchChanged && searchInputs) ||
      (isDetailSearch && isSearchChanged && !prevProps.current?.isSearchChanged) ||
      (!isDetailSearch && searchInputs !== prevProps.current?.searchInputs)
    ) {
      filterTree(searchInputs, tree, isDetailSearch);
    }

    prevProps.current = props;
  }, [props, createSnapshots, filterTree]);

  const onNodeClick = (tree, node, keyPath, event) => {
    event.preventDefault();

    if (!props.isSearching) {
      node.isOpen = !node.isOpen;
      node.maxLeaves = props.maxLeaves;
      NestedObjects.set(tree, keyPath, node);

      if (props.onNodeMouseClick) {
        const currLevel = Math.floor(keyPath.split('.').length / 2);
        props.onNodeMouseClick(event, tree, node, currLevel, keyPath);
      }
    }
  };

  const onLoadMoreClick = (tree, node, keyPath, event) => {
    event.preventDefault();
    // get parent node so we can increment it's unique max leaves property
    const keyPathArray = keyPath.split('.');
    const parentPath = Object.assign([], keyPathArray).splice(0, keyPathArray.length - 2);
    const parentNode = _get(props.tree, parentPath);
    // set new max leaves - if none exist use component default property
    parentNode.maxLeaves = !parentNode.maxLeaves ? props.maxLeaves : parentNode.maxLeaves + props.maxLeaves;

    if (props.onNodeMouseClick) {
      const currLevel = Math.floor(keyPath.split('.').length / 2);

      props.onNodeMouseClick(event, tree, node, currLevel, keyPath);
    }
  };

  const onFilterConditionChange = (option) => {
    setFilterCondition(option.value);
    // Filter tree after state update
    setTimeout(() => filterTree(props.searchInputs, props.tree, props.isDetailSearch), 0);
  };

  // Extract nested sub-function to reduce complexity
  const createLeafElement = (curr, itemKey, parentNode, filteredChildren, tree, keyPath) => {
    const { isSearching } = props;
    const shouldDisplay = (isSearching && curr.isSearchDisplay) || !isSearching;

    const visIds = filteredChildren.map((e) => e.id);

    let relativeIndex = visIds.indexOf(curr.id);
    relativeIndex = relativeIndex === -1 ? Infinity : relativeIndex;

    const parentMaxLeaves = parentNode?.maxLeaves || props.maxLeaves;

    if (shouldDisplay && parentMaxLeaves > relativeIndex) {
      if (curr.customComponent) {
        const currCustomComponent =
          typeof curr.customComponent === 'string'
            ? props.customComponentMappings[curr.customComponent]
            : curr.customComponent;

        const componentProps = {
          key: itemKey,
          onMouseDown: (e) => {
            if (props.onLeafMouseDown) {
              props.onLeafMouseDown(e, curr);
            }
          },
          onMouseUp: (e) => {
            if (props.onLeafMouseUp) {
              props.onLeafMouseUp(e, curr);
            }
          },
          onClick: (e) => {
            if (props.onLeafMouseClick) {
              props.onLeafMouseClick(e, curr);
            }
          },
          name: curr.name,
          icon: curr.icon,
          data: curr,
        };
        return React.createElement(currCustomComponent, componentProps);
      } else {
        return (
          <li
            key={itemKey}
            className={`infinity-menu-leaf-container${!curr.function ? ' new-leaf' : ''}`}
            onMouseDown={(e) => (props.onLeafMouseDown ? props.onLeafMouseDown(e, curr) : null)}
            onMouseUp={(e) => (props.onLeafMouseUp ? props.onLeafMouseUp(e, curr) : null)}
            onClick={(e) => (props.onLeafMouseClick ? props.onLeafMouseClick(e, curr) : null)}
            onKeyUp={(e) => {
              if (props.onLeafMouseClick && e.key === 'Enter') {
                props.onLeafMouseClick(e, curr);
              }
            }}
          >
            <span>
              {curr.name} <ClassificationLink id={curr.id} />
            </span>
          </li>
        );
      }
    } else if (shouldDisplay && relativeIndex === filteredChildren.length - 1) {
      return (
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
        </li>
      );
    }

    return null;
  };

  // Extract node creation to reduce complexity
  const createNodeElement = (curr, key, nodeName, tree, keyPath) => {
    const { isSearching } = props;
    const shouldDisplay = (isSearching && curr.isSearchDisplay) || !isSearching;

    if (shouldDisplay) {
      if (curr.customComponent) {
        const currCustomComponent =
          typeof curr.customComponent === 'string'
            ? props.customComponentMappings[curr.customComponent]
            : curr.customComponent;

        const nodeProps = {
          onClick: (e) => onNodeClick(tree, curr, keyPath, e),
          name: nodeName,
          isOpen: curr.isOpen,
          isSearching: isSearching,
          data: curr,
          key,
        };
        return React.createElement(currCustomComponent, nodeProps);
      } else {
        return (
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
          </button>
        );
      }
    }

    return null;
  };

  // Helper functions to process different node types
  const processLeafNode = (tree, prevs, curr, keyPath) => {
    const keyPathArray = keyPath.split('.');
    const parentPath = keyPathArray.slice(0, -2);
    const parentNode = _get(tree, parentPath);

    let filteredChildren = [];

    if (parentNode?.children) {
      if (parentNode.children.some((child) => child.isSearchDisplay)) {
        filteredChildren = parentNode.children.filter((child) => child.isSearchDisplay);
      } else {
        filteredChildren = parentNode.children;
      }
    }
    const itemKey = `infinity-menu-leaf-${curr.id}`;

    const leafElement = createLeafElement(curr, itemKey, parentNode, filteredChildren, tree, keyPath);
    if (leafElement) {
      prevs.push(leafElement);
    }
    return prevs;
  };

  const processChildrenList = (curr, tree, keyPath) => {
    if (!curr.children.length) return [];
    return curr.children.reduce((p, c, k) => {
      if (!c || !k) return p;
      return setDisplayTree(tree, p, c, `${keyPath}.children.${k}`);
    }, []);
  };

  const processOpenNode = (tree, currLevel, curr, key, nodeName, keyPath, prevs, shouldDisplay) => {
    if (!shouldDisplay) return prevs;

    const openedNode = [];
    const nodeElement = createNodeElement(curr, key, nodeName, tree, keyPath);
    if (nodeElement) openedNode.push(nodeElement);

    const childrenList = processChildrenList(curr, tree, keyPath);
    if (childrenList.length) {
      openedNode.push(<ul key={`infinity-menu-children-list${currLevel}`}>{childrenList}</ul>);
    }

    prevs.push(openedNode);
    return prevs;
  };

  const setDisplayTree = (tree, prevs, curr, keyPath) => {
    const currLevel = Math.floor(keyPath.length / 2);
    curr.keyPath = keyPath;

    // Leaf node
    if (!curr.children) {
      return processLeafNode(tree, prevs, curr, keyPath);
    }

    // Non-leaf node
    const key = `infinity-menu-node-${currLevel}-${curr.id}`;
    const nodeName = curr.name;
    const { isSearching } = props;
    const shouldDisplay = (isSearching && curr.isSearchDisplay) || !isSearching;

    // Closed node
    if ((!curr.isOpen && !isSearching) || (!curr.isSearchOpen && isSearching)) {
      const nodeElement = createNodeElement(curr, key, nodeName, tree, keyPath);
      if (nodeElement) prevs.push(nodeElement);
      return prevs;
    }

    // Open node
    return processOpenNode(tree, currLevel, curr, key, nodeName, keyPath, prevs, shouldDisplay);
  };

  const formatDetailFilter = (field, value) => {
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
  };

  const renderBody = (displayTree) => {
    const { emptyTreeComponent, emptyTreeComponentProps, isFetching } = props;

    if (displayTree.length) {
      return displayTree;
    }
    if (emptyTreeComponent && !isFetching) {
      return React.createElement(emptyTreeComponent, emptyTreeComponentProps);
    }
    return null;
  };

  const {
    attributeTypes,
    isDetailSearch,
    headerProps,
    searchInputs,
    addSearchInput,
    setSearchInput,
    removeSearchInput,
    isUser,
    filters,
    handleFilterChange,
  } = props;

  // recursive go through the tree
  const displayTree = filteredTree.reduce((prev, curr, key) => {
    if (key === undefined) {
      return prev;
    }
    return setDisplayTree(filteredTree, prev, curr, key.toString());
  }, []);

  // header component
  const bodyContent = renderBody(displayTree);

  return (
    <div
      id='navigation-menu'
      className={classnames('navigation-menu', {
        'navigation-open': props.isOpen,
      })}
    >
      <Sticky stickyClassName='navigation-sticky'>
        <>
          <div className='navigation-header clearfix'>
            <button type='button' className='pull-left nav-button' onClick={props.toggleNavigationVisibility}>
              <span className='fa-solid fa-list' aria-hidden='true' />
            </button>
            {!!props.path.length && (
              <ol
                className='breadcrumb'
                onClick={props.toggleNavigationVisibility}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    props.toggleNavigationVisibility();
                  }
                }}
              >
                {props.path.map((item, index) => (
                  <li
                    className={classnames({
                      active: index === props.path.length,
                    })}
                    key={index}
                  >
                    {item}
                  </li>
                ))}
              </ol>
            )}
          </div>
          {props.isOpen && (
            <div className='navigation-container'>
              <div className='navigation-toggle'>
                <button type='button' className='nav-button' onClick={props.toggleNavigationVisibility}>
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

InfinityMenu.defaultProps = {
  emptyTreeComponent: EmptyTree,
  emptyTreeComponentProps: {},
  filter: (node, searchInput) => node.name.toLowerCase().indexOf(searchInput.toLowerCase()) >= 0,
  headerProps: {},
  maxLeaves: Infinity,
  onLeafMouseClick: () => {},
  onLeafMouseDown: () => {},
  onLeafMouseUp: () => {},
  onNodeMouseClick: () => {},
  tree: [],
};

export default InfinityMenu;
