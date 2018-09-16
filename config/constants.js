// Misc
export const DEFAULT_PAGE_SIZE = 2000;

// Permissions
export const EDIT = 'can_edit';
export const APPROVE = 'can_approve';
export const REVIEW = 'can_review';

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
  { value: APPROVED, label: 'Hyväksytty', default: true }
];

// Retention-period filters
export const retentionPeriodFilters = [
  { value: '-1', label: -1 },
  { value: '1', label: 1 },
  { value: '20', label: 20 },
  { value: '25', label: 25 },
  { value: '30', label: 30 },
  { value: '40', label: 40 },
  { value: '50', label: 50 },
  { value: '120', label: 120 }
];
