/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import SearchInput from './SearchInput/SearchInput';
import './infinity-menu.scss';

const InfinityMenu = ({
  tree,
  disableDefaultHeaderContent,
  onNodeMouseClick,
  onLeafMouseClick,
  headerContent,
  customComponent,
  hasSearch = true,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [filteredTree, setFilteredTree] = useState(tree);
  const [timer, setTimer] = useState(null);

  const prevTree = useRef(tree);
  const currentPath = useRef([]);

  useEffect(() => {
    if (tree !== prevTree.current) {
      setFilteredTree(tree);
      prevTree.current = tree;
    }
  }, [tree]);

  const loadChildren = useCallback((parentNode) => {
    if (!parentNode.children) return parentNode;

    return {
      ...parentNode,
      children: parentNode.children.map((child) => ({
        ...child,
        isOpen: false,
      })),
    };
  }, []);

  const findNodeById = useCallback((nodes, id, path = []) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const currentNodePath = [...path, i];

      if (node.id === id) {
        return { node, path: currentNodePath };
      }

      if (node.children) {
        const result = findNodeById(node.children, id, currentNodePath);
        if (result) return result;
      }
    }
    return null;
  }, []);

  // eslint-disable-next-line sonarjs/no-invariant-returns
  const updateTreeNode = useCallback((tree, path, updatedNode) => {
    const newTree = [...tree];
    let current = newTree;

    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) return newTree;
      current = current[path[i]].children;
    }

    const lastIndex = path[path.length - 1];
    if (current && current[lastIndex]) {
      current[lastIndex] = updatedNode;
    }

    return newTree;
  }, []);

  const handleNodeClick = useCallback(
    (event, node) => {
      event.preventDefault();
      event.stopPropagation();

      if (!node) return;

      const result = findNodeById(filteredTree, node.id);
      if (!result) return;

      const { node: foundNode, path } = result;
      currentPath.current = path;

      const updatedNode = {
        ...foundNode,
        isOpen: !foundNode.isOpen,
      };

      if (updatedNode.isOpen && !updatedNode.childrenLoaded) {
        const nodeWithChildren = loadChildren(updatedNode);
        updatedNode.children = nodeWithChildren.children;
        updatedNode.childrenLoaded = true;
      }

      const newTree = updateTreeNode(filteredTree, path, updatedNode);
      setFilteredTree(newTree);

      if (onNodeMouseClick) {
        onNodeMouseClick(event, newTree);
      }
    },
    [filteredTree, onNodeMouseClick, loadChildren, findNodeById, updateTreeNode],
  );

  const handleLeafClick = useCallback(
    (event, leaf) => {
      if (onLeafMouseClick) {
        onLeafMouseClick(event, leaf);
      }
    },
    [onLeafMouseClick],
  );

  const filterTree = useCallback(
    (searchValue) => {
      if (!searchValue) {
        setFilteredTree(tree);
        return;
      }

      const searchPattern = searchValue.toLowerCase();

      const filterNodes = (nodes) => {
        return nodes.reduce((filtered, node) => {
          const nodeMatch = node.name?.toLowerCase().includes(searchPattern);

          let children = [];
          if (node.children) {
            children = filterNodes(node.children);
          }

          if (nodeMatch || children.length > 0) {
            filtered.push({
              ...node,
              isOpen: children.length > 0,
              children: children.length > 0 ? children : node.children,
            });
          }

          return filtered;
        }, []);
      };

      const filteredNodes = filterNodes(tree);
      setFilteredTree(filteredNodes);
    },
    [tree],
  );

  const handleSearchChange = useCallback(
    (event) => {
      const { value } = event.target;
      setSearchInput(value);

      if (timer) {
        clearTimeout(timer);
      }

      const newTimer = setTimeout(() => {
        filterTree(value);
      }, 300);

      setTimer(newTimer);
    },
    [filterTree, timer],
  );

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  const renderItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const indent = level * 20;

    return (
      <div
        key={item.id}
        className={`infinity-menu-node-container ${item.isOpen ? 'open' : ''}`}
        style={{ paddingLeft: `${indent}px` }}
      >
        <button
          type='button'
          className={`infinity-menu-node ${hasChildren ? 'has-children' : ''}`}
          onClick={(e) => (hasChildren ? handleNodeClick(e, item) : handleLeafClick(e, item))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              hasChildren ? handleNodeClick(e, item) : handleLeafClick(e, item);
            }
          }}
          aria-expanded={hasChildren ? item.isOpen : undefined}
          aria-label={item.name}
        >
          {customComponent ? (
            React.createElement(customComponent, { item })
          ) : (
            <span className='infinity-menu-node-text'>{item.name}</span>
          )}
        </button>
        {hasChildren && item.isOpen && (
          <div className='infinity-menu-children'>{item.children.map((child) => renderItem(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className='infinity-menu'>
      {!disableDefaultHeaderContent && (
        <div className='infinity-menu-header'>
          {headerContent}
          {hasSearch && <SearchInput value={searchInput} onChange={handleSearchChange} placeholder='Search...' />}
        </div>
      )}
      <div className='infinity-menu-container'>{filteredTree.map((item) => renderItem(item))}</div>
    </div>
  );
};

InfinityMenu.propTypes = {
  tree: PropTypes.array.isRequired,
  disableDefaultHeaderContent: PropTypes.bool,
  onNodeMouseClick: PropTypes.func,
  onLeafMouseClick: PropTypes.func,
  headerContent: PropTypes.node,
  customComponent: PropTypes.elementType,
  hasSearch: PropTypes.bool,
};

export default InfinityMenu;
