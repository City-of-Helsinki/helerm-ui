import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { Button, IconInfoCircleFill, IconMinus, IconPlus } from 'hds-react';

import NavigationSearch from './NavigationSearch';
import withRouter from '../hoc/withRouter';
import { APPROVED } from '../../constants';

import './Navigation.scss';

const NavigationItem = ({ item, onItemClick }) => {
  const { children, name, id } = item;
  const itemLabel = name;
  const hasChildren = children && children.length > 0;

  const [expanded, setExpanded] = useState(item.expanded || false);

  useEffect(() => {
    if (item.expanded !== undefined) {
      setExpanded(item.expanded);
    }
  }, [item.expanded]);

  const toggleExpand = (event) => {
    if (hasChildren) {
      event.preventDefault();

      setExpanded(!expanded);
    }
  };

  const handleLeafClick = (event) => {
    if (onItemClick) {
      event.preventDefault();

      onItemClick(item);
    }
  };

  const listItemClass = !hasChildren ? 'helerm-navigation__item--link' : '';

  return (
    <li className={listItemClass}>
      {hasChildren ? (
        <>
          <Button
            className='helerm-navigation__item'
            onClick={toggleExpand}
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${itemLabel}`}
            iconLeft={expanded ? <IconMinus /> : <IconPlus />}
            iconRight={<IconInfoCircleFill />}
            variant='supplementary'
          >
            {itemLabel}
          </Button>
          {expanded && (
            <ul className='helerm-navigation__sub'>
              {children.map((child) => (
                <NavigationItem key={`${child.code}-${child.id}`} item={child} onItemClick={onItemClick} />
              ))}
            </ul>
          )}
        </>
      ) : (
        <a className='helerm-navigation__link' href={`/view-tos/${id}`} onClick={handleLeafClick}>
          {itemLabel} <IconInfoCircleFill className='helerm-navigation__link-icon' />
        </a>
      )}
    </li>
  );
};

NavigationItem.propTypes = {
  item: PropTypes.object.isRequired,
  onItemClick: PropTypes.func,
};

const matchesSearchTerm = (name, searchTerm) => {
  return name && name.toLowerCase().includes(searchTerm);
};

const filterNavigationItems = (items, filterCriteria = {}) => {
  const { searchText, stateValue } = filterCriteria;

  if (!items || !items.length) {
    return [];
  }

  if (!searchText && !stateValue) {
    return items;
  }

  const normalizedSearchText = searchText ? searchText.toLowerCase() : '';

  return items
    .map((item) => {
      const nameMatch = searchText ? matchesSearchTerm(item.name, normalizedSearchText) : false;
      const stateMatch = stateValue ? item.state === stateValue : false;

      const itemMatches = (searchText && nameMatch) || (stateValue && stateMatch);

      const newItem = { ...item };

      if (item.children && item.children.length) {
        newItem.children = filterNavigationItems(item.children, filterCriteria);

        const hasMatchingChildren = newItem.children.length > 0;

        if (hasMatchingChildren) {
          newItem.expanded = true;
        }

        if (itemMatches || hasMatchingChildren) {
          if (itemMatches) {
            newItem.isMatch = true;
          }

          return newItem;
        }
      } else if (itemMatches) {
        newItem.isMatch = true;

        return newItem;
      }

      return null;
    })
    .filter(Boolean);
};

const Navigation = ({ fetchNavigation, isFetching, items, navigate, location, showNavigation }) => {
  const isDetailSearch = location.pathname === '/filter';

  const initialItems = useMemo(() => items, [items]);

  const [filteredItems, setFilteredItems] = useState(initialItems);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [currentStatusFilter, setCurrentStatusFilter] = useState(APPROVED);

  useEffect(() => {
    if (isEmpty(items) && fetchNavigation) {
      fetchNavigation(isDetailSearch);
    }

    if (!isEmpty(items)) {
      setFilteredItems(items);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetailSearch, items]);

  const handleItemClick = (item) => {
    if (navigate && item) {
      if (item.function) {
        navigate(`/view-tos/${item.function}`);
      } else if (item.id) {
        navigate(`/view-tos/${item.id}`);
      }
    }
  };

  const handleSearch = (searchText) => {
    const normalizedSearchText = searchText && searchText.trim() !== '' ? searchText : null;

    setCurrentSearchTerm(normalizedSearchText);

    const filteredResults = filterNavigationItems(initialItems, {
      searchText: normalizedSearchText,
      stateValue: currentStatusFilter,
    });

    setFilteredItems(filteredResults);
  };

  const handleStatusChange = (selected) => {
    const stateValue = selected ? selected.value : APPROVED;

    setCurrentStatusFilter(stateValue);

    const filteredResults = filterNavigationItems(initialItems, {
      searchText: currentSearchTerm,
      stateValue,
    });

    setFilteredItems(filteredResults);
  };

  if (isFetching) {
    return null;
  }

  return (
    <div className='helerm-navigation__container'>
      <div>
        <NavigationSearch handleSearch={handleSearch} handleStatusChange={handleStatusChange} />
      </div>
      {showNavigation && (
        <nav>
          <ul className='helerm-navigation'>
            {filteredItems.map((item) => (
              <NavigationItem key={`${item.code}-${item.id}`} item={item} onItemClick={handleItemClick} />
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};

Navigation.propTypes = {
  attributeTypes: PropTypes.object,
  fetchNavigation: PropTypes.func,
  isFetching: PropTypes.bool,
  isUser: PropTypes.bool,
  is_open: PropTypes.bool,
  items: PropTypes.array,
  itemsTimestamp: PropTypes.string,
  onLeafMouseClick: PropTypes.func,
  navigate: PropTypes.func,
  setNavigationVisibility: PropTypes.func,
  tosPath: PropTypes.array,
  location: PropTypes.object,
  showNavigation: PropTypes.bool,
};

Navigation.defaultProps = {
  items: [],
  isFetching: false,
  isUser: false,
  is_open: true,
  tosPath: [],
  location: { pathname: '/' },
};

export default withRouter(Navigation);
