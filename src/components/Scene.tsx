import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import Pergola from './Pergola'
import Ground from './Ground'

export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [6, 4, 6], fov: 45 }}
      gl={{ antialias: true, toneMapping: 3 }}
    >
      <color attach="background" args={['#b8d4e3']} />
      <fog attach="fog" args={['#b8d4e3', 15, 30]} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[8, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <Pergola />
      <Ground />
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={15}
        blur={2}
        far={5}
      />

      <Environment preset="sunset" />
      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.4, 0]}
      />
    </Canvas>
  )
}
