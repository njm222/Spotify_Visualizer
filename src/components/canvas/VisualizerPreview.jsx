import { Suspense, memo } from 'react'
import { OrbitControls } from '@react-three/drei'
import Portal from './Portal'
import Visualizer from './Visualizer'

const VisualizerPreview = () => {
  console.log('visualizerPreview')

  return (
    <>
      <OrbitControls />
      <Suspense fallback={null}>
        <Portal>
          <Visualizer />
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
