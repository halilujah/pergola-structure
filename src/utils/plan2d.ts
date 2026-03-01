import type { PergolaConfig } from '../types'

const PADDING = 60
const DIM_OFFSET = 30
const DIM_EXT = 8
const FONT = '11px "Segoe UI", system-ui, sans-serif'
const FONT_BOLD = 'bold 12px "Segoe UI", system-ui, sans-serif'
const FONT_TITLE = 'bold 14px "Segoe UI", system-ui, sans-serif'
const COLOR_STRUCTURE = '#5c3a1e'
const COLOR_DIM = '#333'
const COLOR_GRID = '#e8e8e8'
const COLOR_WALL = '#2196F3'
const COLOR_ROOF = '#90CAF9'
const COLOR_POST = '#8D6E63'

function drawDimensionH(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, label: string, above = true) {
  const dir = above ? -1 : 1
  ctx.strokeStyle = COLOR_DIM
  ctx.fillStyle = COLOR_DIM
  ctx.lineWidth = 0.8
  ctx.font = FONT

  // extension lines
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x1, y + dir * (DIM_OFFSET + DIM_EXT))
  ctx.moveTo(x2, y)
  ctx.lineTo(x2, y + dir * (DIM_OFFSET + DIM_EXT))
  ctx.stroke()

  // dimension line
  const dy = y + dir * DIM_OFFSET
  ctx.beginPath()
  ctx.moveTo(x1, dy)
  ctx.lineTo(x2, dy)
  ctx.stroke()

  // arrows
  drawArrow(ctx, x1, dy, x2, dy)

  // label
  const mid = (x1 + x2) / 2
  ctx.textAlign = 'center'
  ctx.textBaseline = above ? 'bottom' : 'top'
  ctx.fillText(label, mid, dy + dir * 3)
}

function drawDimensionV(ctx: CanvasRenderingContext2D, x: number, y1: number, y2: number, label: string, left = true) {
  const dir = left ? -1 : 1
  ctx.strokeStyle = COLOR_DIM
  ctx.fillStyle = COLOR_DIM
  ctx.lineWidth = 0.8
  ctx.font = FONT

  ctx.beginPath()
  ctx.moveTo(x, y1)
  ctx.lineTo(x + dir * (DIM_OFFSET + DIM_EXT), y1)
  ctx.moveTo(x, y2)
  ctx.lineTo(x + dir * (DIM_OFFSET + DIM_EXT), y2)
  ctx.stroke()

  const dx = x + dir * DIM_OFFSET
  ctx.beginPath()
  ctx.moveTo(dx, y1)
  ctx.lineTo(dx, y2)
  ctx.stroke()

  drawArrow(ctx, dx, y1, dx, y2)

  ctx.save()
  ctx.translate(dx + dir * 3, (y1 + y2) / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.textBaseline = left ? 'top' : 'bottom'
  ctx.fillText(label, 0, 0)
  ctx.restore()
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  const headLen = 6
  const angle = Math.atan2(y2 - y1, x2 - x1)
  // Arrow at start
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 + headLen * Math.cos(angle - Math.PI / 6), y1 + headLen * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(x1, y1)
  ctx.lineTo(x1 + headLen * Math.cos(angle + Math.PI / 6), y1 + headLen * Math.sin(angle + Math.PI / 6))
  ctx.stroke()
  // Arrow at end
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6))
  ctx.stroke()
}

function drawWallIndicator(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, wallType: string) {
  if (wallType === 'none') return
  ctx.save()
  ctx.strokeStyle = COLOR_WALL
  ctx.lineWidth = 3
  if (wallType.includes('glass')) {
    ctx.setLineDash([8, 4])
  } else if (wallType === 'zip-screen') {
    ctx.setLineDash([3, 3])
  } else {
    ctx.setLineDash([])
  }
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.restore()
}

