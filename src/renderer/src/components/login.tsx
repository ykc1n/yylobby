import { useRef } from 'react'

function login(logindata): void {
  console.log('logging in!')
  console.log(logindata)
  window.api.sendLogin(logindata)
}

function register(registerdata): void {
  console.log('registering!')
  console.log(registerdata)
  window.api.sendRegister(registerdata)
}

export function Login(): JSX.Element {
  const inputRef = useRef({
    username: 'testbot123',
    password: '123'
  })

  console.log('rerender?')
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
            login(inputRef.current)
          }}
        >
          Login
        </button>

        <button
          //type="submit"
          className="bg-black/10 transition-color duration-300 font-semibold hover:bg-black/15 p-1 px-2 rounded m-1"
          onClick={() => {
            register(inputRef.current)
          }}
        >
          Register
        </button>
      </div>
    </div>
  )
}
