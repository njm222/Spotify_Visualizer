import SpotifyWebApi from 'spotify-web-api-js'

const spotifyClient = new SpotifyWebApi()

export const setAccessToken = (accessToken) => {
  spotifyClient.setAccessToken(accessToken)
}

export const getMyInfo = async () => {
  const results = await spotifyClient.getMe()
  return results
}
