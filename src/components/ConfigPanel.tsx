import { useConfigStore, FINISH_COLORS, type RoofShape, type RoofType, type WallType, type WoodFinish } from '../store/useConfigStore'

const ROOF_SHAPE_OPTIONS: { value: RoofShape; label: string }[] = [
  { value: 'flat', label: 'Flat' },
  { value: 'sloped', label: 'Sloped' },
]

const ROOF_TYPE_OPTIONS: { value: RoofType; label: string }[] = [
  { value: 'polycarbonate-chamber', label: 'PC Chamber' },
  { value: 'solid-polycarbonate', label: 'Solid PC' },
  { value: 'glass', label: 'Glass' },
  { value: 'adjustable-louvers', label: 'Louvers' },
]

const WALL_TYPE_OPTIONS: { value: WallType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'fixed-glass', label: 'Fixed Glass' },
  { value: 'sliding-glass', label: 'Sliding Glass' },
  { value: 'zip-screen', label: 'Zip Screen' },
  { value: 'horizontal-louver', label: 'Horizontal Louver' },
  { value: 'vertical-louver', label: 'Vertical Louver' },
  { value: 'fixed-louver', label: 'Fixed Louver' },
  { value: 'adjustable-louver', label: 'Adjustable Louver' },
]

const FINISH_OPTIONS: { value: WoodFinish; label: string }[] = [
  { value: 'natural', label: 'Natural' },
  { value: 'dark-walnut', label: 'Dark Walnut' },
  { value: 'white-wash', label: 'White Wash' },
  { value: 'charcoal', label: 'Charcoal' },
]

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="control-group">
      <label>
        <span className="control-label">{label}</span>
        <span className="control-value">{value.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0)}{unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export default function ConfigPanel() {
  const config = useConfigStore()

  const hasAdjustableWallLouver = Object.values(config.walls).some((w) => w === 'adjustable-louver')

  return (
    <div className="config-panel">
      <h1>Pergola Configurator</h1>

      <section>
        <h2>Dimensions</h2>
        <Slider label="Width" value={config.width} min={2} max={8} step={0.1} unit="m" onChange={(v) => config.set('width', v)} />
        <Slider label="Depth" value={config.depth} min={2} max={6} step={0.1} unit="m" onChange={(v) => config.set('depth', v)} />
        <Slider label="Height" value={config.height} min={2.2} max={4} step={0.1} unit="m" onChange={(v) => config.set('height', v)} />
        <Slider label="Post Size" value={config.postThickness} min={0.1} max={0.25} step={0.01} unit="m" onChange={(v) => config.set('postThickness', v)} />
      </section>

      <section>
        <h2>Roof Shape</h2>
        <div className="button-group">
          {ROOF_SHAPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={config.roofShape === opt.value ? 'active' : ''}
              onClick={() => config.set('roofShape', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Roof Type</h2>
        <div className="button-group roof-type-grid">
          {ROOF_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={config.roofType === opt.value ? 'active' : ''}
              onClick={() => config.set('roofType', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Slider label="Rafters" value={config.rafterCount} min={3} max={16} step={1} unit="" onChange={(v) => config.set('rafterCount', v)} />
        {config.roofType === 'adjustable-louvers' && (
          <Slider label="Louver Angle" value={config.louverAngle} min={0} max={90} step={5} unit="°" onChange={(v) => config.set('louverAngle', v)} />
        )}
      </section>

      <section>
        <h2>Walls</h2>
        {(['front', 'back', 'left', 'right'] as const).map((side) => (
          <div key={side} className="control-group">
            <label>
              <span className="control-label">{side.charAt(0).toUpperCase() + side.slice(1)}</span>
            </label>
            <select
              className="wall-select"
              value={config.walls[side]}
              onChange={(e) => config.set('walls', { ...config.walls, [side]: e.target.value as WallType })}
            >
              {WALL_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}
        {hasAdjustableWallLouver && (
          <Slider label="Wall Louver Angle" value={config.wallLouverAngle} min={0} max={90} step={5} unit="°" onChange={(v) => config.set('wallLouverAngle', v)} />
        )}
      </section>

      <section>
        <h2>Wood Finish</h2>
        <div className="swatch-group">
          {FINISH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`swatch ${config.woodFinish === opt.value ? 'active' : ''}`}
              onClick={() => config.set('woodFinish', opt.value)}
              title={opt.label}
            >
              <span className="swatch-color" style={{ backgroundColor: FINISH_COLORS[opt.value] }} />
              <span className="swatch-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <button className="reset-btn" onClick={config.reset}>
        Reset to Defaults
      </button>
    </div>
  )
}
