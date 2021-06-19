import create from 'zustand'

const useStore = create((set) => {
  return {
    set,
    router: {},
    dom: null,
    isVisualizer: false,
  }
})

export default useStore
