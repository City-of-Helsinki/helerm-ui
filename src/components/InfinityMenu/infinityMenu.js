import _get from 'lodash/get';
import Select from 'react-select';
import classnames from 'classnames';
import { Link } from 'react-router';
import NestedObjects from 'nested-objects';
import React, { Component, PropTypes } from 'react';

import SearchInput from './searchInput';
import ClassificationLink from './classificationLink';
import Exporter from '../Exporter';

/**
 * Extracted from https://github.com/socialtables/react-infinity-menu
 */
export default class InfinityMenu extends Component {

  static propTypes = {
    customComponentMappings: PropTypes.object,
    emptyTreeComponent: PropTypes.any,
    emptyTreeComponentProps: PropTypes.object,
    filter: PropTypes.func,
    filterStatuses: PropTypes.array,
    handleStatusFilterChange: PropTypes.func,
    headerProps: PropTypes.object,
    isOpen: PropTypes.bool,
    isSearching: PropTypes.bool,
    isUser: PropTypes.bool,
    loadMoreComponent: PropTypes.func,
    maxLeaves: PropTypes.number,
    onLeafMouseClick: PropTypes.func,
    onLeafMouseDown: PropTypes.func,
    onLeafMouseUp: PropTypes.func,
    onNodeMouseClick: PropTypes.func,
    path: PropTypes.array,
    searchInput: PropTypes.string.isRequired,
    setSearchInput: PropTypes.func.isRequired,
    statusValue: PropTypes.array,
    toggleNavigationVisibility: PropTypes.func,
    tree: PropTypes.array
  };

  static defaultProps = {
    disableDefaultHeaderContent: false,
    emptyTreeComponent: null,
    emptyTreeComponentProps: {},
    filter: (node, searchInput) => node.name.toLowerCase().indexOf(searchInput.toLowerCase()) >= 0,
    headerContent: null,
    headerProps: {},
    maxLeaves: Infinity,
    onLeafMouseClick: () => {},
    onLeafMouseDown: () => {},
    onLeafMouseUp: () => {},
    onNodeMouseClick: () => {},
    tree: []
  };

