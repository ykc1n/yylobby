//import Versions from './components/Versions'
//import electronLogo from './assets/electron.svg'
import { useState, useEffect } from 'react'
import { Login } from './components/login'
import { trpc } from '../utils/trpc'

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
      <div className="bg-white'">
        <div className="flex mx-4">
          <div className="text-4xl">yylobby</div>
        </div>
        {welcomeMessage.isSuccess ? Welcome(welcomeMessage.data) : 'Loading...'}
        <div className="flex justify-center py-2">
          <Login />
        </div>

        <div className="flex justify-center mx-6 py-2"></div>
      </div>
    </>
  )
}
export default App
