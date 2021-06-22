import { useEffect } from 'react'
import useStore from '@/helpers/store'
import dynamic from 'next/dynamic'
import { setAccessToken } from '@/spotifyClient'

const WelcomeUser = dynamic(() => import('@/components/dom/WelcomeUser'), {
  ssr: false,
})

const VisualizerPreview = dynamic(
  () => import('@/components/canvas/VisualizerPreview'),
  {
    ssr: false,
  }
)

const Playlists = dynamic(
  () => import('@/components/dom/playlists/Playlists'),
  {
    ssr: false,
  }
)

const Player = dynamic(() => import('@/components/dom/player/Player'), {
  ssr: false,
})

const Page = () => {
  const [set, isVisualizer] = useStore((state) => [
    state.set,
    state.isVisualizer,
  ])

  useEffect(() => {
    set({ title: 'Dashboard', orbitControls: true })
    // get and store tokens from query string
    const searchParams = new URLSearchParams(window.location.search)
    setAccessToken(searchParams.get('access_token'))
    set({
      accessToken: searchParams.get('access_token'),
      refreshToken: searchParams.get('refresh_token'),
    })
  }, [set])

  return (
    <>
      {!isVisualizer && (
        <>
          <WelcomeUser />
          {/* <Playlists /> */}
        </>
      )}
      <Player />
      <VisualizerPreview r3f />
    </>
  )
}

export default Page
