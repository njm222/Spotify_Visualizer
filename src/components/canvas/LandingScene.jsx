import { useState, useEffect, memo, Suspense } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import Text from './Text'

const LandingScene = () => {
  const camera = useThree((state) => state.camera)

  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    camera.position.z = 41
  }, [])

  useFrame((state) => {
    if (clicked && camera.position.z > 0.1) {
      camera.position.z -= 0.5 // TODO: lerp camera position
    } else if (clicked) {
      console.log('done')
      setClicked(false)
      fetch('http://localhost:8888/login', { credentials: 'include' })
        .then((response) => response.json())
        .then(({ uri }) => {
          window.location = uri
        })
    }
  })

  const setPointer = (value) => {
    document.documentElement.style.cursor = value ? 'pointer' : 'unset'
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
        onPointerDown={() => setClicked(true)}
        onPointerEnter={() => setPointer(true)}
        onPointerLeave={() => setPointer(false)}
      >
        tessellator
      </Text>
    </Suspense>
  )
}

export default memo(LandingScene)
