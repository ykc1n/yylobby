import { useRef } from 'react'
import { trpc } from '../../utils/trpc'
import { LobbyStore } from '@renderer/lobbyClient'
export function Login(): JSX.Element {
  const inputRef = useRef({
    username: 'testbot12345',
    password: '123'
  })



  const login = trpc.login.useMutation()
  const register = trpc.register.useMutation()
  const lobby = LobbyStore((state) => state)

  console.log('rerender?')

  return (
    
    <div className=" rounded bg-neutral-950/50 shadow-[inset_0px_0px_40px_0px_rgba(255,255,255,.05)] backdrop-blur-xl text-neutral-200 font-chakra-petch w-[fit-content] p-2">
      <p className="rounded text-neutral-200 font-chakra-petch text-2xl text-center font-thin">
        Login
      </p>
{/* {welcome.data?.length ? JSON.parse(welcome.data).Engine : "test" } */}

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
          className="bg-white/1 shadow-[inset_0px_0px_40px_0px_rgba(255,255,255,.05)] rounded transition-color duration-300 hover:bg-white/5 m-2 p-1 px-2 "
          onChange={(e) => {
            inputRef.current.password = e.target.value
          }}
          defaultValue={inputRef.current.password}
        />
      </div>
      <div className="flex justify-center my-2">
        <button
          //type="submit"
          className="bg-white/1 shadow-[inset_0px_0px_40px_0px_rgba(255,255,255,.05)] transition-color duration-300 p-2 px-4 font-light hover:bg-white/5 p-1 px-2 rounded m-1"
          onClick={() => {
            console.log("test")
            login.mutate(inputRef.current)
            //getMatchMakerSetup.mutate()
          }}
        >
          Login
        </button>

        <button
          //type="submit"
          className="bg-white/1 shadow-[inset_0px_0px_40px_0px_rgba(255,255,255,.05)] p-2 px-4 transition-color duration-300 font-light hover:bg-white/5 p-1 px-2 rounded m-1"
          onClick={() => {
            register.mutate(inputRef.current)
          }}
        >
          Register
        </button>
      </div>
      <div className="flex justify-center">
        {/* {loginResult.isSuccess ? parseResultCode(loginResult.data) : ' '} */}
      </div>
      <div>
       {lobby.LoginStatusMessage}
        {/* {getMatchMakerSetup.isSuccess ? ' W' : ' Loading...'} */}
      </div>
    </div>
  )
}
