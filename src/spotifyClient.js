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