import deepFreeze from 'deep-freeze';

import { convertToTree } from '../helpers';
import {
  mockNavigationDataShort,
  mockNavigationDataFullObjects,
  mockNavigationDataOrphan
} from "../mocks/navigationMocks";

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
              version: 1
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
                  version: 1
                }
              }
            ]
          }
        ]
      }
    ]);
  });
  it('Throws descriptive error when tree is broken', () => {
    expect(() => convertToTree(mockNavigationDataOrphan)).toThrow(
      /^Parent with id .* not found$/
    );
  });
});
