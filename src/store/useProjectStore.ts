import { create } from 'zustand'
import type { Project, ProjectStatus, IntakeData, PergolaConfig, PricingConfig, BOMOverride, Comment, HistoryEntry, WorkflowStep } from '../types'
import { DEFAULT_CONFIG } from './useConfigStore'

const STORAGE_KEY = 'pergola-projects'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function now(): string {
  return new Date().toISOString()
}

const DEFAULT_INTAKE: IntakeData = {
  companyName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  siteAddress: '',
  siteNotes: '',
  timeline: 'standard',
  budgetRange: 'unknown',
  notes: '',
}

const DEFAULT_PRICING: PricingConfig = {
  mode: 'budgetary',
  laborRate: 85,
  laborHours: 24,
  overheadPercent: 15,
  markupPercent: 25,
  discountPercent: 0,
  taxPercent: 10,
}

interface ProjectStore {
  projects: Project[]
  activeProjectId: string | null
  activeStep: WorkflowStep

  // Actions
  loadFromStorage: () => void
  createProject: (name: string) => string
  deleteProject: (id: string) => void
  duplicateProject: (id: string) => string
  setActiveProject: (id: string | null) => void
  setActiveStep: (step: WorkflowStep) => void

  // Project updates
  updateIntake: (data: Partial<IntakeData>) => void
  updateConfig: (config: PergolaConfig) => void
  updatePricing: (data: Partial<PricingConfig>) => void
  updateBOMOverride: (itemId: string, override: BOMOverride) => void
  clearBOMOverride: (itemId: string) => void
  updateStatus: (status: ProjectStatus) => void

  // Comments & history
  addComment: (author: string, text: string) => void
  deleteComment: (commentId: string) => void
  addHistoryEntry: (action: string, detail: string) => void

  // Revisions
  saveRevision: (note: string) => void

  // Helpers
  getActiveProject: () => Project | null
}

