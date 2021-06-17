import create from 'zustand'

const useStore = create((set) => {
  return {
    set,
    router: {},
    dom: null,
  }
})

export default useStore
