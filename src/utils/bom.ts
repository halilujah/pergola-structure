import type { PergolaConfig, BOMItem, WallType } from '../types'

let counter = 0
function itemId(prefix: string): string {
  return `${prefix}-${++counter}`
}

const WALL_LABELS: Record<WallType, string> = {
  'none': '',
  'fixed-glass': 'Fixed Glass Panel',
  'sliding-glass': 'Sliding Glass Panel (2-track)',
  'zip-screen': 'Zip Screen System',
  'horizontal-louver': 'Horizontal Louver Screen',
  'vertical-louver': 'Vertical Louver Screen',
  'fixed-louver': 'Fixed Louver Panel',
  'adjustable-louver': 'Adjustable Louver Panel',
}

const WALL_MATERIAL: Record<WallType, string> = {
  'none': '',
  'fixed-glass': 'Tempered glass + aluminium frame',
  'sliding-glass': 'Tempered glass + aluminium track',
  'zip-screen': 'PVC mesh + aluminium cassette',
  'horizontal-louver': 'Powder-coated aluminium',
  'vertical-louver': 'Powder-coated aluminium',
  'fixed-louver': 'Powder-coated aluminium',
  'adjustable-louver': 'Powder-coated aluminium + pivot',
}

const WALL_UNIT_PRICE: Record<WallType, number> = {
  'none': 0,
  'fixed-glass': 320,
  'sliding-glass': 480,
  'zip-screen': 210,
  'horizontal-louver': 175,
  'vertical-louver': 175,
  'fixed-louver': 190,
  'adjustable-louver': 260,
}

const ROOF_MATERIAL_LABEL: Record<string, string> = {
  'polycarbonate-chamber': 'Multi-wall polycarbonate 16mm',
  'solid-polycarbonate': 'Solid polycarbonate 6mm',
  'glass': 'Laminated safety glass 8mm',
  'adjustable-louvers': 'Powder-coated aluminium louvers',
}

const ROOF_UNIT_PRICE: Record<string, number> = {
  'polycarbonate-chamber': 45,
  'solid-polycarbonate': 65,
  'glass': 120,
  'adjustable-louvers': 95,
}

