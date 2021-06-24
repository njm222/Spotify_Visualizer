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

  const sectionTempo = useStore((state) => state.spotifyAnalyzer?.section.tempo)
  // Animate the z value of each vertex in the terrain grid using a noise function
  useFrame((state, delta) => {
    // Set the variables for simplex
    const nAmplitude = Math.max(useStore.getState().audioAnalyzer?.avFreq / 150, 0.1)
    const nScale = 2 - useStore.getState().spotifyFeatures?.energy - useStore.getState().spotifyFeatures?.danceability 
    
    // Get a reference of the terrain grid's geometry
    const terrainGeometry = terrainGeometryRef.current

    // Get the terrain vertices
    const { position } = terrainGeometry.attributes

    // Get the current time
    const time = state.clock.getElapsedTime() * (sectionTempo / 500) + nScale

    // For each vertex set the position on the z-axis based on the noise function
    for (let i = 0; i < position.count; i++) {
      const z = simplexNoise.noise3D(position.getX(i) / nScale, position.getY(i) / nScale, time)
      position.setZ(i, z * nAmplitude)
    }

    // Update the vertices
    position.needsUpdate = true
    terrainGeometry.computeVertexNormals()
    terrainGeometry.normalsNeedUpdate = true

    // Update the material colour
    terrainMaterialRef.current.color.lerp(new THREE.Color(getColour()), delta * 2)

    // Switch wireframe on every bar
    terrainMaterialRef.current.wireframe = useStore.getState().spotifyAnalyzer?.beatCounter % 2 === 0
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