function saveToStorage(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch { /* quota exceeded – ignore */ }
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  activeStep: 'intake',

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const projects = JSON.parse(raw) as Project[]
        set({ projects })
      }
    } catch { /* corrupt data – start fresh */ }
  },

  createProject: (name: string) => {
    const id = generateId()
    const project: Project = {
      id,
      name,
      status: 'draft',
      intake: { ...DEFAULT_INTAKE },
      config: { ...DEFAULT_CONFIG, walls: { ...DEFAULT_CONFIG.walls } },
      bomOverrides: {},
      pricing: { ...DEFAULT_PRICING },
      comments: [],
      history: [{ id: generateId(), action: 'Project Created', detail: `Project "${name}" created`, timestamp: now() }],
      revisions: [],
      createdAt: now(),
      updatedAt: now(),
    }
    const projects = [...get().projects, project]
    saveToStorage(projects)
    set({ projects, activeProjectId: id, activeStep: 'intake' })
    return id
  },

  deleteProject: (id: string) => {
    const projects = get().projects.filter(p => p.id !== id)
    const activeProjectId = get().activeProjectId === id ? null : get().activeProjectId
    saveToStorage(projects)
    set({ projects, activeProjectId })
  },

  duplicateProject: (id: string) => {
    const source = get().projects.find(p => p.id === id)
    if (!source) return ''
    const newId = generateId()
    const dup: Project = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: `${source.name} (Copy)`,
      status: 'draft' as ProjectStatus,
      history: [{ id: generateId(), action: 'Project Duplicated', detail: `Duplicated from "${source.name}"`, timestamp: now() }],
      revisions: [],
      createdAt: now(),
      updatedAt: now(),
    }
    const projects = [...get().projects, dup]
    saveToStorage(projects)
    set({ projects })
    return newId
  },

  setActiveProject: (id: string | null) => {
    set({ activeProjectId: id, activeStep: 'intake' })
  },

  setActiveStep: (step: WorkflowStep) => {
    set({ activeStep: step })
  },

  updateIntake: (data: Partial<IntakeData>) => {
    const { projects, activeProjectId } = get()
    const updated = projects.map(p =>
      p.id === activeProjectId
        ? { ...p, intake: { ...p.intake, ...data }, updatedAt: now() }
        : p
    )
    saveToStorage(updated)
    set({ projects: updated })
  },

  updateConfig: (config: PergolaConfig) => {
    const { projects, activeProjectId } = get()
    const updated = projects.map(p =>
      p.id === activeProjectId
        ? { ...p, config, updatedAt: now() }
        : p
    )
    saveToStorage(updated)
    set({ projects: updated })
  },

  updatePricing: (data: Partial<PricingConfig>) => {
    const { projects, activeProjectId } = get()
    const updated = projects.map(p =>
      p.id === activeProjectId
        ? { ...p, pricing: { ...p.pricing, ...data }, updatedAt: now() }
        : p
    )
    saveToStorage(updated)
    set({ projects: updated })
  },

  updateBOMOverride: (itemId: string, override: BOMOverride) => {
    const { projects, activeProjectId } = get()
    const updated = projects.map(p =>
      p.id === activeProjectId
        ? { ...p, bomOverrides: { ...p.bomOverrides, [itemId]: override }, updatedAt: now() }
        : p
    )
    saveToStorage(updated)
    set({ projects: updated })
  },

  clearBOMOverride: (itemId: string) => {
    const { projects, activeProjectId } = get()
    const updated = projects.map(p => {
      if (p.id !== activeProjectId) return p
      const overrides = { ...p.bomOverrides }
      delete overrides[itemId]
      return { ...p, bomOverrides: overrides, updatedAt: now() }
    })
    saveToStorage(updated)
    set({ projects: updated })
  },

  updateStatus: (status: ProjectStatus) => {
    const { projects, activeProjectId } = get()
    const updated = projects.map(p =>
      p.id === activeProjectId
        ? {
          ...p,
          status,
          updatedAt: now(),
          history: [...p.history, { id: generateId(), action: 'Status Changed', detail: `Status changed to "${status}"`, timestamp: now() }],
        }
        : p
    )
    saveToStorage(updated)
    set({ projects: updated })
  },

  addComment: (author: string, text: string) => {
    const { projects, activeProjectId } = get()
    const comment: Comment = { id: generateId(), author, text, timestamp: now() }
    const updated = projects.map(p =>
      p.id === activeProjectId
        ? { ...p, comments: [...p.comments, comment], updatedAt: now() }
        : p
    )
    saveToStorage(updated)
    set({ projects: updated })
  },

  deleteComment: (commentId: string) => {
    const { projects, activeProjectId } = get()
    const updated = projects.map(p =>
      p.id === activeProjectId
        ? { ...p, comments: p.comments.filter(c => c.id !== commentId), updatedAt: now() }
        : p
    )
    saveToStorage(updated)
    set({ projects: updated })
  },

  addHistoryEntry: (action: string, detail: string) => {
    const { projects, activeProjectId } = get()
    const entry: HistoryEntry = { id: generateId(), action, detail, timestamp: now() }
    const updated = projects.map(p =>
      p.id === activeProjectId
        ? { ...p, history: [...p.history, entry], updatedAt: now() }
        : p
    )
    saveToStorage(updated)
    set({ projects: updated })
  },

  saveRevision: (note: string) => {
    const { projects, activeProjectId } = get()
    const project = projects.find(p => p.id === activeProjectId)
    if (!project) return
    const revNum = project.revisions.length + 1
    const revision = {
      id: generateId(),
      number: revNum,
      config: JSON.parse(JSON.stringify(project.config)),
      pricing: JSON.parse(JSON.stringify(project.pricing)),
      bomOverrides: JSON.parse(JSON.stringify(project.bomOverrides)),
      timestamp: now(),
      note,
    }
    const updated = projects.map(p =>
      p.id === activeProjectId
        ? {
          ...p,
          revisions: [...p.revisions, revision],
          history: [...p.history, { id: generateId(), action: 'Revision Saved', detail: `Revision #${revNum}: ${note}`, timestamp: now() }],
          updatedAt: now(),
        }
        : p
    )
    saveToStorage(updated)
    set({ projects: updated })
  },

  getActiveProject: () => {
    const { projects, activeProjectId } = get()
    return projects.find(p => p.id === activeProjectId) ?? null
  },
}))
