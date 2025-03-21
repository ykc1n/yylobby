//import Versions from './components/Versions'
//import electronLogo from './assets/electron.svg'
import { useState, useEffect } from 'react'
import { Login } from './components/login'
import { trpcReact } from '../utils/trpc'

console.log('App loaded!')
const loginResultCodes = new Map<number, string>([
  //set by me lel
  [-1, ''],
  //set by API (LobbyClient/Protocol in zk infra)
  [0, 'Login Successful!'],
  [2, 'Invalid Name'],
  [3, 'Invalid Password'],
  [4, 'Ban hammeur']
])

function Welcome(props: { Engine: string; Game: string; UserCount: number }): JSX.Element {
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
  const [welcome, showWelcome] = useState(<></>)
  const [LoginResponse, setLoginResponse] = useState(-1)
  const hello = trpcReact.greeting.useQuery({ name: 'kcin' })
  const connectionStatus = trpcReact.getConnection.useQuery()
  useEffect(() => {
    window.api.mountListener('Welcome', (data) => {
      console.log('test!!!')
      console.log(data)
      showWelcome(
        Welcome({
          Engine: data.Engine,
          Game: data.Game,
          UserCount: data.UserCount
        })
      )
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
          <div className="text-4xl">yylobby v.0.0.01</div>
        </div>
        {welcome}
        {hello.isSuccess ? hello.data : 'Loading...'}
        {connectionStatus.isSuccess ? connectionStatus.data : 'Loading...'}
        <div className="flex justify-center py-2">
          <Login />
          <div>
            {' '}
            {loginResultCodes.has(LoginResponse)
              ? loginResultCodes.get(LoginResponse)
              : 'idk what happened dude'}{' '}
          </div>
        </div>

        <div className="flex justify-center mx-6 py-2"></div>
      </div>
    </>
  )
}
export default App
