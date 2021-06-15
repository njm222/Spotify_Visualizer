import useStore from '@/helpers/store'
import dynamic from 'next/dynamic'

const WelcomeScreen = dynamic(() => import('@/components/canvas/WelcomeScreen'), {
  ssr: false,
})

const Page = () => {
  useStore.setState({ title: 'Dashboard' })
  const userId = 'njm222'
  return (
    <>
      <WelcomeScreen r3f userId={userId} />
    </>
  )
}

export default Page
