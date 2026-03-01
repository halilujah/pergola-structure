import { useMemo } from 'react'
import * as THREE from 'three'
import { useConfigStore, FINISH_COLORS, type WallType, type RoofType } from '../store/useConfigStore'

// ─── Primitives ───

function WoodBeam({ position, size, color, rotation }: {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  rotation?: [number, number, number]
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
}

function GlassPane({ position, size, rotation, tint = '#c8e6f0', opacity = 0.25 }: {
  position: [number, number, number]
  size: [number, number, number]
  rotation?: [number, number, number]
  tint?: string
  opacity?: number
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color={tint}
        transparent
        opacity={opacity}
        roughness={0.05}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── Wall Components ───

function FixedGlassWall({ width, height, pt }: { width: number; height: number; pt: number }) {
  const f = pt * 0.25
  return (
    <group>
      <WoodBeam position={[0, height / 2, 0]} size={[width, f, f]} color="#555" />
      <WoodBeam position={[0, -height / 2, 0]} size={[width, f, f]} color="#555" />
      <WoodBeam position={[-width / 2, 0, 0]} size={[f, height, f]} color="#555" />
      <WoodBeam position={[width / 2, 0, 0]} size={[f, height, f]} color="#555" />
      <GlassPane position={[0, 0, 0]} size={[width - f, height - f, 0.008]} opacity={0.25} />
    </group>
  )
}

function SlidingGlassWall({ width, height, pt }: { width: number; height: number; pt: number }) {
  const f = pt * 0.15
  const railH = pt * 0.25
  const trackZ = pt * 0.2
  const panelW = width * 0.55
  const innerH = height - railH * 2
  // Each panel is 55% of width. Position so outer edges reach the rail ends.
  const panelOffset = (width - panelW) / 2
  return (
    <group>
      {/* Top & bottom rails – full width */}
      <WoodBeam position={[0, height / 2 - railH / 2, 0]} size={[width, railH, pt * 0.4]} color="#555" />
      <WoodBeam position={[0, -height / 2 + railH / 2, 0]} size={[width, railH, pt * 0.4]} color="#555" />
      {/* Panel 1 – front track, shifted left */}
      <group position={[-panelOffset, 0, trackZ]}>
        <WoodBeam position={[-panelW / 2, 0, 0]} size={[f, innerH, f]} color="#555" />
        <WoodBeam position={[panelW / 2, 0, 0]} size={[f, innerH, f]} color="#555" />
        <WoodBeam position={[0, innerH / 2, 0]} size={[panelW, f, f]} color="#555" />
        <WoodBeam position={[0, -innerH / 2, 0]} size={[panelW, f, f]} color="#555" />
        <GlassPane position={[0, 0, 0]} size={[panelW - f * 2, innerH - f * 2, 0.006]} opacity={0.2} />
      </group>
      {/* Panel 2 – back track, shifted right */}
      <group position={[panelOffset, 0, -trackZ]}>
        <WoodBeam position={[-panelW / 2, 0, 0]} size={[f, innerH, f]} color="#555" />
        <WoodBeam position={[panelW / 2, 0, 0]} size={[f, innerH, f]} color="#555" />
        <WoodBeam position={[0, innerH / 2, 0]} size={[panelW, f, f]} color="#555" />
        <WoodBeam position={[0, -innerH / 2, 0]} size={[panelW, f, f]} color="#555" />
        <GlassPane position={[0, 0, 0]} size={[panelW - f * 2, innerH - f * 2, 0.006]} opacity={0.2} />
      </group>
    </group>
  )
}

function ZipScreenWall({ width, height, pt }: { width: number; height: number; pt: number }) {
  const r = pt * 0.35
  return (
    <group>
      <mesh position={[0, height / 2 + r, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[r, r, width, 12]} />
        <meshStandardMaterial color="#666" roughness={0.4} metalness={0.3} />
      </mesh>
      <WoodBeam position={[-width / 2, 0, 0]} size={[pt * 0.15, height, pt * 0.25]} color="#555" />
      <WoodBeam position={[width / 2, 0, 0]} size={[pt * 0.15, height, pt * 0.25]} color="#555" />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[width * 0.97, height, 0.004]} />
        <meshStandardMaterial color="#e0d8c8" transparent opacity={0.55} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function HorizontalLouverWall({ width, height, color }: { width: number; height: number; color: string }) {
  const count = Math.max(6, Math.round(height / 0.18))
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const y = -height / 2 + (i / (count - 1)) * height
        return (
          <mesh key={i} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, 0.04, 0.07]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

function VerticalLouverWall({ width, height, color }: { width: number; height: number; color: string }) {
  const count = Math.max(6, Math.round(width / 0.18))
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const x = -width / 2 + (i / (count - 1)) * width
        return (
          <mesh key={i} position={[x, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.04, height, 0.07]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
        )
      })}
    </group>
  )
}

function FixedLouverWall({ width, height, color }: { width: number; height: number; color: string }) {
  const count = Math.max(6, Math.round(height / 0.14))
  const angle = Math.PI / 4
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const y = -height / 2 + (i / (count - 1)) * height
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[angle, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, 0.015, 0.11]} />
            <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}

function AdjustableLouverWall({ width, height, color, angle }: { width: number; height: number; color: string; angle: number }) {
  const count = Math.max(6, Math.round(height / 0.14))
  const rad = (angle * Math.PI) / 180
  return (
    <group>
      {Array.from({ length: count }, (_, i) => {
        const y = -height / 2 + (i / (count - 1)) * height
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[rad, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, 0.015, 0.11]} />
            <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}

function WallRenderer({ type, width, height, pt, color, louverAngle }: {
  type: WallType
  width: number
  height: number
  pt: number
  color: string
  louverAngle: number
}) {
  switch (type) {
    case 'none': return null
    case 'fixed-glass': return <FixedGlassWall width={width} height={height} pt={pt} />
    case 'sliding-glass': return <SlidingGlassWall width={width} height={height} pt={pt} />
    case 'zip-screen': return <ZipScreenWall width={width} height={height} pt={pt} />
    case 'horizontal-louver': return <HorizontalLouverWall width={width} height={height} color={color} />
    case 'vertical-louver': return <VerticalLouverWall width={width} height={height} color={color} />
    case 'fixed-louver': return <FixedLouverWall width={width} height={height} color={color} />
    case 'adjustable-louver': return <AdjustableLouverWall width={width} height={height} color={color} angle={louverAngle} />
  }
}

// ─── Roof Components ───

function PanelRoof({ roofType, rafterCount, w, d, h, pt, beamThickness, slopeRise, color }: {
  roofType: RoofType
  rafterCount: number
  w: number
  d: number
  h: number
  pt: number
  beamThickness: number
  slopeRise: number
  color: string
}) {
  const halfD = d / 2
  const rafterThickness = pt * 0.5
  const usableDepth = d - 2 * pt

  let panelTint = '#c8e6f0'
  let panelOpacity = 0.3
  let panelThick = 0.01
  const isChamber = roofType === 'polycarbonate-chamber'

  if (roofType === 'polycarbonate-chamber') {
    panelTint = '#d0e8f0'
    panelOpacity = 0.4
    panelThick = 0.025
  } else if (roofType === 'solid-polycarbonate') {
    panelTint = '#c0dce8'
    panelOpacity = 0.35
    panelThick = 0.008
  } else if (roofType === 'glass') {
    panelTint = '#d8f0e8'
    panelOpacity = 0.2
    panelThick = 0.008
  }

  const slopeAngle = slopeRise > 0 ? -Math.atan2(slopeRise, usableDepth) : 0

  return (
    <>
      {/* Rafters */}
      {Array.from({ length: rafterCount }, (_, i) => {
        const t = rafterCount === 1 ? 0.5 : i / (rafterCount - 1)
        const z = -halfD + pt + t * usableDepth
        const yOff = slopeRise * t
        return (
          <WoodBeam
            key={`rafter-${i}`}
            position={[0, h + beamThickness / 2 + rafterThickness / 2 + yOff, z]}
            size={[w - 2 * pt, rafterThickness, rafterThickness]}
            color={color}
          />
        )
      })}
      {/* Panels between rafters */}
      {Array.from({ length: Math.max(0, rafterCount - 1) }, (_, i) => {
        const t0 = i / (rafterCount - 1)
        const t1 = (i + 1) / (rafterCount - 1)
        const tMid = (t0 + t1) / 2
        const z = -halfD + pt + tMid * usableDepth
        const yOff = slopeRise * tMid
        const panelDepth = usableDepth / (rafterCount - 1) * 0.9
        const y = h + beamThickness / 2 + rafterThickness + panelThick / 2 + yOff

        return (
          <group key={`panel-${i}`}>
            <GlassPane
              position={[0, y, z]}
              size={[w - 2 * pt, panelThick, panelDepth]}
              rotation={slopeAngle !== 0 ? [slopeAngle, 0, 0] : undefined}
              tint={panelTint}
              opacity={panelOpacity}
            />
            {isChamber && Array.from({ length: 3 }, (_, r) => {
              const rt = (r + 1) / 4
              const rx = -(w - 2 * pt) / 2 + rt * (w - 2 * pt)
              return (
                <mesh key={`rib-${i}-${r}`} position={[rx, y, z]} rotation={slopeAngle !== 0 ? [slopeAngle, 0, 0] : undefined}>
                  <boxGeometry args={[0.003, panelThick * 0.8, panelDepth * 0.95]} />
                  <meshStandardMaterial color={panelTint} transparent opacity={0.3} />
                </mesh>
              )
            })}
          </group>
        )
      })}
    </>
  )
}

function LouverRoof({ rafterCount, louverAngle, w, d, h, pt, beamThickness, slopeRise, color }: {
  rafterCount: number
  louverAngle: number
  w: number
  d: number
  h: number
  pt: number
  beamThickness: number
  slopeRise: number
  color: string
}) {
  const halfD = d / 2
  const angleRad = (louverAngle * Math.PI) / 180
  const usableDepth = d - 2 * pt

  return (
    <>
      {Array.from({ length: rafterCount }, (_, i) => {
        const t = rafterCount === 1 ? 0.5 : i / (rafterCount - 1)
        const z = -halfD + pt + t * usableDepth
        const yOff = slopeRise * t
        return (
          <mesh key={i} position={[0, h + beamThickness / 2 + 0.02 + yOff, z]} rotation={[angleRad, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[w - 2 * pt, 0.02, d / rafterCount * 0.85]} />
            <meshStandardMaterial color={color} roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </>
  )
}

// ─── Main Component ───

export default function Pergola() {
  const config = useConfigStore()
  const color = FINISH_COLORS[config.woodFinish]

  const { width: w, depth: d, height: h, postThickness: pt } = config
  const halfW = w / 2
  const halfD = d / 2
  const beamThickness = pt * 0.7
  const baseBeamH = pt * 0.5

  // Slope: back is higher than front
  const slopeRise = config.roofShape === 'sloped' ? d * 0.1 : 0
  const frontH = h
  const backH = h + slopeRise
  const slopeAngle = slopeRise > 0 ? Math.atan2(slopeRise, d) : 0
  const sideBeamLen = Math.sqrt(d * d + slopeRise * slopeRise)

  // Posts: front at frontH, back at backH
  const posts = useMemo(() => [
    { pos: [-halfW + pt / 2, frontH / 2, -halfD + pt / 2] as [number, number, number], h: frontH },
    { pos: [halfW - pt / 2, frontH / 2, -halfD + pt / 2] as [number, number, number], h: frontH },
    { pos: [-halfW + pt / 2, backH / 2, halfD - pt / 2] as [number, number, number], h: backH },
    { pos: [halfW - pt / 2, backH / 2, halfD - pt / 2] as [number, number, number], h: backH },
  ], [halfW, halfD, frontH, backH, pt])

  // Wall definitions: position (center), dimensions, rotation
  // Side walls use frontH (rectangular panels can't slope – gap at top near back is left open)
  const wallDefs = useMemo(() => ({
    left: { pos: [-halfW + pt / 2, frontH / 2, 0] as [number, number, number], width: d - 2 * pt, height: frontH, rotY: Math.PI / 2 },
    right: { pos: [halfW - pt / 2, frontH / 2, 0] as [number, number, number], width: d - 2 * pt, height: frontH, rotY: -Math.PI / 2 },
    front: { pos: [0, frontH / 2, -halfD + pt / 2] as [number, number, number], width: w - 2 * pt, height: frontH, rotY: 0 },
    back: { pos: [0, backH / 2, halfD - pt / 2] as [number, number, number], width: w - 2 * pt, height: backH, rotY: Math.PI },
  }), [halfW, halfD, frontH, backH, w, d, pt])

  return (
    <group>
      {/* ─── Posts ─── */}
      {posts.map((p, i) => (
        <WoodBeam key={`post-${i}`} position={p.pos} size={[pt, p.h, pt]} color={color} />
      ))}

      {/* ─── Base Structure (ground level beams) ─── */}
      <WoodBeam position={[0, baseBeamH / 2, -halfD + pt / 2]} size={[w, baseBeamH, pt]} color={color} />
      <WoodBeam position={[0, baseBeamH / 2, halfD - pt / 2]} size={[w, baseBeamH, pt]} color={color} />
      <WoodBeam position={[-halfW + pt / 2, baseBeamH / 2, 0]} size={[pt, baseBeamH, d]} color={color} />
      <WoodBeam position={[halfW - pt / 2, baseBeamH / 2, 0]} size={[pt, baseBeamH, d]} color={color} />

      {/* ─── Top Beams ─── */}
      {/* Front beam */}
      <WoodBeam position={[0, frontH + beamThickness / 2, -halfD + pt / 2]} size={[w, beamThickness, pt]} color={color} />
      {/* Back beam */}
      <WoodBeam position={[0, backH + beamThickness / 2, halfD - pt / 2]} size={[w, beamThickness, pt]} color={color} />
      {/* Left side beam (sloped) */}
      <WoodBeam
        position={[-halfW + pt / 2, (frontH + backH) / 2 + beamThickness / 2, 0]}
        size={[pt, beamThickness, sideBeamLen]}
        color={color}
        rotation={[-slopeAngle, 0, 0]}
      />
      {/* Right side beam (sloped) */}
      <WoodBeam
        position={[halfW - pt / 2, (frontH + backH) / 2 + beamThickness / 2, 0]}
        size={[pt, beamThickness, sideBeamLen]}
        color={color}
        rotation={[-slopeAngle, 0, 0]}
      />

      {/* ─── Roof ─── */}
      {config.roofType === 'adjustable-louvers' ? (
        <LouverRoof
          rafterCount={config.rafterCount}
          louverAngle={config.louverAngle}
          w={w} d={d} h={h} pt={pt}
          beamThickness={beamThickness}
          slopeRise={slopeRise}
          color={color}
        />
      ) : (
        <PanelRoof
          roofType={config.roofType}
          rafterCount={config.rafterCount}
          w={w} d={d} h={h} pt={pt}
          beamThickness={beamThickness}
          slopeRise={slopeRise}
          color={color}
        />
      )}

      {/* ─── Walls ─── */}
      {(Object.keys(wallDefs) as Array<'left' | 'right' | 'front' | 'back'>).map((side) => {
        const wallType = config.walls[side]
        if (wallType === 'none') return null
        const def = wallDefs[side]
        return (
          <group key={side} position={def.pos} rotation={[0, def.rotY, 0]}>
            <WallRenderer
              type={wallType}
              width={def.width}
              height={def.height}
              pt={pt}
              color={color}
              louverAngle={config.wallLouverAngle}
            />
          </group>
        )
      })}
    </group>
  )
}
