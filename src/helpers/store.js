import create from 'zustand'
import SpotifyAnalyzer from '@/helpers/SpotifyAnalyzer'

const useStore = create((set) => {
  return {
    set,
    router: {},
    dom: null,
    orbitControls: false,
    accessToken: null,
    refreshToken: null,
    isVisualizer: false,
    colourKey: 1,
    modeKey: 0,
    audioAnalyzer: null,
    spotifyAnalyzer: new SpotifyAnalyzer(),
    spotifyFeatures: null,
    player: {
      lastPlayed: null,
      playerState: null,
    },
  }
})

export default useStore
