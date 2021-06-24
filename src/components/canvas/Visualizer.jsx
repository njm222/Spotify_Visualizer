import { memo, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import AudioAnalyzer from '@/helpers/AudioAnalyzer'
import useStore from '@/helpers/store'
import Mode0 from './modes/Mode0'
import Mode1 from './modes/Mode1'
import Mode2 from './modes/Mode2'

function Lights() {
  return (
    <>
      <color attach='background' args={['#000']} />
      <ambientLight intensity={1} />
      <pointLight position={[20, 30, 10]} />
      <pointLight position={[-10, -10, -10]} />
    </>
  )
}

const Visualizer = () => {
  const set = useStore((state) => state.set)
  const modeKey = useStore((state) => state.modeKey)

  useEffect(() => {
    set({ audioAnalyzer: new AudioAnalyzer() })
  }, [])

  useFrame(() => {
    useStore.getState().audioAnalyzer?.updateData()
    useStore.getState().spotifyAnalyzer?.updateData()
  })

  const Mode = useMemo(() => {
    switch (modeKey) {
      case 0:
        return <Mode0 />
      case 1:
        return <Mode1 />
      case 2:
        return <Mode2 />
      default:
        return <Mode0 />
    }
  }, [modeKey])

  return (
    <>
      <Lights />
      {Mode}
    </>
  )
}

export default memo(Visualizer)
