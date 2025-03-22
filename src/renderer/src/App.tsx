//import Versions from './components/Versions'
//import electronLogo from './assets/electron.svg'
import { useState, useEffect } from 'react'
import { Login } from './components/login'
import { trpc } from '../utils/trpc'
import HomePage from './pages/homepage'
console.log('App loaded!')

function Welcome(props: { Engine: string; Game: string; UserCount: string }): JSX.Element {
  //const data = JSON.parse

  return (
    <>
      <div className="text-2xl">Welcome!</div>
      <div className="flex ">
        <div>{props.Engine}</div>

        <div>{props.Game}</div>

        <div>Users Online: {props.UserCount}</div>
      </div>
    </>
  )
}

function App(): JSX.Element {
  const [LoggedIn] = useState(true)
  //const connectionStatus = trpc.getConnection.useQuery()
  const welcomeMessage = trpc.welcome.useQuery(undefined, {
    enabled: true
  })
  useEffect(() => {
    window.api.mountListener('Welcome', (data) => {
      console.log('test!!!')
      console.log(data)
      welcomeMessage.refetch()
    })
    return () => {
      window.api.unmountListeners()
    }
  }, [])

  useEffect(() => {
    window.api.mountListener('LoginResponse', (data) => {})
    return () => {
      window.api.unmountListeners()
    }
  }, [])
  return (
    <>
      <div className="min-h-[100vh] bg-[url(./cabinlob.png)] bg-cover bg-no-repeat">
        <div className=" bg-neutral-950/50 backdrop-blur-lg grid grid-cols-3  justify-between">
          <div className="flex">
            <button className="font-chakra-petch font- text-xl font-thin text-neutral-400  border-neutral-400 p-3 transition-all duration-300 hover:text-white">
              {' '}
              Multiplayer{' '}
            </button>

            <button className="font-chakra-petch text-xl font-regular text-neutral-400  border-neutral-400 p-1 transition-all duration-300 hover:text-white">
              {' '}
              Singleplayer{' '}
            </button>
          </div>

          <div className="flex justify-self-center">
            <button className="font-chakra-petch text-4xl font-thin text-neutral-400 transition-all duration-300 hover:bg-black/20">
              Home
            </button>
          </div>

          <div className="flex justify-self-end px-8">
            <button className="font-chakra-petch text-xl font-thin text-neutral-400 font-semibold justify-self-end">
              Settings
            </button>
          </div>
        </div>
        <div className="">
          <div className="flex justify-center py-2">{LoggedIn ? ' ' : <Login />}</div>

          <HomePage />
        </div>
      </div>
    </>
  )
}
export default App
