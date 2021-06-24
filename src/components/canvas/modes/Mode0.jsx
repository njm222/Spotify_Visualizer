import React, { useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import simplex from "simplex-noise";
import * as THREE from "three";
import getColour from '@/helpers/getColour';
import useStore from '@/helpers/store'

const simplexNoise = new simplex(Math.round(Math.random() * 1000));

const Terrain = () => {
  // Get reference of the terrain
  const terrainGeometryRef = useRef()
  const terrainMaterialRef = useRef()

  // Set the grid size and resolution
  const size = [10, 10]
  const res = [512, 512]

  // Set the noise variables TODO: come from props
  const nTimeStretch = 4

  // Animate the z value of each vertex in the terrain grid using a noise function
  useFrame((state, delta) => {
    const nAmplitude = Math.max(useStore.getState().audioAnalyzer?.avFreq / 100, 0.1)
    const nScale = Math.max(useStore.getState().audioAnalyzer?.midsObject.energy * (useStore.getState().spotifyFeatures?.danceability / 5), 64)
    // Get a reference of the terrain grid's geometry
    const terrainGeometry = terrainGeometryRef.current

    // Get the terrain vertices
    const { position } = terrainGeometry.attributes

    // Get the current time
    const time = state.clock.getElapsedTime() / nTimeStretch
    const time2 = state.clock.getElapsedTime() + nScale

    // For each vertex set the position on the z-axis based on the noise function
    for (let i = 0; i < position.count; i++) {
      const z = simplexNoise.noise3D(position.getX(i), position.getY(i), time, time2)
      position.setZ(i, z * nAmplitude)
    }

    // Update the vertices
    position.needsUpdate = true
    terrainGeometry.computeVertexNormals()
    terrainGeometry.normalsNeedUpdate = true

    // Update the material colour
    terrainMaterialRef.current.color.lerp(new THREE.Color(getColour()), delta * 2)
  })

  return (
    <mesh receiveShadow rotation={[-Math.PI/4, 0, 0]}>
      <planeBufferGeometry attach="geometry" args={[...size, ...res]} ref={terrainGeometryRef} />
      <meshLambertMaterial attach="material" color={'hotpink'} ref={terrainMaterialRef} />
    </mesh>
  )
}

const Mode0 = () => {
  console.log('mode0')
  return (
    <>
      <Terrain />
    </>
  )
}

export default memo(Mode0)
