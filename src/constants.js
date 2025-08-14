// Misc
export const DEFAULT_PAGE_SIZE = 2000;
export const DEFAULT_SEARCH_PAGE_SIZE = 100;
export const DEFAULT_FACETED_SEARCH_LENGTH = 4;

// Permissions
export const EDIT = 'can_edit';
export const APPROVE = 'can_approve';
export const REVIEW = 'can_review';
export const APPROVE_BULKUPDATE = 'approve_bulkupdate';
export const CHANGE_BULKUPDATE = 'change_bulkupdate';
export const DELETE_BULKUPDATE = 'delete_bulkupdate';

const HANDLING_PROCESS = 'Käsittelyprosessi';

export const TYPE_CLASSIFICATION = 'classification';
export const TYPE_FUNCTION = 'function';
export const TYPE_PHASE = 'phase';
export const TYPE_ACTION = 'action';
export const TYPE_RECORD = 'record';
export const TYPE_LABELS = {
  action: 'Toimenpide',
  classification: 'Tehtäväluokka',
  function: HANDLING_PROCESS,
  phase: 'Käsittelyvaihe',
  record: 'Asiakirja',
};

// Statuses
export const DRAFT = 'draft';
export const SENT_FOR_REVIEW = 'sent_for_review';
export const WAITING_FOR_APPROVAL = 'waiting_for_approval';
export const APPROVED = 'approved';

// Status filters
export const statusFilters = [
  { value: DRAFT, label: 'Luonnos' },
  { value: SENT_FOR_REVIEW, label: 'Lähetetty tarkastettavaksi' },
  { value: WAITING_FOR_APPROVAL, label: 'Odottaa hyväksymistä' },
  { value: APPROVED, label: 'Hyväksytty' },
];

// export for easier administration
export const navigationStateFilters = {
  statusFilters: {
    path: ['function_state'],
    values: [],
  },
  retentionPeriodFilters: {
    path: ['function_attributes.RetentionPeriod', 'phases.actions.records.attributes.RetentionPeriod'],
    values: [],
  },
};

export const USER_LOGIN_STATUS = {
  NONE: 'NONE',
  INITIALIZING: 'INITIALIZING',
  AUTHORIZED: 'AUTHORIZED',
  UNAUTHORIZED: 'UNAUTHORIZED',
};

// header height
export const HEADER_HEIGHT = 60;

// validation bar filters
export const VALIDATION_FILTER_ERROR = 'error';
export const VALIDATION_FILTER_WARN = 'warning';

// mass update
export const BULK_UPDATE_CONVERSION_TYPES = [
  {
    label: HANDLING_PROCESS,
    value: 'function',
  },
  {
    label: 'Vaihe',
    value: 'phase',
  },
  {
    label: 'Toimenpide',
    value: 'action',
  },
  {
    label: 'Asiakirja',
    value: 'record',
  },
];
export const BULK_UPDATE_SEARCH_TARGET = [
  {
    label: HANDLING_PROCESS,
    value: 'function',
  },
  {
    label: 'Vaihe',
    value: 'phase',
  },
  {
    label: 'Kaikki vaiheet',
    value: 'phases',
  },
  {
    label: 'Toimenpide',
    value: 'action',
  },
  {
    label: 'Kaikki toimenpiteet',
    value: 'actions',
  },
  {
    label: 'Asiakirja',
    value: 'record',
  },
  {
    label: 'Kaikki asiakirjat',
    value: 'records',
  },
];
export const BULK_UPDATE_SEARCH_UNEDITABLE_FUNCTION_ATTRIBUTES = [
  { label: 'Koodi', value: 'code' },
  { label: 'Tila', value: 'function_state' },
];
export const BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES = [
  { label: 'Voimassaolo alkaa', value: 'valid_from' },
  { label: 'Voimassaolo päättyy', value: 'valid_to' },
];
export const BULK_UPDATE_SEARCH_COMPARISON = [
  { label: 'sama kuin', value: true },
  { label: 'eri kuin', value: false },
];
export const BULK_UPDATE_SEARCH_TERM_DEFAULT = {
  attribute: '',
  equals: true,
  target: 'function',
  value: '',
};

export const BULK_UPDATE_PACKAGE_APPROVE_OPTIONS = [
  { label: 'Odottaa', value: false },
  { label: 'Hyväksytty', value: true },
];

export const FACET_ATTRIBUTE_SIZE = 3;

export const FACETED_SEARCH_DEFAULT_ATTRIBUTES = [
  {
    key: 'name',
    name: 'Nimi',
    type: TYPE_CLASSIFICATION,
  },
  {
    key: 'description',
    name: 'Kuvaus',
    type: TYPE_CLASSIFICATION,
  },
  {
    key: 'description_internal',
    name: 'Sisäinen kuvaus',
    type: TYPE_CLASSIFICATION,
  },
  {
    key: 'related_classification',
    name: 'Liittyvä tehtäväluokka',
    type: TYPE_CLASSIFICATION,
  },
  {
    key: 'additional_information',
    name: 'Lisätiedot',
    type: TYPE_CLASSIFICATION,
  },
  {
    key: 'function_state',
    name: 'Tila',
    type: TYPE_FUNCTION,
  },
  {
    key: 'function_valid_from',
    name: 'Voimassaolo alkaa',
    type: TYPE_FUNCTION,
  },
  {
    key: 'function_valid_to',
    name: 'Voimassaolo päättyy',
    type: TYPE_FUNCTION,
  },
];

const BUTTON_PRIMARY = 'btn-primary';

export const DROPDOWN_ITEMS = [
  {
    text: undefined,
    icon: 'fa-file-lines',
    style: BUTTON_PRIMARY,
    action: undefined,
  },
  {
    text: undefined,
    icon: 'fa-pencil',
    style: BUTTON_PRIMARY,
    action: undefined,
  },
  {
    text: undefined,
    icon: 'fa-table-list',
    style: BUTTON_PRIMARY,
    action: undefined,
  },
  {
    text: 'Tuo asiakirjoja',
    icon: 'fa-download',
    style: BUTTON_PRIMARY,
    action: undefined,
  },
  {
    text: 'Poista toimenpide',
    icon: 'fa-trash',
    style: 'btn-delete',
    action: undefined,
  },
];
