export const mockNavigationDataShort = [
  {
    id: 'cee34db0de3e47fbb937b74dd87ea759',
    code: '00',
    title: 'Hallintoasiat',
    parent: null
  },
  {
    id: '7a5967d6a21d412d9c1fcdfebf2d3e19',
    code: '00 00',
    title: 'Hallintoasioiden ohjaus',
    parent: {
      id: 'cee34db0de3e47fbb937b74dd87ea759',
      version: 1
    }
  },
  {
    id: 'fb61caa7ec9d4332b0737831fd829293',
    code: '00 00 00',
    title: 'Y HALO THAR!',
    parent: {
      id: '7a5967d6a21d412d9c1fcdfebf2d3e19',
      version: 1
    }
  }
];

export const mockNavigationDataFullObjects = [
  {
    id: 'cee34db0de3e47fbb937b74dd87ea759',
    created_at: '2017-08-28T13:50:41.661873+03:00',
    modified_at: '2017-08-28T13:50:41.661899+03:00',
    version: 1,
    state: 'approved',
    valid_from: null,
    valid_to: null,
    code: '00',
    title: 'Hallintoasiat',
    parent: null,
    description: '',
    related_classification: '',
    function_allowed: false,
    version_history: [
      {
        state: 'approved',
        version: 1,
        modified_at: '2017-08-28T10:50:41.661899Z',
        valid_from: null,
        valid_to: null
      }
    ],
    function: null,
    function_state: null,
    function_attributes: null,
    function_version: null,
    function_valid_from: null,
    function_valid_to: null
  },
  {
    id: '7a5967d6a21d412d9c1fcdfebf2d3e19',
    created_at: '2017-08-28T13:50:41.666219+03:00',
    modified_at: '2017-08-28T13:50:41.666236+03:00',
    version: 1,
    state: 'approved',
    valid_from: null,
    valid_to: null,
    code: '00 00',
    title: 'Hallintoasioiden ohjaus',
    parent: {
      id: 'cee34db0de3e47fbb937b74dd87ea759',
      version: 1
    },
    description: '',
    related_classification: '',
    function_allowed: false,
    version_history: [
      {
        state: 'approved',
        version: 1,
        modified_at: '2017-08-28T10:50:41.666236Z',
        valid_from: null,
        valid_to: null
      }
    ],
    function: null,
    function_state: null,
    function_attributes: null,
    function_version: null,
    function_valid_from: null,
    function_valid_to: null
  },
  {
    id: 'fb61caa7ec9d4332b0737831fd829293',
    created_at: '2020-12-10T10:09:35.476776+02:00',
    modified_at: '2020-12-10T10:10:07.281491+02:00',
    version: 3,
    state: 'approved',
    valid_from: null,
    valid_to: null,
    code: '00 00 00',
    title: 'VERSIO 3. Perustaminen, lakkauttaminen, yhdistäminen',
    parent: {
      id: '7a5967d6a21d412d9c1fcdfebf2d3e19',
      version: 1
    },
    description:
      'Mitä tapahtuu kun käsittelyprosessittoman ylätehtäväluokan tietoja muuttaa? Hajoaako kaikki, vähän jännittää.. EW testaa 10.12.2020 klo 9:51. Status heti uudelle versiolle hyväksytty. Jatkanpa tähän että hyvin kävi. Huh. Ei vaikuttanut alatehtäväluokkiin.\r\n\r\nVielä lisään kolmannen hyväksytyn version ja vaihdan nimekkeeseen version',
    related_classification: '',
    function_allowed: false,
    version_history: [
      {
        state: 'approved',
        version: 1,
        modified_at: '2017-08-28T10:50:42.038968Z',
        valid_from: null,
        valid_to: null
      },
      {
        state: 'approved',
        version: 2,
        modified_at: '2020-12-10T07:52:49.637787Z',
        valid_from: null,
        valid_to: null
      },
      {
        state: 'approved',
        version: 3,
        modified_at: '2020-12-10T08:10:07.281491Z',
        valid_from: null,
        valid_to: null
      }
    ],
    function: null,
    function_state: null,
    function_attributes: null,
    function_version: null,
    function_valid_from: null,
    function_valid_to: null
  }
];
