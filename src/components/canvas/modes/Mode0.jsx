import { useEffect, useRef } from 'react'
import {Color} from 'three'
import { useFrame } from "@react-three/fiber";
import getColour from '@/helpers/getColour';
import useStore from '@/helpers/store'

const Mode0 = () => {
  const colour = useRef('hotpink')
  const material = useRef()

  useFrame((state, delta) => {
    material.current.color = new Color(getColour())
  })
  return (
    <>
      <mesh rotation={[Math.PI / 3, Math.PI / 3, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial ref={material} color='hotpink' />
      </mesh>
    </>
  )
}

export default Mode0
