import { Suspense, memo } from 'react'
import { OrbitControls } from '@react-three/drei'
import Portal from './Portal'

function Lights() {
  return (
    <>
      <color attach='background' args={['#f0f0f0']} />
      <ambientLight intensity={1} />
      <pointLight position={[20, 30, 10]} />
      <pointLight position={[-10, -10, -10]} color='blue' />
    </>
  )
}

const VisualizerPreview = () => {
  return (
    <>
      <OrbitControls />
      <Lights />
      <Suspense fallback={null}>
        <Portal>
          <Lights />
          <mesh rotation={[Math.PI / 3, Math.PI / 3, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={'hotpink'} />
          </mesh>
        </Portal>
        <mesh position={[-1, -1, 2]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={'green'} />
        </mesh>
      </Suspense>
    </>
  )
}

export default memo(VisualizerPreview)
