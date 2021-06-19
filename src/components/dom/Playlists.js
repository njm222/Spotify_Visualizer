import { useEffect, useState } from 'react'
import useStore from '@/helpers/store'
import { getUserPlaylists } from '@/spotifyClient'

export default function Playlists() {
  const [myPlaylists, setMyPlaylists] = useState([])

  useEffect(() => {
    ;(async () => {
      // set({ user: await getMyInfo() })
      const playlists = await getUserPlaylists()
      console.log(playlists)
      setMyPlaylists(playlists.items)
    })()
  }, [setMyPlaylists])

  console.log(myPlaylists)

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
