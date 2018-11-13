import _get from 'lodash/get';
import classnames from 'classnames';
import { Link } from 'react-router';
import NestedObjects from 'nested-objects';
import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import Defiant from 'defiant';

import SearchInput from './searchInput';
import ClassificationLink from './classificationLink';
import EmptyTree from './EmptyTree';
import Exporter from '../Exporter';

const DEFAULT_FILTER_CONDITION = 'and';
const FILTER_CONDITION_OPTIONS = [{ value: 'and', label: 'JA' }, { value: 'or', label: 'TAI' }];

/**
 * Extracted from https://github.com/socialtables/react-infinity-menu
 */
export default class InfinityMenu extends Component {

  static propTypes = {
    addSearchInput: PropTypes.func.isRequired,
    attributeTypes: PropTypes.object,
    customComponentMappings: PropTypes.object,
    displayExporter: PropTypes.bool,
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
    loadMoreComponent: PropTypes.func,
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
    tree: PropTypes.array
  };

  static defaultProps = {
    disableDefaultHeaderContent: false,
    displayExporter: false,
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
    tree: []
  };

  constructor (props) {
    super(props);
    this.state = {
      filteredTree: [],
      snapshots: {},
      filterCondition: DEFAULT_FILTER_CONDITION
    };

    this.onNodeClick = this.onNodeClick.bind(this);
    this.onLoadMoreClick = this.onLoadMoreClick.bind(this);
    this.onFilterConditionChange = this.onFilterConditionChange.bind(this);
  }

  componentWillReceiveProps (nextProps) {
    const { isDetailSearch, isSearchChanged, searchInputs, tree } = nextProps;
    const { isSearchChanged: wasSearchChanged, searchInputs: prevInputs } = this.props;
    if (tree !== this.props.tree) {
      this.setState({ filteredTree: tree });
      if (isDetailSearch) {
        this.createSnapshots(tree);
      }
    } else if ((isDetailSearch && isSearchChanged && !wasSearchChanged) || (!isDetailSearch && searchInputs !== prevInputs)) {
      this.filterTree(searchInputs, tree, isDetailSearch);
    }
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

  createSnapshots (tree) {
    const snapshots = tree.reduce((prev, curr, key) => {
      if (key === undefined) {
        return prev;
      }
      return this.findSnapshot(prev, curr);
    }, {});
    this.setState({ snapshots });
  }

  findSnapshot (snapshots, node) {
    if (!node.children) {
      snapshots[node.id] = Defiant.getSnapshot(node);
      return snapshots;
    } else {
      return node.children.length ? node.children.reduce((prev, curr) => {
        return this.findSnapshot(prev, curr);
      }, snapshots) : snapshots;
    }
  }

  onFilterConditionChange (option) {
    this.setState(
      { filterCondition: option.value },
      () => this.filterTree(this.props.searchInputs, this.props.tree, this.props.isDetailSearch)
      );
  }

  filterTree (searchInputs, tree, isDetailSearch) {
    const filters = isDetailSearch ? this.getDetailFilters(searchInputs) : searchInputs[0];
    const filteredTree = filters ? tree.reduce((prev, curr, key) => {
      if (key === undefined) {
        return prev;
      }
      return this.findFiltered(prev, curr, key, filters);
    }, []) : tree;
    this.setState({ filteredTree });
  }

  getDetailFilters (searchInputs) {
    const filters = [];
    const { filterCondition } = this.state;
    searchInputs.forEach(input => {
      const splitted = input.split('=').map(m => m.trim());
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

  formatDetailFilter (field, value) {
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
    } else if (wildcardIndex > 0) {
      return `starts-with(${field}, "${fieldValue}")`;
    }
    return `${field}="${fieldValue}"`;
  }

  findFiltered (trees, node, key, filters) {
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
        return this.findFiltered(p, c, k, filters);
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
    const isSearching = this.props.isSearching;
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

  renderSearchInputs () {
    const { isDetailSearch, searchInputs } = this.props;
    const searchInputProps = {
      ...this.props.headerProps,
      placeholder: 'Etsi...'
    };
    return searchInputs.map((input, index) => (
      <div key={index} className={classnames({ 'col-xs-12 filters filters-detail-search-input': isDetailSearch, 'col-sm-6': !isDetailSearch })}>
        <SearchInput
          {...searchInputProps}
          searchInput={input}
          setSearchInput={(event) => this.props.setSearchInput(index, event.target.value)}
        />
        {isDetailSearch && (
          <div className='filters-detail-search-input-buttons'>
            {index + 1 < searchInputs.length && (
              <Select
                autoBlur={true}
                disabled={index > 0}
                placeholder='Ehto'
                value={this.state.filterCondition}
                joinValues={true}
                clearable={false}
                options={FILTER_CONDITION_OPTIONS}
                onChange={this.onFilterConditionChange}
              />
            )}
            <button className='btn btn-info btn-sm' onClick={() => this.props.removeSearchInput(index)} title='Poista hakuehto'>
              <span className='fa fa-minus' aria-hidden='true' />
            </button>
            {index + 1 === searchInputs.length && (
              <button className='btn btn-info btn-sm' onClick={this.props.addSearchInput} title='Lisää hakuehto'>
                <span className='fa fa-plus' aria-hidden='true' />
              </button>
            )}
          </div>
        )}
      </div>
    ));
  }

  renderBody (displayTree) {
    const {
      emptyTreeComponent,
      emptyTreeComponentProps,
      isFetching
    } = this.props;

    if (displayTree.length) {
      return displayTree;
    } else if (emptyTreeComponent && !isFetching) {
      return React.createElement(emptyTreeComponent, emptyTreeComponentProps);
    } else {
      return null;
    }
  }

  render () {
    const { tree, isDetailSearch, displayExporter } = this.props;
    const { filteredTree } = this.state;

    // recursive go through the tree
    const displayTree = filteredTree.reduce((prev, curr, key) => {
      if (key === undefined) {
        return prev;
      }
      return this.setDisplayTree(tree, prev, curr, key.toString());
    }, []);

    // header component
    const searchInputContent = this.renderSearchInputs();
    const bodyContent = this.renderBody(displayTree);

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
              {isDetailSearch &&
                <div className='col-xs-12'>
                  <h2>
                    Sisältöhaku
                    <Exporter
                      attributeTypes={this.props.attributeTypes}
                      data={tree}
                      className='btn-sm pull-right'
                      isVisible={displayExporter}
                    />
                  </h2>
                </div>
              }
              {searchInputContent}
              <div className={classnames({ 'col-xs-12': isDetailSearch, 'col-sm-6': !isDetailSearch })}>
                {this.props.filters}
              </div>
            </div>
          </div>
          {!isDetailSearch &&
            <Link
              className='btn btn-default btn-sm nav-button pull-right'
              to='/classification-tree'>
              <span className='fa fa-info' aria-hidden='true' />
            </Link>
          }
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
