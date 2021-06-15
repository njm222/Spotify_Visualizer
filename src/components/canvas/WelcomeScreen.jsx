import { useState, useEffect, memo, Suspense } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import Text from './Text'

const WelcomeScreen = ({userId}) => {
  const camera = useThree((state) => state.camera)

  const [clicked, setClicked] = useState(false)
  
  useEffect(() => {
    camera.position.z = 1000
  }, [])

  useFrame((state) => {
    
  })

  const setPointer = (value) => {
    document.documentElement.style.cursor = value ? 'pointer' : 'unset';
  }
  
  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.8} />
      <directionalLight castShadow position={[2.5, 12, 12]} intensity={4} />
      <pointLight position={[20, 20, 20]} />
      <pointLight position={[-20, -20, -20]} intensity={5} />
      <Stars
        radius={10}
        depth={50}
        count={1000}
        factor={4}
        saturation={0}
        fade
      />
      <Text
        size={10}
        vAlign="top"
        onClick={() => setClicked(true)}
        onPointerEnter={() => setPointer(true)}
        onPointerLeave={() => setPointer(false)}
      >
        {`hello ${userId}`}
      </Text>
    </Suspense>
  )
}

export default memo(WelcomeScreen)
