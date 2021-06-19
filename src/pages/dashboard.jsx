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

const Playlists = dynamic(() => import('@/components/dom/Playlists'), {
  ssr: false,
})

const Player = dynamic(() => import('@/components/dom/Player'), {
  ssr: false,
})

const Page = () => {
  const set = useStore((state) => state.set)

  useEffect(() => {
    set({ title: 'Dashboard' })
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
      <WelcomeUser />
      {/* <Playlists /> */}
      <Player />
      <VisualizerPreview r3f />
    </>
  )
}

export default Page
