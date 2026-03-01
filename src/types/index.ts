// ─── Pergola Configuration Types ───

export type RoofShape = 'flat' | 'sloped'
export type RoofType = 'polycarbonate-chamber' | 'solid-polycarbonate' | 'glass' | 'adjustable-louvers'
export type WallType = 'none' | 'fixed-glass' | 'sliding-glass' | 'zip-screen' | 'horizontal-louver' | 'vertical-louver' | 'fixed-louver' | 'adjustable-louver'
export type WoodFinish = 'natural' | 'dark-walnut' | 'white-wash' | 'charcoal'
export type WallSide = 'left' | 'right' | 'front' | 'back'

export interface PergolaConfig {
  width: number
  depth: number
  height: number
  roofShape: RoofShape
  roofType: RoofType
  woodFinish: WoodFinish
  louverAngle: number
  wallLouverAngle: number
  postThickness: number
  rafterCount: number
  walls: Record<WallSide, WallType>
}

// ─── Project & Workflow Types ───

export type ProjectStatus = 'draft' | 'internal-review' | 'sent' | 'approved' | 'revision-requested'

export interface IntakeData {
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  siteAddress: string
  siteNotes: string
  timeline: 'urgent' | 'standard' | 'flexible'
  budgetRange: 'under-10k' | '10k-25k' | '25k-50k' | '50k-plus' | 'unknown'
  notes: string
}

export interface BOMItem {
  id: string
  category: string
  description: string
  material: string
  unit: string
  quantity: number
  unitWeight: number
  unitPrice: number
}

export interface BOMOverride {
  quantity: number
  note: string
}

export interface PricingConfig {
  mode: 'budgetary' | 'final'
  laborRate: number
  laborHours: number
  overheadPercent: number
  markupPercent: number
  discountPercent: number
  taxPercent: number
}

export interface Comment {
  id: string
  author: string
  text: string
  timestamp: string
}

export interface HistoryEntry {
  id: string
  action: string
  detail: string
  timestamp: string
}

export interface Revision {
  id: string
  number: number
  config: PergolaConfig
  pricing: PricingConfig
  bomOverrides: Record<string, BOMOverride>
  timestamp: string
  note: string
}

export interface Project {
  id: string
  name: string
  status: ProjectStatus
  intake: IntakeData
  config: PergolaConfig
  bomOverrides: Record<string, BOMOverride>
  pricing: PricingConfig
  comments: Comment[]
  history: HistoryEntry[]
  revisions: Revision[]
  createdAt: string
  updatedAt: string
}

export type WorkflowStep = 'intake' | 'configure' | 'bom' | 'pricing' | 'plans' | 'export'

export const WORKFLOW_STEPS: { key: WorkflowStep; label: string }[] = [
  { key: 'intake', label: 'Project Info' },
  { key: 'configure', label: 'Configure' },
  { key: 'bom', label: 'BOM & Quantities' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'plans', label: '2D Plans' },
  { key: 'export', label: 'Quote & Export' },
]

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  'draft': 'Draft',
  'internal-review': 'Internal Review',
  'sent': 'Sent to Client',
  'approved': 'Approved',
  'revision-requested': 'Revision Requested',
}

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  'draft': '#8892b0',
  'internal-review': '#f0ad4e',
  'sent': '#5bc0de',
  'approved': '#5cb85c',
  'revision-requested': '#d9534f',
}