  constructor (props) {
    super(props);

    this.onNodeClick = this.onNodeClick.bind(this);
    this.onLoadMoreClick = this.onLoadMoreClick.bind(this);
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.shouldComponentUpdate) {
      return nextProps.shouldComponentUpdate(this.props, this.state, nextProps, nextState);
    } else {
      return true;
    }
  }

  onNodeClick (tree, node, keyPath, event) {
    event.preventDefault();
    if (!this.props.isSearching || !this.props.searchInput.length) {
      node.isOpen = !node.isOpen;
      node.maxLeaves = this.props.maxLeaves;
      NestedObjects.set(tree, keyPath, node);
      if (this.props.onNodeMouseClick) {
        const currLevel = Math.floor(keyPath.split('.').length / 2);
        this.props.onNodeMouseClick(event, tree, node, currLevel, keyPath);
      }
    }
  }

  onLoadMoreClick (tree, node, keyPath, event) {
    event.preventDefault();
    // get parent node so we can increment it's unique max leaves property
    const keyPathArray = keyPath.split('.');
    const parentPath = Object.assign([], keyPathArray).splice(0, keyPathArray.length - 2);
    const parentNode = _get(this.props.tree, parentPath);
    // set new max leaves - if none exist use component default property
    parentNode.maxLeaves = (!parentNode.maxLeaves) ? this.props.maxLeaves : parentNode.maxLeaves + this.props.maxLeaves;
    if (this.props.onNodeMouseClick) {
      const currLevel = Math.floor(keyPath.split('.').length / 2);
      this.props.onNodeMouseClick(event, tree, node, currLevel, keyPath);
    }
  }

  findFiltered (trees, node, key) {
    if (!node.children) {
      const nodeMatchesSearchFilter = this.props.filter(node, this.props.searchInput);
      if (nodeMatchesSearchFilter) {
        node.isSearchDisplay = true;
        trees[key] = node;
        return trees;
      } else {
        node.isSearchDisplay = false;
        trees[key] = node;
        return trees;
      }
    } else {
      const filteredSubFolder = node.children.length ? node.children.reduce((p, c, k) => {
        return this.findFiltered(p, c, k);
      }, []) : [];
      const shouldDisplay = filteredSubFolder.some(child => child.isSearchDisplay);

      if (shouldDisplay) {
        node.isSearchOpen = true;
        node.children = filteredSubFolder;
        node.isSearchDisplay = true;
        node.maxLeaves = (node.maxLeaves) ? node.maxLeaves : this.props.maxLeaves;
        trees[key] = node;
        return trees;
      } else {
        node.isSearchOpen = false;
        node.isSearchDisplay = false;
        trees[key] = node;
        return trees;
      }
    }
  }

  setDisplayTree (tree, prevs, curr, keyPath) {
    const currLevel = Math.floor(keyPath.length / 2);
    const currCustomComponent = typeof curr.customComponent === 'string' ? this.props.customComponentMappings[curr.customComponent] : curr.customComponent;
    const currCustomloadMoreComponent = (this.props.loadMoreComponent) ? this.props.loadMoreComponent : null;
    const isSearching = this.props.isSearching && this.props.searchInput;
    const shouldDisplay = (isSearching && curr.isSearchDisplay) || !isSearching;
    curr.keyPath = keyPath;

    // the leaves
    if (!curr.children) {
      const keyPathArray = keyPath.split('.');
      const parentPath = Object.assign([], keyPathArray).splice(0, keyPathArray.length - 2);
      const parentNode = _get(this.props.tree, parentPath);
      const filteredChildren = (
        parentNode.children.some(child => child.isSearchDisplay === true)
          ? parentNode.children.filter(child => child.isSearchDisplay === true)
          : parentNode.children
      );
      const itemKey = 'infinity-menu-leaf-' + curr.id;
      const visIds = filteredChildren.map((e) => e.id);

      let relativeIndex = visIds.indexOf(curr.id);
      relativeIndex = (relativeIndex === -1) ? Infinity : relativeIndex;

      let parentMaxLeaves = parentNode.maxLeaves || this.props.maxLeaves;
      if (shouldDisplay && parentMaxLeaves > relativeIndex) {
        if (curr.customComponent) {
          const componentProps = {
            key: itemKey,
            onMouseDown: (e) => {
              this.props.onLeafMouseDown ? this.props.onLeafMouseDown(e, curr) : null;
            },
            onMouseUp: (e) => {
              this.props.onLeafMouseUp ? this.props.onLeafMouseUp(e, curr) : null;
            },
            onClick: (e) => {
              this.props.onLeafMouseClick ? this.props.onLeafMouseClick(e, curr) : null;
            },
            name: curr.name,
            icon: curr.icon,
            data: curr
          };
          prevs.push(React.createElement(currCustomComponent, componentProps));
        } else {
          prevs.push(
            <li key={itemKey}
                className={'infinity-menu-leaf-container' + (!curr.function ? ' new-leaf' : '')}
                onMouseDown={(e) => this.props.onLeafMouseDown ? this.props.onLeafMouseDown(e, curr) : null}
                onMouseUp={(e) => this.props.onLeafMouseUp ? this.props.onLeafMouseUp(e, curr) : null}
                onClick={(e) => this.props.onLeafMouseClick ? this.props.onLeafMouseClick(e, curr) : null}
            >
              <span>
                {curr.name}{' '}
                <ClassificationLink id={curr.id}/>
              </span>
            </li>
          );
        }
      } else {
        if (relativeIndex === filteredChildren.length - 1) {
          if (currCustomloadMoreComponent) {
            const loadMoreProps = {
              key: itemKey,
              onClick: (e) => this.onLoadMoreClick(tree, curr, keyPath, e)
            };
            prevs.push(React.createElement(currCustomloadMoreComponent, loadMoreProps));
          } else {
            prevs.push(
              <li key={itemKey}
                  className='infinity-menu-load-more-container'
                  onClick={(e) => this.onLoadMoreClick(tree, curr, keyPath, e)}
              >
                <span>Load more</span>
              </li>
            );
          }
        }
      }
      return prevs;
    } else {
      const key = 'infinity-menu-node-' + currLevel + '-' + curr.id;
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
              key
            };
            prevs.push(React.createElement(currCustomComponent, nodeProps));
          } else {
            prevs.push(
              <div key={key}
                   onClick={(e) => this.onNodeClick(tree, curr, keyPath, e)}
                   className='infinity-menu-node-container'
              >
                <label>
                  {nodeName}{' '}
                  <ClassificationLink id={curr.id} />
                </label>
              </div>
            );
          }
        }
        return prevs;
      } else {
        let openedNode = [];
        if (shouldDisplay) {
          if (curr.customComponent) {
            const nodeProps = {
              onClick: (e) => this.onNodeClick(tree, curr, keyPath, e),
              name: nodeName,
              isOpen: curr.isOpen,
              data: curr,
              key,
              isSearching
            };
            openedNode.push(React.createElement(currCustomComponent, nodeProps));
          } else {
            openedNode.push(
              <div key={key}
                   onClick={(e) => this.onNodeClick(tree, curr, keyPath, e)}
                   className='infinity-menu-node-container'
              >
                <label>{nodeName}{' '}
                  <ClassificationLink id={curr.id} />
                </label>
              </div>
            );
          }

          const childrenList = curr.children.length ? curr.children.reduce((p, c, k) => {
            if (c === undefined || k === undefined) {
              return p;
            }
            return this.setDisplayTree(tree, p, c, keyPath + '.children.' + k);
          }, []) : [];

          if (childrenList.length > 0) {
            openedNode.push(
              <ul key={'infinity-menu-children-list' + currLevel}>
                {childrenList}
              </ul>
            );
          }
          prevs.push(openedNode);
        }
        return prevs;
      }
    }
  }

  renderBody (displayTree) {
    const {
      emptyTreeComponent,
      emptyTreeComponentProps
    } = this.props;

    if (displayTree.length) {
      return displayTree;
    } else if (emptyTreeComponent) {
      return React.createElement(emptyTreeComponent, emptyTreeComponentProps);
    } else {
      return null;
    }
  }

  render () {
    const tree = this.props.tree;
    // find filtered folders base on search, if there no search, return all
    const filteredTree = this.props.isSearching && this.props.searchInput ? tree.reduce((prev, curr, key) => {
      if (key === undefined) {
        return prev;
      }
      return this.findFiltered(prev, curr, key);
    }, []) : tree;

    // recursive go through the tree
    const displayTree = filteredTree.reduce((prev, curr, key) => {
      if (key === undefined) {
        return prev;
      }
      return this.setDisplayTree(tree, prev, curr, key.toString());
    }, []);

    // header component
    const searchInputProps = {
      ...this.props.headerProps,
      placeholder: 'Etsi...',
      searchInput: this.props.searchInput,
      setSearchInput: this.props.setSearchInput
    };

    const bodyContent = this.renderBody(displayTree);

    const stateFilterText = this.props.isUser ? 'Suodata viimeisen tilan mukaan...' : 'Suodata tilan mukaan...';

    return (
      <div className={classnames('navigation-menu', { 'navigation-open': this.props.isOpen })}>
        {!!this.props.path.length &&
        <div className='navigation-header clearfix'>
          <ol className='breadcrumb' onClick={this.props.toggleNavigationVisibility}>
            {this.props.path.map((item, index) => (
              <li className={classnames({ 'active': index === this.props.path.length })}
                  key={index}>{item}</li>
            ))}
          </ol>
          <button className='btn btn-default btn-sm pull-right nav-button'
                  onClick={this.props.toggleNavigationVisibility}>
            <span className={'fa ' + (this.props.isOpen ? 'fa-minus' : 'fa-plus')}
                  aria-hidden='true'
            />
          </button>
        </div>
        }

        {this.props.isOpen &&
        <div className='navigation-filters clearfix'>
          <div className='navigation-filters-container'>
            <div className='row'>

              <div className='col-sm-6'>
                <SearchInput {...searchInputProps}/>
              </div>

              <div className='col-sm-6'>
                <Select
                  autoBlur={true}
                  placeholder={stateFilterText}
                  value={this.props.statusValue}
                  multi={true}
                  joinValues={true}
                  clearable={false}
                  resetValue={this.props.filterStatuses}
                  options={this.props.filterStatuses}
                  onChange={this.props.handleStatusFilterChange}
                />
              </div>

              <div className='col-xs-12'>
                <Exporter data={filteredTree} />
              </div>
            </div>
          </div>

          <Link
            className='btn btn-default btn-sm nav-button pull-right'
            to='/classification-tree'
          >
            <span className='fa fa-info' aria-hidden='true' />
          </Link>

        </div>
        }
        <div className='infinity-menu-container'>
          {this.props.isOpen &&
          <div className='infinity-menu-display-tree-container'>
            {bodyContent}
          </div>
          }
        </div>
      </div>
    );
  }
};
