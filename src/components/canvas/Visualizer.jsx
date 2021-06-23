import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import useStore from '@/helpers/store'
import AudioAnalyzer from '@/helpers/AudioAnalyzer'
import Mode0 from './modes/Mode0'
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
  const [set, modeKey, audioAnalyzer, spotifyAnalyzer] = useStore((state) => [state.set, state.modeKey, state.audioAnalyzer, state.spotifyAnalyzer])

  useEffect(() => {
    set({audioAnalyzer: new AudioAnalyzer()})
  }, [])

  useFrame((state) => {
    audioAnalyzer?.updateData()
    spotifyAnalyzer?.updateData()
  })

  const renderMode = (mode) => {
    switch (mode) {
      case 0:
        return <Mode0 />
      case 1:
        return <Mode1 />
      case 2:
        return <Mode2 />
      default:
        return <Mode0 />
    }
  }

  return (
    <>
      <Lights />
      {renderMode(modeKey)}
    </>
  )
}

export default Visualizer
