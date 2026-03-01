import { create } from 'zustand'
import type { PergolaConfig, WoodFinish } from '../types'

interface ConfigStore extends PergolaConfig {
  set: <K extends keyof PergolaConfig>(key: K, value: PergolaConfig[K]) => void
  load: (config: PergolaConfig) => void
  reset: () => void
  getConfig: () => PergolaConfig
}

export const DEFAULT_CONFIG: PergolaConfig = {
  width: 4,
  depth: 3,
  height: 2.8,
  roofShape: 'flat',
  roofType: 'adjustable-louvers',
  woodFinish: 'natural',
  louverAngle: 45,
  wallLouverAngle: 45,
  postThickness: 0.15,
  rafterCount: 8,
  walls: { left: 'none', right: 'none', front: 'none', back: 'none' },
}

export const FINISH_COLORS: Record<WoodFinish, string> = {
  'natural': '#c4956a',
  'dark-walnut': '#5c3a1e',
  'white-wash': '#d9cfc1',
  'charcoal': '#3a3a3a',
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  ...DEFAULT_CONFIG,
  set: (key, value) => set({ [key]: value }),
  load: (config) => set(config),
  reset: () => set(DEFAULT_CONFIG),
  getConfig: () => {
    const { set: _s, load: _l, reset: _r, getConfig: _g, ...config } = get()
    return config as PergolaConfig
  },
}))
