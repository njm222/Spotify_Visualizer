import create from 'zustand'

const useStore = create((set) => {
  return {
    set,
    router: {},
    dom: null,
    accessToken: null,
    refreshToken: null,
    isVisualizer: false,
    player: {
      lastPlayed: null,
    },
  }
})

export default useStore
