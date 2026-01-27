import { useRef } from 'react'
import { useAuth } from '../store/appStore'
import { useActions } from '../hooks/useActions'

export function Login(): JSX.Element {
  const inputRef = useRef({
    username: 'testbot12345',
    password: '123'
  })

  const { login, isLoggingIn } = useActions()
  const auth = useAuth()

  console.log('rerender?')

  return (
    <div className="rounded bg-neutral-950/50 shadow-[inset_0px_0px_40px_0px_rgba(255,255,255,.05)] backdrop-blur-xl text-neutral-200 font-chakra-petch w-[fit-content] p-2">
      <p className="rounded text-neutral-200 font-chakra-petch text-2xl text-center font-thin">
        Login
      </p>

      <p>Username</p>
      <input
        name="userName"
        className="bg-white/1 shadow-[inset_0px_0px_40px_0px_rgba(255,255,255,.05)] rounded transition-color duration-300 hover:bg-white/5 m-2 p-1 px-2"
        onChange={(e) => {
          inputRef.current.username = e.target.value
        }}
        defaultValue={inputRef.current.username}
      />
      <div>
        <p>Password</p>
        <input
          name="password"
          type="password"
          className="bg-white/1 shadow-[inset_0px_0px_40px_0px_rgba(255,255,255,.05)] rounded transition-color duration-300 hover:bg-white/5 m-2 p-1 px-2"
          onChange={(e) => {
            inputRef.current.password = e.target.value
          }}
          defaultValue={inputRef.current.password}
        />
      </div>
      <div className="flex justify-center my-2">
        <button
          disabled={isLoggingIn}
          className="bg-white/1 shadow-[inset_0px_0px_40px_0px_rgba(255,255,255,.05)] transition-color duration-300 p-2 px-4 font-light hover:bg-white/5 rounded m-1 disabled:opacity-50"
          onClick={() => {
            console.log('login clicked')
            login(inputRef.current.username, inputRef.current.password)
          }}
        >
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      </div>
      <div className="flex justify-center">
        {auth.loggedIn && <span className="text-green-400">Logged in as {auth.username}</span>}
      </div>
      <div>{auth.loginMessage}</div>
    </div>
  )
}
