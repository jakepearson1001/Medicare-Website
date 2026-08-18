import type { LinkItem } from '../types';
import { COMPANY_VIDEO_URL } from '../config';

/** Seed tabs for the tools bar. The Company Videos tab opens the in-app window. */
export const DEFAULT_TOOL_TABS: LinkItem[] = [
  { id: 'tool-videos', name: 'Company Videos', url: COMPANY_VIDEO_URL, builtin: 'videos' },
  { id: 'tool-morningstar', name: 'Morningstar', url: 'https://www.morningstar.com' },
  { id: 'tool-sunfire', name: 'Sunfire', url: 'https://www.sunfirematrix.com' },
  { id: 'tool-medicare', name: 'Medicare.gov Plan Finder', url: 'https://www.medicare.gov/plan-compare' },
];

/** Seed tiles for the Quick Links window (separate store from the tools bar). */
export const DEFAULT_QUICK_LINKS: LinkItem[] = [
  { id: 'ql-leads', name: 'Credit Union Leads', url: 'https://docs.google.com/spreadsheets' },
  { id: 'ql-drive', name: 'Marketing Drive', url: 'https://drive.google.com' },
  { id: 'ql-docusign', name: 'DocuSign', url: 'https://www.docusign.com' },
  { id: 'ql-ahip', name: 'AHIP Portal', url: 'https://www.ahipmedicaretraining.com' },
];
