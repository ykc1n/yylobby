import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/homepage'
import MultiplayerPage from './MultiplayerPage'
import SingleplayerPage from './SingleplayerPage'
import SettingsPage from './pages/SettingsPage'
import { useThemeStore, themeColors } from './themeStore'
import { useStateSync } from './hooks/useStateSync'
import { useConnectionStatus } from './store/appStore'
import { useActions } from './hooks/useActions'

console.log('App loaded!')

function ConnectionIndicator(): JSX.Element {
  const status = useConnectionStatus()
  const { connect, isConnecting } = useActions()
  const themeColor = useThemeStore((state) => state.themeColor)

  const isOnline = status === 'connected'
  const isConnectingState = status === 'connecting' || isConnecting

  return (
    <button
      onClick={() => status === 'disconnected' && connect()}
      disabled={isConnectingState}
      className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-200 ${
        isOnline
          ? 'cursor-default'
          : isConnectingState
            ? 'cursor-wait'
            : 'hover:bg-white/5 cursor-pointer'
      }`}
      title={
        isOnline
          ? 'Connected to server'
          : isConnectingState
            ? 'Connecting...'
            : 'Click to connect'
      }
    >
      <span
        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
          isOnline
            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
            : isConnectingState
              ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)] animate-pulse'
              : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
        }`}
      />
      <span
        className={`text-xs font-medium uppercase tracking-wider ${
          isOnline
            ? 'text-green-400'
            : isConnectingState
              ? 'text-yellow-400'
              : 'text-red-400'
        }`}
      >
        {isOnline ? 'Online' : isConnectingState ? 'Connecting' : 'Offline'}
      </span>
    </button>
  )
}

function App(): JSX.Element {
  // Initialize state sync ONCE at root level
  useStateSync()

  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const navLinkClass = ({ isActive }: { isActive: boolean }): string => {
    if (isActive) {
      return `relative px-5 py-3 text-sm font-medium tracking-widest uppercase transition-all duration-300 ${theme.text} bg-${themeColor}-400/5 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-current after:to-transparent`
    }
    return 'relative px-5 py-3 text-sm font-medium tracking-widest uppercase transition-all duration-300 text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
  }

  return (
    <HashRouter>
      <div className="dark min-h-[100vh] bg-neutral-900 bg-cover bg-center bg-no-repeat font-[motiva-sans,sans-serif] text-white">
        <style>{`
          .nav-glow::after {
            box-shadow: 0 0 8px rgba(${theme.rgb}, 0.5);
          }
        `}</style>
        <div className="bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800/50 flex items-center justify-between">
          <div className="flex">
            <NavLink
              to="/"
              className={(props) => `${navLinkClass(props)} ${props.isActive ? 'nav-glow' : ''}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/Singleplayer"
              className={(props) => `${navLinkClass(props)} ${props.isActive ? 'nav-glow' : ''}`}
            >
              Singleplayer
            </NavLink>
            <NavLink
              to="/Multiplayer"
              className={(props) => `${navLinkClass(props)} ${props.isActive ? 'nav-glow' : ''}`}
            >
              Multiplayer
            </NavLink>
          </div>

          <div className="flex items-center gap-2 px-4">
            <ConnectionIndicator />
            <div className="w-px h-6 bg-neutral-700/50" />
            <NavLink
              to="/Settings"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-white/5 rounded
                ${isActive ? theme.text : 'text-neutral-500 hover:text-neutral-300'}`
              }
            >
              Settings
            </NavLink>
          </div>
        </div>
        <div className="">
          <Routes>
            <Route path="/Multiplayer" element={<MultiplayerPage />} />
            <Route path="/Singleplayer/*" element={<SingleplayerPage />} />
            <Route path="/Settings" element={<SettingsPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  )
}

export default App
