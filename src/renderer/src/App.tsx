import { useState } from 'react'
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/homepage'
import MultiplayerPage from './MultiplayerPage'
import SingleplayerPage from './SingleplayerPage'
import SettingsPage from './pages/SettingsPage'
import { useThemeStore, themeColors } from './themeStore'
import { useStateSync } from './hooks/useStateSync'
import { useConnectionStatus, useAuth } from './store/appStore'
import { useActions } from './hooks/useActions'

console.log('App loaded!')

function LoginModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}): JSX.Element | null {
  const [username, setUsername] = useState('testbot12345')
  const [password, setPassword] = useState('123')
  const [error, setError] = useState('')
  const { login, isLoggingIn, joinChannel } = useActions()
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError('')
    try {
      const result = await login(username, password)
      if (result.ResultCode === 0) {
        joinChannel('#zk')
        onClose()
      } else {
        setError(result.Message || 'Login failed')
      }
    } catch (err) {
      setError('Login failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-neutral-900 border border-neutral-700/50 rounded-lg shadow-2xl w-full max-w-sm p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
              placeholder="Enter username"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || !username || !password}
            className={`w-full py-2.5 ${theme.bg} ${theme.bgHover} text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ProfileButton({ onLoginClick }: { onLoginClick: () => void }): JSX.Element {
  const auth = useAuth()
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  if (auth.loggedIn) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5" title={`Logged in as ${auth.username}`}>
        <div className={`w-7 h-7 rounded-full ${theme.bgSubtle} flex items-center justify-center`}>
          <svg className={`w-4 h-4 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span className="text-xs font-medium text-neutral-300">{auth.username}</span>
      </div>
    )
  }

  return (
    <button
      onClick={onLoginClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-200 hover:bg-white/5"
    >
      <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Login</span>
    </button>
  )
}

function ConnectionIndicator(): JSX.Element {
  const status = useConnectionStatus()
  const { connect, isConnecting } = useActions()

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

  const [showLoginModal, setShowLoginModal] = useState(false)
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
            <ProfileButton onLoginClick={() => setShowLoginModal(true)} />
            <div className="w-px h-6 bg-neutral-700/50" />
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

        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
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
