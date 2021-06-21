import { useState } from 'react'
export default function IconButton({ title, icon, onClick }) {
  const [hover, setHover] = useState(false)

  return (
    <button
      title={title}
      className={`iconButton ${hover ? 'hover' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {icon}
    </button>
  )
}