export function drawTopView(canvas: HTMLCanvasElement, config: PergolaConfig) {
  const ctx = canvas.getContext('2d')!
  const { width: w, depth: d, postThickness: pt } = config
  const cw = canvas.width
  const ch = canvas.height

  ctx.clearRect(0, 0, cw, ch)

  // Scale to fit
  const drawW = cw - PADDING * 3
  const drawH = ch - PADDING * 3
  const scale = Math.min(drawW / w, drawH / d)
  const ox = (cw - w * scale) / 2
  const oy = (ch - d * scale) / 2 + 10

  // Title
  ctx.font = FONT_TITLE
  ctx.fillStyle = '#333'
  ctx.textAlign = 'center'
  ctx.fillText('TOP VIEW (Plan)', cw / 2, 20)

  // Grid
  ctx.strokeStyle = COLOR_GRID
  ctx.lineWidth = 0.5
  for (let i = 0; i <= Math.ceil(w); i++) {
    const x = ox + i * scale
    ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + d * scale); ctx.stroke()
  }
  for (let i = 0; i <= Math.ceil(d); i++) {
    const y = oy + i * scale
    ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + w * scale, y); ctx.stroke()
  }

  // Outline
  ctx.strokeStyle = COLOR_STRUCTURE
  ctx.lineWidth = 1.5
  ctx.strokeRect(ox, oy, w * scale, d * scale)

  // Posts (filled squares at corners)
  ctx.fillStyle = COLOR_POST
  const ptS = pt * scale
  ctx.fillRect(ox, oy, ptS, ptS)
  ctx.fillRect(ox + w * scale - ptS, oy, ptS, ptS)
  ctx.fillRect(ox, oy + d * scale - ptS, ptS, ptS)
  ctx.fillRect(ox + w * scale - ptS, oy + d * scale - ptS, ptS, ptS)

  // Rafters (horizontal lines)
  ctx.strokeStyle = COLOR_STRUCTURE
  ctx.lineWidth = 0.8
  const usableD = d - 2 * pt
  for (let i = 0; i < config.rafterCount; i++) {
    const t = config.rafterCount === 1 ? 0.5 : i / (config.rafterCount - 1)
    const ry = oy + (pt + t * usableD) * scale
    ctx.beginPath()
    ctx.moveTo(ox + ptS, ry)
    ctx.lineTo(ox + w * scale - ptS, ry)
    ctx.stroke()
  }

  // Roof area fill
  ctx.fillStyle = COLOR_ROOF
  ctx.globalAlpha = 0.15
  ctx.fillRect(ox + ptS, oy + ptS, (w - 2 * pt) * scale, (d - 2 * pt) * scale)
  ctx.globalAlpha = 1

  // Walls
  const wallLines: { side: string; x1: number; y1: number; x2: number; y2: number }[] = [
    { side: 'front', x1: ox, y1: oy, x2: ox + w * scale, y2: oy },
    { side: 'back', x1: ox, y1: oy + d * scale, x2: ox + w * scale, y2: oy + d * scale },
    { side: 'left', x1: ox, y1: oy, x2: ox, y2: oy + d * scale },
    { side: 'right', x1: ox + w * scale, y1: oy, x2: ox + w * scale, y2: oy + d * scale },
  ]
  for (const wl of wallLines) {
    drawWallIndicator(ctx, wl.x1, wl.y1, wl.x2, wl.y2, config.walls[wl.side as keyof typeof config.walls])
  }

  // Dimensions
  drawDimensionH(ctx, ox, ox + w * scale, oy + d * scale + 5, `${w.toFixed(1)}m`, false)
  drawDimensionV(ctx, ox - 5, oy, oy + d * scale, `${d.toFixed(1)}m`, true)

  // Wall labels
  ctx.font = FONT
  ctx.fillStyle = '#666'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('FRONT', ox + w * scale / 2, oy - 5)
  ctx.textBaseline = 'top'
  ctx.fillText('BACK', ox + w * scale / 2, oy + d * scale + DIM_OFFSET + 20)

  ctx.save()
  ctx.translate(ox - DIM_OFFSET - 20, oy + d * scale / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('LEFT', 0, 0)
  ctx.restore()

  ctx.save()
  ctx.translate(ox + w * scale + DIM_OFFSET + 20, oy + d * scale / 2)
  ctx.rotate(Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('RIGHT', 0, 0)
  ctx.restore()

  // North arrow
  ctx.fillStyle = '#333'
  ctx.font = FONT_BOLD
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText('N', cw - 20, 10)
  ctx.beginPath()
  ctx.moveTo(cw - 25, 30)
  ctx.lineTo(cw - 22, 15)
  ctx.lineTo(cw - 19, 30)
  ctx.fill()
}

export function drawFrontView(canvas: HTMLCanvasElement, config: PergolaConfig) {
  const ctx = canvas.getContext('2d')!
  const { width: w, height: h, postThickness: pt } = config
  const cw = canvas.width
  const ch = canvas.height

  ctx.clearRect(0, 0, cw, ch)

  const drawW = cw - PADDING * 3
  const drawH = ch - PADDING * 3
  const maxH = h + 0.5 // space above for roof
  const scale = Math.min(drawW / w, drawH / maxH)
  const ox = (cw - w * scale) / 2
  const ground = ch - PADDING * 1.5

  ctx.font = FONT_TITLE
  ctx.fillStyle = '#333'
  ctx.textAlign = 'center'
  ctx.fillText('FRONT ELEVATION', cw / 2, 20)

  // Ground line
  ctx.strokeStyle = '#888'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 3])
  ctx.beginPath()
  ctx.moveTo(ox - 20, ground)
  ctx.lineTo(ox + w * scale + 20, ground)
  ctx.stroke()
  ctx.setLineDash([])

  const ptS = pt * scale
  const topY = ground - h * scale
  const beamH = pt * 0.7 * scale

  // Posts
  ctx.fillStyle = COLOR_POST
  ctx.fillRect(ox, topY, ptS, h * scale)
  ctx.fillRect(ox + w * scale - ptS, topY, ptS, h * scale)

  // Top beam
  ctx.fillStyle = COLOR_STRUCTURE
  ctx.fillRect(ox, topY - beamH, w * scale, beamH)

  // Roof indication
  ctx.fillStyle = COLOR_ROOF
  ctx.globalAlpha = 0.3
  ctx.fillRect(ox + ptS, topY - beamH - 8, (w - 2 * pt) * scale, 8)
  ctx.globalAlpha = 1

  // Rafter ends (as small squares on the beam)
  const usableW = (w - 2 * pt) * scale
  ctx.fillStyle = COLOR_STRUCTURE
  for (let i = 0; i < config.rafterCount; i++) {
    const t = config.rafterCount === 1 ? 0.5 : i / (config.rafterCount - 1)
    const rx = ox + ptS + t * usableW
    ctx.fillRect(rx - 2, topY - beamH - 4, 4, 4)
  }

  // Base beam
  const baseH = pt * 0.5 * scale
  ctx.fillStyle = COLOR_STRUCTURE
  ctx.fillRect(ox, ground - baseH, w * scale, baseH)

  // Front wall
  const wallType = config.walls.front
  if (wallType !== 'none') {
    ctx.save()
    ctx.strokeStyle = COLOR_WALL
    ctx.lineWidth = 2
    if (wallType.includes('glass')) {
      ctx.fillStyle = 'rgba(33,150,243,0.1)'
      ctx.fillRect(ox + ptS, topY, (w - 2 * pt) * scale, h * scale - baseH)
      ctx.strokeRect(ox + ptS, topY, (w - 2 * pt) * scale, h * scale - baseH)
    } else {
      // Draw horizontal lines for louver/screen walls
      const wallH = h * scale - baseH
      const count = 8
      for (let i = 0; i < count; i++) {
        const ly = topY + (i / count) * wallH
        ctx.beginPath()
        ctx.moveTo(ox + ptS, ly)
        ctx.lineTo(ox + w * scale - ptS, ly)
        ctx.stroke()
      }
    }
    ctx.restore()
  }

  // Dimensions
  drawDimensionH(ctx, ox, ox + w * scale, ground + 5, `${w.toFixed(1)}m`, false)
  drawDimensionV(ctx, ox - 5, topY - beamH, ground, `${h.toFixed(1)}m`, true)

  // Ground label
  ctx.font = FONT
  ctx.fillStyle = '#888'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('GL', ox - 20, ground + 3)
}

