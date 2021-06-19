import { useEffect, useState } from 'react'
import useStore from '@/helpers/store'
import { sdkInit } from '@/spotifyClient'

export default function Player() {
  const [myPlaylists, setMyPlaylists] = useState([])

  useEffect(() => {
    if (!document.getElementById('spotify-sdk')) {
      const sdk = document.createElement('script')
      sdk.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js')
      sdk.id = 'spotify-sdk'
      sdk.async = true
      sdkInit()
      document.head.appendChild(sdk)
    }
  }, [])

  return (
    <div className='player-container'>
      <div className='player-bar'>bar</div>
    </div>
  )
}
