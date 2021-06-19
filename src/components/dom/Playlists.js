import { useEffect, useState } from 'react'
import { getUserPlaylists } from '@/spotifyClient'

export default function Playlists() {
  const [myPlaylists, setMyPlaylists] = useState([])

  useEffect(() => {
    ;(async () => {
      const playlists = await getUserPlaylists()
      setMyPlaylists(playlists.items)
    })()
  }, [setMyPlaylists])

  return (
    <div className='myPlaylists'>
      {myPlaylists.map((playlist) => (
        <Playlist key={playlist.id} {...playlist} />
      ))}
    </div>
  )
}

const Playlist = (props) => {
  const [hovered, setHovered] = useState(false)
  console.log(props)
  return (
    <div className='playlist'>
      <img src={props.images[0]?.url}></img>
      <h6>{props.name}</h6>
    </div>
  )
}