export function drawSideView(canvas: HTMLCanvasElement, config: PergolaConfig) {
  const ctx = canvas.getContext('2d')!
  const { depth: d, height: h, postThickness: pt, roofShape } = config
  const cw = canvas.width
  const ch = canvas.height

  ctx.clearRect(0, 0, cw, ch)

  const slopeRise = roofShape === 'sloped' ? d * 0.1 : 0
  const maxH = h + slopeRise + 0.5
  const drawW = cw - PADDING * 3
  const drawH = ch - PADDING * 3
  const scale = Math.min(drawW / d, drawH / maxH)
  const ox = (cw - d * scale) / 2
  const ground = ch - PADDING * 1.5

  ctx.font = FONT_TITLE
  ctx.fillStyle = '#333'
  ctx.textAlign = 'center'
  ctx.fillText('SIDE ELEVATION (Left)', cw / 2, 20)

  // Ground line
  ctx.strokeStyle = '#888'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 3])
  ctx.beginPath()
  ctx.moveTo(ox - 20, ground)
  ctx.lineTo(ox + d * scale + 20, ground)
  ctx.stroke()
  ctx.setLineDash([])

  const ptS = pt * scale
  const frontTopY = ground - h * scale
  const backTopY = ground - (h + slopeRise) * scale
  const beamH = pt * 0.7 * scale

  // Posts
  ctx.fillStyle = COLOR_POST
  ctx.fillRect(ox, frontTopY, ptS, h * scale) // front post
  ctx.fillRect(ox + d * scale - ptS, backTopY, ptS, (h + slopeRise) * scale) // back post

  // Side beam (sloped)
  ctx.strokeStyle = COLOR_STRUCTURE
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(ox + ptS / 2, frontTopY)
  ctx.lineTo(ox + d * scale - ptS / 2, backTopY)
  ctx.stroke()

  // Roof line
  ctx.strokeStyle = COLOR_ROOF
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(ox + ptS, frontTopY - beamH)
  ctx.lineTo(ox + d * scale - ptS, backTopY - beamH)
  ctx.stroke()

  // Roof fill
  ctx.fillStyle = COLOR_ROOF
  ctx.globalAlpha = 0.2
  ctx.beginPath()
  ctx.moveTo(ox + ptS, frontTopY - beamH)
  ctx.lineTo(ox + d * scale - ptS, backTopY - beamH)
  ctx.lineTo(ox + d * scale - ptS, backTopY - beamH - 8)
  ctx.lineTo(ox + ptS, frontTopY - beamH - 8)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Base beam
  const baseH = pt * 0.5 * scale
  ctx.fillStyle = COLOR_STRUCTURE
  ctx.fillRect(ox, ground - baseH, d * scale, baseH)

  // Left wall
  const wallType = config.walls.left
  if (wallType !== 'none') {
    ctx.save()
    ctx.strokeStyle = COLOR_WALL
    ctx.lineWidth = 2
    if (wallType.includes('glass')) {
      ctx.fillStyle = 'rgba(33,150,243,0.1)'
      ctx.fillRect(ox + ptS, frontTopY, (d - 2 * pt) * scale, h * scale - baseH)
      ctx.strokeRect(ox + ptS, frontTopY, (d - 2 * pt) * scale, h * scale - baseH)
    } else {
      const wallH = h * scale - baseH
      const count = 8
      for (let i = 0; i < count; i++) {
        const ly = frontTopY + (i / count) * wallH
        ctx.beginPath()
        ctx.moveTo(ox + ptS, ly)
        ctx.lineTo(ox + d * scale - ptS, ly)
        ctx.stroke()
      }
    }
    ctx.restore()
  }

  // Dimensions
  drawDimensionH(ctx, ox, ox + d * scale, ground + 5, `${d.toFixed(1)}m`, false)
  drawDimensionV(ctx, ox - 5, frontTopY - beamH, ground, `${h.toFixed(1)}m`, true)
  if (slopeRise > 0) {
    drawDimensionV(ctx, ox + d * scale + 5, backTopY - beamH, ground, `${(h + slopeRise).toFixed(1)}m`, false)
  }

  // Labels
  ctx.font = FONT
  ctx.fillStyle = '#666'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText('FRONT', ox + ptS / 2, ground - h * scale - beamH - 15)
  ctx.fillText('BACK', ox + d * scale - ptS / 2, ground - (h + slopeRise) * scale - beamH - 15)

  // Ground label
  ctx.fillStyle = '#888'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('GL', ox - 20, ground + 3)
}
