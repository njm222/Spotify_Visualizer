import { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import useStore from '@/helpers/store'
import { sdkInit } from '@/spotifyClient'

export default function Player() {
  const [set, playerState] = useStore((state) => [
    state.set,
    state.player.playerState,
  ])
  console.log(playerState)
  const timerRef = useRef()
  const delay = useRef(0)

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

  // useEffect(() => {
  //   if (!playerState) {
  //     return
  //   }

  //   if (playerState?.paused) {
  //     // clear timeout
  //     clearInterval(timerRef)
  //     return
  //   }

  //   timerRef.current = setInterval(() => {
  //     delay.current = new Date().getTime() - delay.current
  //     set({
  //       player: {
  //         playerState: {
  //           ...playerState,
  //           position: playerState.position + delay.current,
  //         },
  //       },
  //     })
  //   }, 10)
  // }, [playerState, set])

  const progressBarStyles = useMemo(
    () => ({
      width: (playerState?.position * 100) / playerState?.duration + '%',
    }),
    [playerState?.position, playerState?.duration]
  )

  return playerState ? (
    <div className='playerContainer'>
      <div className='playerLeft'>
        <Image
          width={'50px'}
          height={'50px'}
          alt={'album art'}
          src={playerState?.track_window.current_track.album.images[0].url}
        />
        <div className='trackInfo'>
          <div className='trackName'>
            {playerState?.track_window.current_track.name}
          </div>
          <div className='trackArtist'>
            {playerState?.track_window.current_track.artists[0].name}
          </div>
        </div>
      </div>
      <div className='playerCenter'>
        <div className='playerControls'>
          {playerState?.is_playing ? 'Playing' : 'Paused'}
        </div>
        <div className='progress'>
          <div className='progress__bar' style={progressBarStyles} />
        </div>
      </div>
      <div className='playerRight'></div>
    </div>
  ) : null
}
