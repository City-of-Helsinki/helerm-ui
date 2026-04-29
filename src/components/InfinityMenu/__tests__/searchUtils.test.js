import { describe, expect, it } from 'vitest';

import { matchesFilters, parseDetailFilters, parseFilter, parseSearchInput } from '../searchUtils';

describe('parseFilter', () => {
  it('returns null when value is empty after removing wildcards', () => {
    expect(parseFilter('field', '*')).toBeNull();
    expect(parseFilter('field', '')).toBeNull();
    expect(parseFilter('.', '**')).toBeNull();
  });

  it('returns contains filter when wildcard is at start', () => {
    expect(parseFilter('field', '*value')).toEqual({ type: 'contains', field: 'field', value: 'value' });
  });

  it('returns starts-with filter when wildcard is after first character', () => {
    expect(parseFilter('field', 'value*')).toEqual({ type: 'starts-with', field: 'field', value: 'value' });
  });

  it('returns exact filter when there is no wildcard', () => {
    expect(parseFilter('field', 'value')).toEqual({ type: 'exact', field: 'field', value: 'value' });
  });

  it('strips all wildcards from the value', () => {
    expect(parseFilter('field', 'v*alue*')).toEqual({ type: 'starts-with', field: 'field', value: 'value' });
  });

  it('preserves the field name', () => {
    expect(parseFilter('.', '*anything')).toEqual({ type: 'contains', field: '.', value: 'anything' });
  });
});

describe('parseSearchInput', () => {
  it('returns null for empty input', () => {
    expect(parseSearchInput('')).toBeNull();
  });

  it('parses field=value as exact filter on named field', () => {
    expect(parseSearchInput('InformationSystem=ahjo')).toEqual({
      type: 'exact',
      field: 'InformationSystem',
      value: 'ahjo',
    });
  });

  it('parses field=*value as contains filter on named field', () => {
    expect(parseSearchInput('InformationSystem=*ahjo')).toEqual({
      type: 'contains',
      field: 'InformationSystem',
      value: 'ahjo',
    });
  });

  it('parses field=value* as starts-with filter on named field', () => {
    expect(parseSearchInput('InformationSystem=ahjo*')).toEqual({
      type: 'starts-with',
      field: 'InformationSystem',
      value: 'ahjo',
    });
  });

  it('parses bare value as contains filter on any field (".")', () => {
    expect(parseSearchInput('ahjo')).toEqual({ type: 'contains', field: '.', value: 'ahjo' });
  });

  it('parses *value as contains filter on any field', () => {
    expect(parseSearchInput('*ahjo')).toEqual({ type: 'contains', field: '.', value: 'ahjo' });
  });

  it('trims whitespace around field and value', () => {
    expect(parseSearchInput('  field  =  value  ')).toEqual({ type: 'exact', field: 'field', value: 'value' });
  });

  it('returns null when value part is only wildcards', () => {
    expect(parseSearchInput('field=*')).toBeNull();
  });
});

describe('matchesFilters', () => {
  const node = {
    id: '1',
    name: 'Ahjo documents',
    attributes: {
      InformationSystem: 'Ahjo',
      RetentionPeriod: '10 years',
    },
  };

  it('returns true when filters array is empty', () => {
    expect(matchesFilters(node, [])).toBe(true);
  });

  it('matches exact value on a top-level property', () => {
    const filter = { type: 'exact', field: 'name', value: 'ahjo documents' };
    expect(matchesFilters(node, [filter])).toBe(true);
  });

  it('does not match exact value that differs in content', () => {
    const filter = { type: 'exact', field: 'name', value: 'other' };
    expect(matchesFilters(node, [filter])).toBe(false);
  });

  it('matches contains on a nested property', () => {
    const filter = { type: 'contains', field: 'InformationSystem', value: 'hjo' };
    expect(matchesFilters(node, [filter])).toBe(true);
  });

  it('matches starts-with on a nested property', () => {
    const filter = { type: 'starts-with', field: 'InformationSystem', value: 'ahj' };
    expect(matchesFilters(node, [filter])).toBe(true);
  });

  it('does not match starts-with when value is in the middle', () => {
    const filter = { type: 'starts-with', field: 'InformationSystem', value: 'hjo' };
    expect(matchesFilters(node, [filter])).toBe(false);
  });

  it('matches any field when field is "."', () => {
    const filter = { type: 'contains', field: '.', value: '10' };
    expect(matchesFilters(node, [filter])).toBe(true);
  });

  it('does not match "." field when no property has the value', () => {
    const filter = { type: 'exact', field: '.', value: 'notpresent' };
    expect(matchesFilters(node, [filter])).toBe(false);
  });

  it('AND condition requires all filters to match', () => {
    const filters = [
      { type: 'contains', field: 'InformationSystem', value: 'ahjo' },
      { type: 'contains', field: 'RetentionPeriod', value: 'years' },
    ];
    expect(matchesFilters(node, filters, 'and')).toBe(true);

    const failingFilters = [
      { type: 'contains', field: 'InformationSystem', value: 'ahjo' },
      { type: 'exact', field: 'RetentionPeriod', value: 'nope' },
    ];
    expect(matchesFilters(node, failingFilters, 'and')).toBe(false);
  });

  it('OR condition requires at least one filter to match', () => {
    const filters = [
      { type: 'exact', field: 'InformationSystem', value: 'nope' },
      { type: 'contains', field: 'RetentionPeriod', value: 'years' },
    ];
    expect(matchesFilters(node, filters, 'or')).toBe(true);

    const failingFilters = [
      { type: 'exact', field: 'InformationSystem', value: 'nope' },
      { type: 'exact', field: 'RetentionPeriod', value: 'nope' },
    ];
    expect(matchesFilters(node, failingFilters, 'or')).toBe(false);
  });

  it('is case-insensitive', () => {
    const filter = { type: 'exact', field: 'InformationSystem', value: 'AHJO' };
    expect(matchesFilters(node, [filter])).toBe(true);
  });

  it('does not match unknown field', () => {
    const filter = { type: 'exact', field: 'NonExistent', value: 'value' };
    expect(matchesFilters(node, [filter])).toBe(false);
  });
});

describe('parseDetailFilters', () => {
  it('returns empty array for empty inputs', () => {
    expect(parseDetailFilters([])).toEqual([]);
  });

  it('filters out null results (wildcard-only or empty inputs)', () => {
    expect(parseDetailFilters(['*', ''])).toEqual([]);
  });

  it('parses multiple valid inputs', () => {
    const result = parseDetailFilters(['InformationSystem=*ahjo', 'RetentionPeriod=10*']);
    expect(result).toEqual([
      { type: 'contains', field: 'InformationSystem', value: 'ahjo' },
      { type: 'starts-with', field: 'RetentionPeriod', value: '10' },
    ]);
  });

  it('parses mixed field-specific and any-field inputs', () => {
    const result = parseDetailFilters(['InformationSystem=ahjo', '*doc']);
    expect(result).toEqual([
      { type: 'exact', field: 'InformationSystem', value: 'ahjo' },
      { type: 'contains', field: '.', value: 'doc' },
    ]);
  });
});
