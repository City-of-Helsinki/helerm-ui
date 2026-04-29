/**
 * Parses a field/value pair into a structured filter object.
 *
 * Wildcard rules (matching defiant.js XPath behavior):
 *   '*value'  → contains match   (wildcard at start)
 *   'value*'  → starts-with match (wildcard after first char)
 *   'value'   → exact match
 *
 * @param {string} field - Field name to match against ('.' means any field)
 * @param {string} rawValue - Value string, may contain '*' as wildcard
 * @returns {{ type: 'contains'|'starts-with'|'exact', field: string, value: string } | null}
 */
export function parseFilter(field, rawValue) {
  const wildcardIndex = rawValue.indexOf('*');
  const value = rawValue.replaceAll('*', '');
  if (!value) return null;

  let type;
  if (wildcardIndex === 0) {
    type = 'contains';
  } else if (wildcardIndex > 0) {
    type = 'starts-with';
  } else {
    type = 'exact';
  }

  return { type, field, value };
}

/**
 * Parses a raw search input string into a structured filter object.
 * Input formats: "field=value", "field=*value", "field=value*", "*value", "value", etc.
 *
 * @param {string} input
 * @returns {{ type: 'contains'|'starts-with'|'exact', field: string, value: string } | null}
 */
export function parseSearchInput(input) {
  const eqIndex = input.indexOf('=');
  if (eqIndex > 0) {
    const field = input.slice(0, eqIndex).trim();
    const rawValue = input.slice(eqIndex + 1).trim();
    if (field) {
      // rawValue is empty (e.g. "field=") — invalid query, don't fall through to bare-term logic
      if (!rawValue) return null;
      return parseFilter(field, rawValue);
    }
  }
  const parts = [input.trim()];
  if (parts[0]) {
    // Bare terms (no field=value) default to contains match on all fields,
    // consistent with the normal search behavior on the root page.
    // Explicit wildcards are still honored (*value = contains, value* = starts-with).
    const hasWildcard = parts[0].includes('*');
    if (hasWildcard) {
      return parseFilter('.', parts[0]);
    }
    return { type: 'contains', field: '.', value: parts[0] };
  }
  return null;
}

/**
 * Checks if a string value satisfies a filter's match condition (case-insensitive).
 *
 * @param {string} strValue
 * @param {{ type: string, value: string }} filter
 * @returns {boolean}
 */
function valueMatchesFilter(strValue, filter) {
  const val = String(strValue).toLowerCase();
  const filterVal = filter.value.toLowerCase();

  switch (filter.type) {
    case 'contains':
      return val.includes(filterVal);
    case 'starts-with':
      return val.startsWith(filterVal);
    case 'exact':
      return val === filterVal;
    default:
      return false;
  }
}

/**
 * Recursively checks if an object has a property matching the filter.
 * When filter.field is '.', any string property value is tested.
 *
 * @param {unknown} obj
 * @param {{ type: string, field: string, value: string }} filter
 * @returns {boolean}
 */
function objectMatchesFilter(obj, filter) {
  if (!obj || typeof obj !== 'object') return false;

  for (const [key, val] of Object.entries(obj)) {
    const fieldMatches = filter.field === '.' || key === filter.field;
    if (fieldMatches && typeof val === 'string' && valueMatchesFilter(val, filter)) {
      return true;
    }
    if (typeof val === 'object' && val !== null && objectMatchesFilter(val, filter)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a node matches a set of parsed filters with the given logical condition.
 *
 * @param {object} node - The node to test
 * @param {Array<{ type: string, field: string, value: string }>} filters
 * @param {'and'|'or'} [condition='and'] - Logical operator to combine filters
 * @returns {boolean}
 */
export function matchesFilters(node, filters, condition = 'and') {
  if (!filters.length) return true;
  return condition === 'or'
    ? filters.some((f) => objectMatchesFilter(node, f))
    : filters.every((f) => objectMatchesFilter(node, f));
}

/**
 * Parses multiple search input strings into an array of structured filter objects.
 * Inputs that produce no valid filter (e.g. empty or only wildcards) are excluded.
 *
 * @param {string[]} searchInputs
 * @returns {Array<{ type: string, field: string, value: string }>}
 */
export function parseDetailFilters(searchInputs) {
  return searchInputs.map((input) => parseSearchInput(input)).filter(Boolean);
}
