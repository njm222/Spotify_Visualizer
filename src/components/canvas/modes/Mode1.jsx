import { useRef } from 'react'

const Mode1 = () => {
  const colour = useRef('hotpink');
  return (
    <>
      <mesh rotation={[Math.PI / 3, Math.PI / 3, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={colour.current} />
      </mesh>
    </>
  )
}

export default Mode1
