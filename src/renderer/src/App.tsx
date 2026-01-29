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
import lobbyBg from './assets/lol.png'

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
  const { login, isLoggingIn } = useActions()
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError('')
    try {
      const result = await login(username, password)
      if (result.ResultCode === 0) {
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
      <div className="relative bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-xl w-full max-w-sm p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-normal tracking-wide text-white mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5 tracking-wide uppercase">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="Enter username"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-1.5 tracking-wide uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || !username || !password}
            className={`w-full py-2.5 ${theme.bg} ${theme.bgHover} text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed`}
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
        <span className="text-sm font-normal tracking-wide text-neutral-300">{auth.username}</span>
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
      <span className="text-xs font-normal text-neutral-400 uppercase tracking-[0.12em]">Login</span>
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
      className={`flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-200 ${
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
        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
          isOnline
            ? 'bg-emerald-400'
            : isConnectingState
              ? 'bg-amber-400 animate-pulse'
              : 'bg-red-400'
        }`}
      />
      <span
        className={`text-xs font-normal tracking-[0.1em] uppercase ${
          isOnline
            ? 'text-emerald-400/80'
            : isConnectingState
              ? 'text-amber-400/80'
              : 'text-red-400/80'
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
      return `relative px-5 py-3 text-sm font-normal tracking-[0.12em] uppercase transition-all duration-200 ${theme.text} after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-px after:bg-current after:opacity-60`
    }
    return 'relative px-5 py-3 text-sm font-normal tracking-[0.12em] uppercase transition-all duration-200 text-neutral-500 hover:text-neutral-300'
  }

  return (
    <HashRouter>
      <div className="dark min-h-[100vh] bg-neutral-950 bg-cover bg-center bg-no-repeat text-white" style={{ backgroundImage: `url(${lobbyBg})` }}>
        <div className="bg-white/[0.02] backdrop-blur-2xl border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/Singleplayer" className={navLinkClass}>
              Singleplayer
            </NavLink>
            <NavLink to="/Multiplayer" className={navLinkClass}>
              Multiplayer
            </NavLink>
          </div>

          <div className="flex items-center gap-3 px-4">
            <ProfileButton onLoginClick={() => setShowLoginModal(true)} />
            <div className="w-px h-5 bg-white/10" />
            <ConnectionIndicator />
            <div className="w-px h-5 bg-white/10" />
            <NavLink
              to="/Settings"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-normal tracking-[0.12em] uppercase transition-all duration-200
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
