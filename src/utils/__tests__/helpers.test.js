import { convertToTree, formatDateTime } from '../helpers';

const deepFreeze = (obj) => {
  Object.getOwnPropertyNames(obj).forEach((name) => {
    const value = obj[name];
    if (value && typeof value === 'object') deepFreeze(value);
  });
  return Object.freeze(obj);
};

// Single-use test data - specific to this test file only
const mockNavigationDataShort = [
  {
    id: 'cee34db0de3e47fbb937b74dd87ea759',
    code: '00',
    title: 'Hallintoasiat',
    parent: null,
  },
  {
    id: '7a5967d6a21d412d9c1fcdfebf2d3e19',
    code: '00 00',
    title: 'Hallintoasioiden ohjaus',
    parent: {
      id: 'cee34db0de3e47fbb937b74dd87ea759',
      version: 1,
    },
  },
  {
    id: 'fb61caa7ec9d4332b0737831fd829293',
    code: '00 00 00',
    title: 'Y HALO THAR!',
    parent: {
      id: '7a5967d6a21d412d9c1fcdfebf2d3e19',
      version: 1,
    },
  },
];

const mockNavigationDataFullObjects = [
  {
    id: 'test1',
    code: '01',
    title: 'Test Item 1',
    parent: null,
  },
  {
    id: 'test2',
    code: '01 01',
    title: 'Test Sub Item',
    parent: {
      id: 'test1',
      version: 1,
    },
  },
];

const mockNavigationDataOrphan = [
  {
    id: 'orphan1',
    code: '02',
    title: 'Orphan Item',
    parent: {
      id: 'nonexistent-parent',
      version: 1,
    },
  },
];

const ADMINISTRATIVE_MATTERS = '00 Hallintoasiat';

describe('convertToTree', () => {
  it('Parsing list to tree does not mutate original list', () => {
    const inputList = deepFreeze(mockNavigationDataFullObjects);
    // deepFreeze will throw an error if object is mutated
    convertToTree(inputList);
  });
  it('Parses simple tree', () => {
    const res = convertToTree(mockNavigationDataShort);
    expect(res).toEqual([
      {
        name: ADMINISTRATIVE_MATTERS,
        sort_id: '00',
        path: [],
        parent_id: null,
        id: 'cee34db0de3e47fbb937b74dd87ea759',
        code: '00',
        title: 'Hallintoasiat',
        parent: null,
        children: [
          {
            name: '00 00 Hallintoasioiden ohjaus',
            sort_id: '00',
            path: [ADMINISTRATIVE_MATTERS],
            parent_id: 'cee34db0de3e47fbb937b74dd87ea759',
            id: '7a5967d6a21d412d9c1fcdfebf2d3e19',
            code: '00 00',
            title: 'Hallintoasioiden ohjaus',
            parent: {
              id: 'cee34db0de3e47fbb937b74dd87ea759',
              version: 1,
            },
            children: [
              {
                name: '00 00 00 Y HALO THAR!',
                sort_id: '00',
                path: [ADMINISTRATIVE_MATTERS, '00 00 Hallintoasioiden ohjaus'],
                parent_id: '7a5967d6a21d412d9c1fcdfebf2d3e19',
                id: 'fb61caa7ec9d4332b0737831fd829293',
                title: 'Y HALO THAR!',
                code: '00 00 00',
                parent: {
                  id: '7a5967d6a21d412d9c1fcdfebf2d3e19',
                  version: 1,
                },
              },
            ],
          },
        ],
      },
    ]);
  });
  it('Throws descriptive error when tree is broken', () => {
    expect(() => convertToTree(mockNavigationDataOrphan)).toThrow(/^Parent with id .* not found$/);
  });
});

describe('formatDateTime', () => {
  // Use a date-only string to avoid timezone ambiguity in assertions
  const isoDateOnly = '2024-06-01';
  const isoDateOnlyShort = '2024-03-05'; // day=5, month=3 for testing non-padded formats

  it('returns empty string for falsy input', () => {
    expect(formatDateTime()).toBe('');
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime('')).toBe('');
  });

  it('returns empty string for invalid date input', () => {
    expect(formatDateTime('not-a-date')).toBe('');
    expect(formatDateTime(new Date('invalid-date'))).toBe('');
  });

  it('formats with default format (dd.MM.yyyy HH:mm)', () => {
    const result = formatDateTime('2024-06-01T14:05:00.000Z');
    expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
  });

  it('formats date-only string with dd.MM.yyyy', () => {
    const result = formatDateTime(isoDateOnly, 'dd.MM.yyyy');
    expect(result).toBe('01.06.2024');
  });

  it('formats date-only string with yyyy-MM-dd (used by Conversion and VersionData)', () => {
    const result = formatDateTime(isoDateOnly, 'yyyy-MM-dd');
    expect(result).toBe('2024-06-01');
  });

  it('formats with d.M.yyyy short format (used by VersionData)', () => {
    const result = formatDateTime(isoDateOnlyShort, 'd.M.yyyy');
    expect(result).toBe('5.3.2024');
  });

  it('accepts a Date object as input', () => {
    const date = new Date(2024, 5, 1); // June 1 2024 local time
    const result = formatDateTime(date, 'yyyy-MM-dd');
    expect(result).toBe('2024-06-01');
  });
});