export function calculateBOM(config: PergolaConfig): BOMItem[] {
  counter = 0
  const items: BOMItem[] = []
  const { width, depth, height, postThickness, rafterCount, roofType } = config

  // 1. Posts (4 corner posts)
  const postVolume = postThickness * postThickness * height
  items.push({
    id: itemId('POST'),
    category: 'Structure',
    description: `Corner post ${(postThickness * 100).toFixed(0)}x${(postThickness * 100).toFixed(0)}mm x ${height.toFixed(1)}m`,
    material: 'Engineered timber (glulam)',
    unit: 'pc',
    quantity: 4,
    unitWeight: postVolume * 500, // ~500 kg/m3 for timber
    unitPrice: 85 + postVolume * 800,
  })

  // 2. Post base anchors
  items.push({
    id: itemId('ANCHOR'),
    category: 'Structure',
    description: 'Post base anchor (galvanized steel)',
    material: 'Hot-dip galvanized steel',
    unit: 'pc',
    quantity: 4,
    unitWeight: 2.5,
    unitPrice: 35,
  })

  // 3. Top beams (perimeter)
  const beamSection = `${(postThickness * 100).toFixed(0)}x${(postThickness * 70).toFixed(0)}mm`
  items.push({
    id: itemId('BEAM-FB'),
    category: 'Structure',
    description: `Top beam front/back ${beamSection} x ${width.toFixed(1)}m`,
    material: 'Engineered timber (glulam)',
    unit: 'pc',
    quantity: 2,
    unitWeight: postThickness * postThickness * 0.7 * width * 500,
    unitPrice: 60 + width * 28,
  })

  items.push({
    id: itemId('BEAM-LR'),
    category: 'Structure',
    description: `Top beam left/right ${beamSection} x ${depth.toFixed(1)}m`,
    material: 'Engineered timber (glulam)',
    unit: 'pc',
    quantity: 2,
    unitWeight: postThickness * postThickness * 0.7 * depth * 500,
    unitPrice: 60 + depth * 28,
  })

  // 4. Base beams (perimeter)
  const baseSection = `${(postThickness * 100).toFixed(0)}x${(postThickness * 50).toFixed(0)}mm`
  items.push({
    id: itemId('BASE-FB'),
    category: 'Structure',
    description: `Base beam front/back ${baseSection} x ${width.toFixed(1)}m`,
    material: 'Pressure-treated timber',
    unit: 'pc',
    quantity: 2,
    unitWeight: postThickness * postThickness * 0.5 * width * 500,
    unitPrice: 40 + width * 18,
  })

  items.push({
    id: itemId('BASE-LR'),
    category: 'Structure',
    description: `Base beam left/right ${baseSection} x ${depth.toFixed(1)}m`,
    material: 'Pressure-treated timber',
    unit: 'pc',
    quantity: 2,
    unitWeight: postThickness * postThickness * 0.5 * depth * 500,
    unitPrice: 40 + depth * 18,
  })

  // 5. Rafters
  const rafterSection = `${(postThickness * 50).toFixed(0)}x${(postThickness * 50).toFixed(0)}mm`
  items.push({
    id: itemId('RAFTER'),
    category: 'Roof',
    description: `Rafter ${rafterSection} x ${(width - 2 * postThickness).toFixed(1)}m`,
    material: 'Engineered timber',
    unit: 'pc',
    quantity: rafterCount,
    unitWeight: postThickness * 0.5 * postThickness * 0.5 * (width - 2 * postThickness) * 500,
    unitPrice: 25 + (width - 2 * postThickness) * 12,
  })

  // 6. Roof covering
  const roofArea = (width - 2 * postThickness) * (depth - 2 * postThickness)
  if (roofType === 'adjustable-louvers') {
    items.push({
      id: itemId('ROOF-LOUVER'),
      category: 'Roof',
      description: `Adjustable roof louver blades (${rafterCount} blades)`,
      material: ROOF_MATERIAL_LABEL[roofType],
      unit: 'set',
      quantity: 1,
      unitWeight: rafterCount * 3.5,
      unitPrice: roofArea * ROOF_UNIT_PRICE[roofType],
    })
    items.push({
      id: itemId('ROOF-MOTOR'),
      category: 'Roof',
      description: 'Louver motor & control unit',
      material: 'Electric actuator + remote',
      unit: 'set',
      quantity: 1,
      unitWeight: 4,
      unitPrice: 450,
    })
  } else {
    const panelCount = Math.max(1, rafterCount - 1)
    items.push({
      id: itemId('ROOF-PANEL'),
      category: 'Roof',
      description: `Roof panel ${ROOF_MATERIAL_LABEL[roofType]}`,
      material: ROOF_MATERIAL_LABEL[roofType],
      unit: 'm\u00B2',
      quantity: Math.round(roofArea * 100) / 100,
      unitWeight: roofType === 'glass' ? 20 : 4,
      unitPrice: ROOF_UNIT_PRICE[roofType],
    })
    items.push({
      id: itemId('ROOF-SEAL'),
      category: 'Roof',
      description: 'Panel sealing gaskets',
      material: 'EPDM rubber',
      unit: 'pc',
      quantity: panelCount + 1,
      unitWeight: 0.3,
      unitPrice: 12,
    })
  }

  // 7. Gutter & drainage
  items.push({
    id: itemId('GUTTER'),
    category: 'Roof',
    description: `Integrated gutter (${width.toFixed(1)}m front)`,
    material: 'Powder-coated aluminium',
    unit: 'set',
    quantity: 1,
    unitWeight: width * 1.2,
    unitPrice: 65 + width * 22,
  })

  items.push({
    id: itemId('DOWNPIPE'),
    category: 'Roof',
    description: `Downpipe ${height.toFixed(1)}m`,
    material: 'Powder-coated aluminium',
    unit: 'pc',
    quantity: 2,
    unitWeight: height * 0.8,
    unitPrice: 28 + height * 8,
  })

  // 8. Walls
  const wallSides: Array<{ side: string; wallWidth: number }> = [
    { side: 'front', wallWidth: width - 2 * postThickness },
    { side: 'back', wallWidth: width - 2 * postThickness },
    { side: 'left', wallWidth: depth - 2 * postThickness },
    { side: 'right', wallWidth: depth - 2 * postThickness },
  ]

  for (const { side, wallWidth } of wallSides) {
    const wallType = config.walls[side as keyof typeof config.walls]
    if (wallType === 'none') continue
    const wallArea = wallWidth * height
    items.push({
      id: itemId(`WALL-${side.toUpperCase()}`),
      category: 'Walls',
      description: `${side.charAt(0).toUpperCase() + side.slice(1)} wall: ${WALL_LABELS[wallType]} (${wallWidth.toFixed(1)}m x ${height.toFixed(1)}m)`,
      material: WALL_MATERIAL[wallType],
      unit: 'm\u00B2',
      quantity: Math.round(wallArea * 100) / 100,
      unitWeight: wallType.includes('glass') ? 15 : 5,
      unitPrice: WALL_UNIT_PRICE[wallType],
    })
  }

  // 9. Finishing
  const totalTimberArea = (
    4 * postThickness * 4 * height + // posts (4 faces each)
    2 * 2 * (width + depth) * postThickness * 0.7 + // top beams
    2 * 2 * (width + depth) * postThickness * 0.5 + // base beams
    rafterCount * 4 * (width - 2 * postThickness) * postThickness * 0.5 // rafters
  )
  items.push({
    id: itemId('FINISH'),
    category: 'Finishing',
    description: `Wood finish (${config.woodFinish}) - stain & seal`,
    material: 'Exterior wood stain + UV sealant',
    unit: 'm\u00B2',
    quantity: Math.round(totalTimberArea * 100) / 100,
    unitWeight: 0.2,
    unitPrice: 8,
  })

  // 10. Fasteners
  const totalFasteners = 4 * 8 + rafterCount * 4 + 20 // post bolts + rafter brackets + misc
  items.push({
    id: itemId('FASTENER'),
    category: 'Finishing',
    description: 'Stainless steel fastener set (bolts, brackets, screws)',
    material: 'A2 stainless steel',
    unit: 'set',
    quantity: 1,
    unitWeight: totalFasteners * 0.05,
    unitPrice: 45 + totalFasteners * 0.8,
  })

  // 11. LED lighting (optional but common)
  items.push({
    id: itemId('LED'),
    category: 'Accessories',
    description: `LED strip lighting (${((width + depth) * 2).toFixed(1)}m perimeter)`,
    material: 'IP65 warm-white LED strip + driver',
    unit: 'set',
    quantity: 1,
    unitWeight: 1.5,
    unitPrice: 85 + (width + depth) * 12,
  })

  return items
}

export function getBOMCategories(items: BOMItem[]): string[] {
  const cats = new Set(items.map(i => i.category))
  return ['Structure', 'Roof', 'Walls', 'Finishing', 'Accessories'].filter(c => cats.has(c))
}

export function getBOMTotal(items: BOMItem[], overrides: Record<string, { quantity: number }>): number {
  return items.reduce((sum, item) => {
    const qty = overrides[item.id]?.quantity ?? item.quantity
    return sum + qty * item.unitPrice
  }, 0)
}

export function getBOMTotalWeight(items: BOMItem[], overrides: Record<string, { quantity: number }>): number {
  return items.reduce((sum, item) => {
    const qty = overrides[item.id]?.quantity ?? item.quantity
    return sum + qty * item.unitWeight
  }, 0)
}
