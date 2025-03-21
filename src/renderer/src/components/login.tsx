import { useEffect, useRef } from 'react'
import { trpc } from '../../utils/trpc'
import { useState } from 'react'
export function Login(): JSX.Element {
  const [LoginResponse, setLoginResponse] = useState(-1)

  const inputRef = useRef({
    username: 'testbot12345',
    password: '123'
  })

  const loginResultCodes = new Map<number, string>([
    //set by me lel
    [-1, ''],
    //set by API (LobbyClient/Protocol in zk infra)
    [0, 'Login Successful!'],
    [1, 'Invalid Name'],
    [2, 'Invalid Password'],
    [4, 'Ban hammeur']
  ])

  function parseResultCode(number): string {
    return loginResultCodes.get(number) ?? `IDK the result... code: ${number}`
  }
  const login = trpc.login.useMutation()
  const register = trpc.register.useMutation()
  const loginResult = trpc.getLoginCode.useQuery()
  console.log('rerender?')
  useEffect(() => {
    window.api.mountListener('LoginUpdate', () => {
      loginResult.refetch()
    })
  }, [])
  return (
    <div className="rounded bg-black/5 w-[fit-content] p-2">
      <p className="text-2xl text-center font-bold">Login</p>

      <p>Username</p>
      <input
        name="userName"
        className="bg-black/10 transition-color duration-300 hover:bg-black/15 m-2 p-1 px-2"
        onChange={(e) => {
          inputRef.current.username = e.target.value
        }}
        defaultValue={inputRef.current.username}
      />
      <div>
        <p>Password</p>
        <input
          name="password"
          className="bg-black/10 transition-color duration-300 hover:bg-black/15 m-2 p-1 px-2 "
          onChange={(e) => {
            inputRef.current.password = e.target.value
          }}
          defaultValue={inputRef.current.password}
        />
      </div>
      <div className="flex justify-center my-2">
        <button
          //type="submit"
          className="bg-black/10 transition-color duration-300 font-semibold hover:bg-black/15 p-1 px-2 rounded m-1"
          onClick={() => {
            login.mutate(inputRef.current)
          }}
        >
          Login
        </button>

        <button
          //type="submit"
          className="bg-black/10 transition-color duration-300 font-semibold hover:bg-black/15 p-1 px-2 rounded m-1"
          onClick={() => {
            register.mutate(inputRef.current)
          }}
        >
          Register
        </button>
      </div>
      <div className="flex justify-center">
        {loginResult.isSuccess ? parseResultCode(loginResult.data) : ' '}
      </div>
    </div>
  )
}
