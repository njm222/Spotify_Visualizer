import SpotifyWebApi from 'spotify-web-api-js'
import useStore from '@/helpers/store'

const spotifyClient = new SpotifyWebApi()

export const setAccessToken = (accessToken) => {
  spotifyClient.setAccessToken(accessToken)
}

export const getMyInfo = async () => {
  const results = await spotifyClient.getMe()
  return results
}

export const getUserPlaylists = async (userId) => {
  const results = await spotifyClient.getUserPlaylists(userId)
  return results
}

export const getTrackAnalysis = async (trackId) => {
  const results = await spotifyClient.getAudioAnalysisForTrack(trackId)
  return results
}

export const getTrackFeatures = async (trackId) => {
  const results = await spotifyClient.getAudioFeaturesForTrack(trackId)
  return results
}

/* -------- PLAYER -------- */

export const sdkInit = () => {
  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new window.Spotify.Player({
      name: 'Visualizer Player',
      getOAuthToken: (cb) => {
        cb(spotifyClient.getAccessToken())
      },
    })
    addPlayerListeners(player)
    player.connect()
  }
}

const addPlayerListeners = (player) => {
  player.addListener('initialization_error', (data) => {
    console.log('initialization_error')
    console.log(data)
  })
  player.addListener('authentication_error', (data) => {
    console.log('authentication_error')
    console.log(data)
  })
  player.addListener('account_error', (data) => {
    console.log('account_error')
    console.log(data)
  })
  player.addListener('playback_error', (data) => {
    console.log('playback_error')
    console.log(data) // TODO: change these to toast messages
  })
  player.addListener('ready', (data) => {
    console.log('Ready with deviceID ', data.device_id)
    spotifyClient.transferMyPlayback([data.device_id])
    .then(() => spotifyClient.play({device_id: data.device_id}))
  })
  player.addListener('player_state_changed', async (data) => {
    console.log('player state changed')
    const playerState = data
    const trackId = data?.track_window.current_track.id
    if (trackId !== useStore.getState().player.lastPlayed) {
      const analysis = await getTrackAnalysis(trackId)
      const features = await getTrackFeatures(trackId)

      useStore.getState().spotifyAnalyzer.setData(analysis)
      useStore.setState({
        spotifyFeatures: features,
        player: {
          playerState,
          lastPlayed: trackId,
        },
      })
      // send trackId and artistsId to firestore
      // send trackId as lastPlayed under /users/{uid} (should this be there for this release?)
      return
    }
    useStore.setState((state) => ({
      player: {
        ...state.player,
        playerState,
      },
    }))
  })
}

/* -------- PLAYER CONTROLS -------- */

export const playTrack = async (trackId = null) => {
  const results = await spotifyClient.play(trackId)
  return results
}

export const pausePlayer = async () => {
  const results = await spotifyClient.pause()
  return results
}

export const nextTrack = async () => {
  const results = await spotifyClient.skipToNext()
  return results
}

export const prevTrack = async () => {
  const results = await spotifyClient.skipToPrevious()
  return results
}
