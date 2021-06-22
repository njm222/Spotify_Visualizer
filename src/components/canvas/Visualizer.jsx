import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import AudioAnalyzer from '@/helpers/AudioAnalyzer'
import Mode1 from './modes/Mode1'
import Mode2 from './modes/Mode2'

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

const Visualizer = () => {
  const analyzer = useRef()

  useEffect(() => {
    analyzer.current = new AudioAnalyzer()
  }, [])

  useFrame((state) => {
    analyzer.current.getData()
  })

  const renderMode = (mode) => {
    switch (mode) {
      case 1:
        return <Mode1 />
      case 2:
        return <Mode2 />
      default:
        return <Mode1 />
    }
  }

  return (
    <>
      <Lights />
      {renderMode(1)}
    </>
  )
}

export default Visualizer
