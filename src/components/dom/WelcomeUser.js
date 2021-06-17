import { useEffect } from 'react'
import useStore from '@/helpers/store'
import { getMyInfo } from '@/spotifyClient'

export default function WelcomeUser() {
  const [set, user] = useStore((state) => [state.set, state.user])

  useEffect(() => {
    ;(async () => {
      set({ user: await getMyInfo() })
    })()
  }, [set])

  return (
    <div className='welcomeContainer'>
      <p>Hello {user?.display_name}</p>
    </div>
  )
}
