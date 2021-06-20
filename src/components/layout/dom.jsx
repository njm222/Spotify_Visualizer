import useStore from '@/helpers/store'
import { useRef, useEffect } from 'react'

const Dom = ({ children }) => {
  const ref = useRef(null)
  const orbitControls = useStore((state) => state.orbitControls)

  useEffect(() => {
    useStore.setState({ dom: ref })
  }, [])

  return (
    <div
      className={`domContainer ${orbitControls ? 'orbitControls' : ''}`}
      ref={ref}
    >
      {children}
    </div>
  )
}

export default Dom
