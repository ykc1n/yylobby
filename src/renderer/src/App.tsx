//import Versions from './components/Versions'
//import electronLogo from './assets/electron.svg'
import { useState, useEffect } from 'react'
import { Login } from './components/login'
import HomePage from './pages/homepage'
import { LobbyStore, useLobby } from './lobbyClient'
import BattleList from './BattleList'
import Chat from './Chat'
console.log('App loaded!')


function Welcome(): JSX.Element {
  //const data = JSON.pars
  const lobby = LobbyStore(state=>state)
  // const engine = useLobby((state)=>state.Engine)
  // const game = useLobby((state)=>state.Game)
  // const userCount = useLobby((state)=>state.UserCount)

  return (
    <>
      {/* <div className="text-2xl">Welcome!</div> */}
      <div className="flex text-white gap-8">
        <div>{lobby.Engine}</div>

        <div>{lobby.Game}</div>

        <div>Users Online: {lobby.UserCount}</div>
      </div>
    </>
  )
}

function App(): JSX.Element {
 const lobby = useLobby()
 
  return (
    <>
      <div className="min-h-[100vh] bg-[url(./halloween.png)] bg-cover bg-center  bg-no-repeat font-chakra-petch text-white">
        <div className="  bg-neutral-950/70 bg-[url(./ophex.svg)] backdrop-blur-xl grid grid-cols-2  justify-between">
          <div className="flex  ">
            <button className="font-chakra-petch text-xl p-3 hover:text-white font-thin text-neutral-400 transition-all duration-300 hover:bg-black/20">
              Home
            </button>

            <button className="font-chakra-petch shadow-[inset_0px_0px_30px_0px_rgba(255,255,255,.03)] hover:shadow-[inset_0px_0px_30px_0px_rgba(255,255,255,.1)] text-xl font-thin text-neutral-400  border-neutral-400 p-3 transition-all duration-300 hover:text-white">
              {' '}
              Multiplayer{' '}
            </button>

            <button className="font-chakra-petch  shadow-[inset_0px_0px_30px_0px_rgba(255,255,255,.03)] hover:shadow-[inset_0px_0px_30px_0px_rgba(255,255,255,.1)]  text-xl font-regular text-neutral-400  border-neutral-400 p-1 transition-all duration-300 hover:text-white">
              {' '}
              Singleplayer{' '}
            </button>
          </div>

          <div className="flex justify-self-end px-8">
            <button className="font-chakra-petch text-xl font-thin text-neutral-400 font-semibold justify-self-end">
              Settings
            </button>
          </div>
        </div>
        <div className="">
          <Welcome/> 
          {/* <div className="flex justify-center py-2">{lobby.LoggedIn ? ' ' : <Login />}</div> */}
          <div className='grid grid-cols-3'>
            <div className="col-span-2">    
          <BattleList/>
          </div>  
          <Chat/> 
          </div>
          <HomePage />
        </div>
      </div>
    </>
  )
}
export default App
