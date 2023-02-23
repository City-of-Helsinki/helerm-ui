/* eslint-disable camelcase */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
/* eslint-disable react/forbid-prop-types */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import NestedObjects from 'nested-objects';
import Select from 'react-select';
import Defiant from 'defiant.js';
import Sticky from 'react-sticky-el';

import SearchInput from './searchInput';
import ClassificationLink from './classificationLink';
import EmptyTree from './EmptyTree';
import Exporter from '../Exporter';

const DEFAULT_FILTER_CONDITION = 'and';
const FILTER_CONDITION_OPTIONS = [
  { value: 'and', label: 'JA' },
  { value: 'or', label: 'TAI' },
];

/**
 * Extracted from https://github.com/socialtables/react-infinity-menu
 */
class InfinityMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredTree: [],
      snapshots: {},
      filterCondition: DEFAULT_FILTER_CONDITION,
    };

    this.onNodeClick = this.onNodeClick.bind(this);
    this.onLoadMoreClick = this.onLoadMoreClick.bind(this);
    this.onFilterConditionChange = this.onFilterConditionChange.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { isDetailSearch, isSearchChanged, items, searchInputs, tree } = nextProps;
    const {
      isSearchChanged: wasSearchChanged,
      items: prevItems,
      searchInputs: prevInputs,
      tree: prevTree,
    } = this.props;
    if (isDetailSearch && items !== prevItems) {
      this.createSnapshots(items);
    }
    if (tree !== prevTree) {
      this.setState({ filteredTree: tree });
    }
    if (
      (tree !== prevTree && isSearchChanged && searchInputs) ||
      (isDetailSearch && isSearchChanged && !wasSearchChanged) ||
      (!isDetailSearch && searchInputs !== prevInputs)
    ) {
      this.filterTree(searchInputs, tree, isDetailSearch);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.shouldComponentUpdate) {
      return nextProps.shouldComponentUpdate(this.props, this.state, nextProps, nextState);
    }
    return true;
  }

  onNodeClick(tree, node, keyPath, event) {
    event.preventDefault();
    if (!this.props.isSearching) {
      node.isOpen = !node.isOpen;
      node.maxLeaves = this.props.maxLeaves;
      NestedObjects.set(tree, keyPath, node);
      if (this.props.onNodeMouseClick) {
        const currLevel = Math.floor(keyPath.split('.').length / 2);
        this.props.onNodeMouseClick(event, tree, node, currLevel, keyPath);
      }
    }
  }

  onLoadMoreClick(tree, node, keyPath, event) {
    event.preventDefault();
    // get parent node so we can increment it's unique max leaves property
    const keyPathArray = keyPath.split('.');
    const parentPath = Object.assign([], keyPathArray).splice(0, keyPathArray.length - 2);
    const parentNode = _get(this.props.tree, parentPath);
    // set new max leaves - if none exist use component default property
    parentNode.maxLeaves = !parentNode.maxLeaves ? this.props.maxLeaves : parentNode.maxLeaves + this.props.maxLeaves;
    if (this.props.onNodeMouseClick) {
      const currLevel = Math.floor(keyPath.split('.').length / 2);
      this.props.onNodeMouseClick(event, tree, node, currLevel, keyPath);
    }
  }

  onFilterConditionChange(option) {
    this.setState({ filterCondition: option.value }, () =>
      this.filterTree(this.props.searchInputs, this.props.tree, this.props.isDetailSearch),
    );
  }

  getDetailFilters(searchInputs) {
    const filters = [];
    const { filterCondition } = this.state;
    searchInputs.forEach((input) => {
      const splitted = input.split('=').map((m) => m.trim());
      let filter;
      if (splitted.length === 2 && splitted[0] && splitted[1]) {
        filter = this.formatDetailFilter(splitted[0], splitted[1]);
      } else if (splitted[0]) {
        filter = this.formatDetailFilter('.', splitted[0]);
      }
      if (filter) {
        filters.push(filter);
      }
    });
    return filters.length ? `//*[${filters.join(` ${filterCondition} `)}]` : '';
  }

  setDisplayTree(tree, prevs, curr, keyPath) {
    const currLevel = Math.floor(keyPath.length / 2);
    const currCustomComponent =
      typeof curr.customComponent === 'string'
        ? this.props.customComponentMappings[curr.customComponent]
        : curr.customComponent;
    const { isSearching } = this.props;
    const shouldDisplay = (isSearching && curr.isSearchDisplay) || !isSearching;
    curr.keyPath = keyPath;

    // the leaves
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

      const parentMaxLeaves = parentNode.maxLeaves || this.props.maxLeaves;
      if (shouldDisplay && parentMaxLeaves > relativeIndex) {
        if (curr.customComponent) {
          const componentProps = {
            key: itemKey,
            onMouseDown: (e) => {
              if (this.props.onLeafMouseDown) {
                this.props.onLeafMouseDown(e, curr);
              }
            },
            onMouseUp: (e) => {
              if (this.props.onLeafMouseUp) {
                this.props.onLeafMouseUp(e, curr);
              }
            },
            onClick: (e) => {
              if (this.props.onLeafMouseClick) {
                this.props.onLeafMouseClick(e, curr);
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
              onMouseDown={(e) => (this.props.onLeafMouseDown ? this.props.onLeafMouseDown(e, curr) : null)}
              onMouseUp={(e) => (this.props.onLeafMouseUp ? this.props.onLeafMouseUp(e, curr) : null)}
              onClick={(e) => (this.props.onLeafMouseClick ? this.props.onLeafMouseClick(e, curr) : null)}
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
            onClick={(e) => this.onLoadMoreClick(tree, curr, keyPath, e)}
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
            onClick: (e) => this.onNodeClick(tree, curr, keyPath, e),
            name: nodeName,
            isOpen: curr.isOpen,
            isSearching: false,
            data: curr,
            key,
          };
          prevs.push(React.createElement(currCustomComponent, nodeProps));
        } else {
          prevs.push(
            <div
              key={key}
              onClick={(e) => this.onNodeClick(tree, curr, keyPath, e)}
              className={classnames('infinity-menu-node-container', {
                opened: !!curr.isOpen,
              })}
            >
              <label>
                {nodeName} <ClassificationLink id={curr.id} />
              </label>
            </div>,
          );
        }
      }
      return prevs;
    }
    const openedNode = [];
    if (shouldDisplay) {
      if (curr.customComponent) {
        const nodeProps = {
          onClick: (e) => this.onNodeClick(tree, curr, keyPath, e),
          name: nodeName,
          isOpen: curr.isOpen,
          data: curr,
          key,
          isSearching,
        };
        openedNode.push(React.createElement(currCustomComponent, nodeProps));
      } else {
        openedNode.push(
          <div
            key={key}
            onClick={(e) => this.onNodeClick(tree, curr, keyPath, e)}
            className={classnames('infinity-menu-node-container', {
              opened: !!curr.isOpen,
            })}
          >
            <label>
              {nodeName} <ClassificationLink id={curr.id} />
            </label>
          </div>,
        );
      }

      const childrenList = curr.children.length
        ? curr.children.reduce((p, c, k) => {
            if (c === undefined || k === undefined) {
              return p;
            }
            return this.setDisplayTree(tree, p, c, `${keyPath}.children.${k}`);
          }, [])
        : [];

      if (childrenList.length > 0) {
        openedNode.push(<ul key={`infinity-menu-children-list${currLevel}`}>{childrenList}</ul>);
      }
      prevs.push(openedNode);
    }
    return prevs;
  }

  createSnapshots(tree) {
    const snapshots = tree.reduce((prev, curr, key) => {
      if (key === undefined) {
        return prev;
      }
      return this.findSnapshot(prev, curr);
    }, {});
    this.setState({ snapshots });
  }

  findSnapshot(snapshots, node) {
    if (!node.children) {
      snapshots[node.id] = Defiant.getSnapshot(node);
      return snapshots;
    }
    return node.children.length
      ? node.children.reduce((prev, curr) => this.findSnapshot(prev, curr), snapshots)
      : snapshots;
  }

  filterTree(searchInputs, tree, isDetailSearch) {
    const filters = isDetailSearch ? this.getDetailFilters(searchInputs) : searchInputs[0];
    const filteredTree = filters
      ? tree.reduce((prev, curr, key) => {
          if (key === undefined) {
            return prev;
          }
          return this.findFiltered(prev, curr, key, filters);
        }, [])
      : tree;
    this.setState({ filteredTree });
  }

  findFiltered(trees, node, key, filters) {
    const newNode = cloneDeep(node);
    if (!node.children) {
      let nodeMatchesSearchFilter = true;
      if (filters.length) {
        if (this.props.isDetailSearch) {
          const snapshot = this.state.snapshots[node.id] ? this.state.snapshots[node.id] : null;
          const result = snapshot ? JSON.search(snapshot, filters) : [];
          nodeMatchesSearchFilter = result.length > 0;
        } else {
          nodeMatchesSearchFilter = this.props.filter(node, filters);
        }
      }
      if (nodeMatchesSearchFilter) {
        newNode.isSearchDisplay = true;
        trees.push(newNode);
      }
      return trees;
    }
    const filteredSubFolder = node.children.length
      ? node.children.reduce((p, c, k) => this.findFiltered(p, c, k, filters), [])
      : [];

    const shouldDisplay = filteredSubFolder.some((child) => child.isSearchDisplay) || this.props.filter(node, filters);

    if (shouldDisplay) {
      newNode.isSearchOpen = true;
      newNode.children = filteredSubFolder;
      newNode.isSearchDisplay = true;
      newNode.maxLeaves = newNode.maxLeaves ? newNode.maxLeaves : this.props.maxLeaves;
      trees.push(newNode);
    }
    return trees;
  }

  formatDetailFilter(field, value) {
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
  }

  renderSearchInputs() {
    const { isDetailSearch, searchInputs } = this.props;
    const searchInputProps = {
      ...this.props.headerProps,
      placeholder: 'Etsi...',
    };
    return searchInputs.map((input, index) => (
      <div
        key={index}
        className={classnames({
          'col-xs-12 filters filters-detail-search-input': isDetailSearch,
          'col-sm-6': !isDetailSearch,
        })}
      >
        <SearchInput
          {...searchInputProps}
          searchInput={input}
          setSearchInput={(event) => this.props.setSearchInput(index, event.target.value)}
        />
        {isDetailSearch && (
          <div className='filters-detail-search-input-buttons'>
            {index + 1 < searchInputs.length && (
              <Select
                className='Select'
                autoBlur
                isDisabled={index > 0}
                placeholder='Ehto'
                value={FILTER_CONDITION_OPTIONS.find(({ value }) => value === this.state.filterCondition)}
                isClearable={false}
                options={FILTER_CONDITION_OPTIONS}
                onChange={this.onFilterConditionChange}
              />
            )}
            <button
              type='button'
              className='btn btn-info btn-sm'
              onClick={() => this.props.removeSearchInput(index)}
              title='Poista hakuehto'
            >
              <span className='fa-solid fa-minus' aria-hidden='true' />
            </button>
            {index + 1 === searchInputs.length && (
              <button
                type='button'
                className='btn btn-info btn-sm'
                onClick={this.props.addSearchInput}
                title='Lisää hakuehto'
              >
                <span className='fa-solid fa-plus' aria-hidden='true' />
              </button>
            )}
          </div>
        )}
      </div>
    ));
  }

  renderBody(displayTree) {
    const { emptyTreeComponent, emptyTreeComponentProps, isFetching } = this.props;

    if (displayTree.length) {
      return displayTree;
    }
    if (emptyTreeComponent && !isFetching) {
      return React.createElement(emptyTreeComponent, emptyTreeComponentProps);
    }
    return null;
  }

  render() {
    const { isDetailSearch } = this.props;
    const { filteredTree } = this.state;

    // recursive go through the tree
    const displayTree = filteredTree.reduce((prev, curr, key) => {
      if (key === undefined) {
        return prev;
      }
      return this.setDisplayTree(filteredTree, prev, curr, key.toString());
    }, []);

    // header component
    const searchInputContent = this.renderSearchInputs();
    const bodyContent = this.renderBody(displayTree);

    return (
      <div
        id='navigation-menu'
        className={classnames('navigation-menu', {
          'navigation-open': this.props.isOpen,
        })}
      >
        <Sticky stickyClassName='navigation-sticky'>
          <>
            <div className='navigation-header clearfix'>
              <button type='button' className='pull-left nav-button' onClick={this.props.toggleNavigationVisibility}>
                <span className='fa-solid fa-list' aria-hidden='true' />
              </button>
              {!!this.props.path.length && (
                <ol className='breadcrumb' onClick={this.props.toggleNavigationVisibility}>
                  {this.props.path.map((item, index) => (
                    <li
                      className={classnames({
                        active: index === this.props.path.length,
                      })}
                      key={index}
                    >
                      {item}
                    </li>
                  ))}
                </ol>
              )}
            </div>
            {this.props.isOpen && (
              <div className='navigation-container'>
                <div className='navigation-toggle'>
                  <button type='button' className='nav-button' onClick={this.props.toggleNavigationVisibility}>
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
                            attributeTypes={this.props.attributeTypes}
                            data={filteredTree}
                            isVisible={filteredTree.length > 0}
                          />
                        </div>
                      </div>
                    )}
                    <div className='row'>
                      {searchInputContent}
                      <div
                        className={classnames({
                          'col-xs-12': isDetailSearch,
                          'col-sm-6': !isDetailSearch,
                        })}
                      >
                        {this.props.filters}
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
  }
}

InfinityMenu.propTypes = {
  addSearchInput: PropTypes.func.isRequired,
  attributeTypes: PropTypes.object,
  customComponentMappings: PropTypes.object,
  emptyTreeComponent: PropTypes.any,
  emptyTreeComponentProps: PropTypes.object,
  filter: PropTypes.func,
  filters: PropTypes.object,
  headerProps: PropTypes.object,
  isDetailSearch: PropTypes.bool,
  isFetching: PropTypes.bool,
  isOpen: PropTypes.bool,
  isSearchChanged: PropTypes.bool,
  isSearching: PropTypes.bool,
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
};

InfinityMenu.defaultProps = {
  disableDefaultHeaderContent: false,
  emptyTreeComponent: EmptyTree,
  emptyTreeComponentProps: {},
  filter: (node, searchInput) => node.name.toLowerCase().indexOf(searchInput.toLowerCase()) >= 0,
  headerContent: null,
  headerProps: {},
  maxLeaves: Infinity,
  onLeafMouseClick: () => {},
  onLeafMouseDown: () => {},
  onLeafMouseUp: () => {},
  onNodeMouseClick: () => {},
  tree: [],
};

export default InfinityMenu;
