import SpotifyWebApi from 'spotify-web-api-js'

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
    console.log(data)
  })
  player.addListener('ready', (data) => {
    console.log('Ready with deviceID ', data.device_id)
    spotifyClient.transferMyPlayback([data.device_id]).then(() => {
      spotifyClient.play({
        device_id: data.device_id,
        position_ms: 0,
      })
    })
    // this.$store.commit('mutateDeviceID', data.device_id)
    // this.playRandomTrack(data.device_id)
    // this.switchPlayer(data.device_id)
  })
  player.addListener('player_state_changed', (data) => {
    console.log('player state changed')
    console.log(data)
    // this.$store.commit('mutatePlayerInfo', data)
    // if (data && data.track_window.current_track.id !== this.prevTrackID) {
    //   this.getPlayerTrack()
    // }
  })
}
