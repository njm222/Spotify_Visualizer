const Mode1 = () => {
  return (
    <>
      <mesh rotation={[Math.PI / 3, Math.PI / 3, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={'hotpink'} />
      </mesh>
    </>
  )
}

export default Mode1
