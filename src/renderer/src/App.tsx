import { useEffect, useRef, useState } from 'react'
import { HashRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import HomePage from './pages/homepage'
import MultiplayerPage from './pages/multiplayer/MultiplayerPage'
import SingleplayerPage from './pages/singleplayer/SingleplayerPage'
import SettingsPage from './pages/SettingsPage'
import ExtendPage from './pages/ExtendPage'
import { useThemeStore, themeColors } from './themeStore'
import { useStateSync } from './hooks/useStateSync'
import { useConnectionStatus, useAuth } from './store/appStore'
import { useActions } from './hooks/useActions'
import { trpc } from '../utils/trpc'
import lobbyBg from './assets/halloween.png'
import zkbanner from './assets/Zero-K_banner3.png'

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
    } catch {
      setError('Login failed')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/[0.1] bg-black/60 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-neutral-500 transition-colors hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-6 text-xl font-normal tracking-wide text-white">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm uppercase tracking-wide text-neutral-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder-neutral-500 transition-all focus:bg-white/[0.06] focus:border-white/20 focus:outline-none"
              placeholder="Enter username"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm uppercase tracking-wide text-neutral-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder-neutral-500 transition-all focus:bg-white/[0.06] focus:border-white/20 focus:outline-none"
              placeholder="Enter password"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isLoggingIn || !username || !password}
            className={`w-full rounded-xl py-3 font-medium text-white shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${theme.bg} ${theme.bgHover}`}
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
      <div className="flex min-w-0 items-center justify-end gap-2 px-1 py-1 text-neutral-200" title={`Logged in as ${auth.username}`}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.04]">
          <svg className={`h-4 w-4 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="truncate text-sm uppercase tracking-[0.12em]">{auth.username}</div>
      </div>
    )
  }

  return (
    <button
      onClick={onLoginClick}
      className="flex min-w-0 items-center justify-end gap-2 px-1 py-1 text-sm uppercase tracking-[0.12em] text-neutral-400 transition-colors duration-200 hover:text-neutral-200"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.04]">
        <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      </div>
      <div className="truncate">Login</div>
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
      className={`flex shrink-0 items-center justify-center p-1 transition-opacity duration-200 ${
        isOnline
          ? 'cursor-default'
          : isConnectingState
            ? 'cursor-wait'
            : 'cursor-pointer hover:opacity-100'
      }`}
      title={
        isOnline
          ? 'Connected to server'
          : isConnectingState
            ? 'Connecting...'
            : 'Click to connect'
      }
      aria-label={isOnline ? 'Online' : isConnectingState ? 'Connecting' : 'Offline'}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
          isOnline
            ? 'bg-emerald-400'
            : isConnectingState
              ? 'animate-pulse bg-amber-400'
              : 'bg-red-400'
        }`}
      />
    </button>
  )
}

function SidebarBrand(): JSX.Element {
  return (
    <div className="relative overflow-hidden border-b border-white/[0.10] bg-black/20 shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      <img
        src={zkbanner}
        alt="Zero-K banner"
        className="block w-full h-auto select-none"
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.10] via-slate-950/18 to-slate-950/78" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_26%),radial-gradient(circle_at_80%_22%,rgba(255,255,255,0.10),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-[6%] top-0 h-[32%] rounded-b-[100%] bg-gradient-to-b from-white/[0.22] via-white/[0.08] to-transparent blur-md" />
      <div className="pointer-events-none absolute inset-y-0 right-[1px] left-0 border-r border-b border-white/[0.12] shadow-[inset_0_-18px_30px_rgba(2,6,23,0.35)]" />
    </div>
  )
}

type SidebarNavChild = {
  to: string
  label: string
  hasIndicator?: boolean
}

type SidebarNavItem = {
  to: string
  section: string
  label: string
  end?: boolean
  hasIndicator?: boolean
  children?: SidebarNavChild[]
}

function AppShell(): JSX.Element {
  useStateSync()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const previousHadActiveDownloads = useRef(false)
  const location = useLocation()
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]
  const utils = trpc.useUtils()
  const downloadsQuery = trpc.getDownloadStatuses.useQuery(undefined, {
    refetchInterval: 1000,
    refetchIntervalInBackground: true
  })
  const hasActiveDownloads = (downloadsQuery.data ?? []).some((download) => download.status === 'queued' || download.status === 'running')

  useEffect(() => {
    if (previousHadActiveDownloads.current && !hasActiveDownloads) {
      void utils.getReplays.invalidate()
      void utils.getAvailableMaps.invalidate()
    }
    previousHadActiveDownloads.current = hasActiveDownloads
  }, [hasActiveDownloads, utils])

  const navItems: SidebarNavItem[] = [
    {
      to: '/',
      section: '/',
      end: true,
      label: 'Home'
    },
    {
      to: '/Singleplayer',
      section: '/Singleplayer',
      label: 'Singleplayer',
      children: [
        { to: '/Singleplayer/Replays', label: 'Replays' },
        { to: '/Singleplayer/Skirmish', label: 'Skirmish' }
      ]
    },
    {
      to: '/Multiplayer',
      section: '/Multiplayer',
      label: 'Multiplayer',
      children: [
        { to: '/Multiplayer/Battles', label: 'Battles' },
        { to: '/Multiplayer/Matchmaking', label: 'Matchmaking' },
        { to: '/Multiplayer/Battleroom', label: 'Battleroom' }
      ]
    },
    {
      to: '/Customize',
      section: '/Customize',
      label: 'Customize',
      hasIndicator: hasActiveDownloads,
      children: [
        { to: '/Customize/Widgets', label: 'Widgets' },
        { to: '/Customize/Hotkeys', label: 'Hotkeys' },
        { to: '/Customize/Downloads', label: 'Downloads', hasIndicator: hasActiveDownloads }
      ]
    }
  ]

  const isSectionActive = (section: string): boolean => {
    if (section === '/') {
      return location.pathname === '/'
    }

    return location.pathname === section || location.pathname.startsWith(`${section}/`)
  }

  const sidebarRowClass = (isActive: boolean): string => {
    if (isActive) {
      return 'group relative block w-full overflow-hidden text-white transition-all duration-200'
    }

    return 'group relative block w-full overflow-hidden text-neutral-500 transition-all duration-200 hover:text-neutral-200'
  }

  const isSettingsActive = location.pathname === '/Settings'

  return (
    <div className="dark relative h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] -top-[30%] h-[60%] w-[60%] rounded-full bg-pink-600/15 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div className="absolute right-[20%] top-[40%] h-[30%] w-[30%] rounded-full bg-rose-500/8 blur-[100px]" />
      </div>

      <div className="relative z-10 flex h-full min-h-0">
        <aside className="flex w-64 shrink-0 flex-col border-r border-white/[0.08] bg-gradient-to-b from-slate-950/95 via-slate-950/88 to-blue-950/35 backdrop-blur-2xl">
          <SidebarBrand />
          <nav className=" flex flex-col">
            {navItems.map((item) => {
              const isActive = isSectionActive(item.section)

              return (
                <div key={item.section} className="min-w-0 w-full">
                  <NavLink to={item.to} end={item.end} className={sidebarRowClass(isActive)}>
                    <div
                      className={`pointer-events-none absolute inset-y-0 left-0 w-full transition-opacity duration-200 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'
                      }`}
                      style={{
                        background: `linear-gradient(90deg, rgba(${theme.rgb}, ${isActive ? 0.24 : 0.14}) 0%, rgba(${theme.rgb}, 0.08) 40%, rgba(${theme.rgb}, 0) 100%)`
                      }}
                    />
                    <div
                      className={`pointer-events-none absolute left-0 top-2.5 bottom-2.5 w-px transition-opacity duration-200 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
                      }`}
                      style={{ backgroundColor: `rgba(${theme.rgb}, ${isActive ? 0.9 : 0.55})` }}
                    />
                    <div className="relative flex items-center px-3 py-2.5">
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span className="truncate text-sm uppercase tracking-[0.12em]">{item.label}</span>
                        {item.hasIndicator && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                      </div>
                    </div>
                  </NavLink>

                  {isActive && item.children && (
                    <div className="mt-1 ml-3 min-w-0 space-y-1 border-l border-white/[0.08] pl-2">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          className={({ isActive: isChildActive }) =>
                            `flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs uppercase tracking-[0.16em] transition-colors duration-200 ${
                              isChildActive
                                ? `${theme.text} bg-white/[0.04]`
                                : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
                            }`
                          }
                        >
                          <span>{child.label}</span>
                          {child.hasIndicator && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="mt-auto flex items-center justify-between gap-2 px-3 pb-1 pt-2">
            <ConnectionIndicator />
            <ProfileButton onLoginClick={() => setShowLoginModal(true)} />
          </div>

          <div className="pb-3">
            <NavLink to="/Settings" className={sidebarRowClass(isSettingsActive)}>
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 w-24 transition-opacity duration-200 ${
                  isSettingsActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-80'
                }`}
                style={{
                  background: `linear-gradient(90deg, rgba(${theme.rgb}, ${isSettingsActive ? 0.24 : 0.14}) 0%, rgba(${theme.rgb}, 0.08) 38%, rgba(${theme.rgb}, 0) 100%)`
                }}
              />
              <div
                className={`pointer-events-none absolute left-0 top-2.5 bottom-2.5 w-px transition-opacity duration-200 ${
                  isSettingsActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
                }`}
                style={{ backgroundColor: `rgba(${theme.rgb}, ${isSettingsActive ? 0.9 : 0.55})` }}
              />
              <div className="relative flex items-center px-3 py-2.5">
                <div className="min-w-0 flex-1 text-sm uppercase tracking-[0.12em]">Settings</div>
              </div>
            </NavLink>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden">
          <div
            className="relative h-full min-h-0 overflow-hidden border-l border-white/[0.04]"
            style={{
              backgroundImage: `url(${lobbyBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.08),transparent_28%)]" />
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            <div className="relative z-10 h-full min-h-0">
              <Routes>
                <Route path="/Multiplayer/*" element={<MultiplayerPage />} />
                <Route path="/Singleplayer/*" element={<SingleplayerPage />} />
                <Route path="/Customize/*" element={<ExtendPage />} />
                <Route path="/Extend/*" element={<Navigate to="/Customize/Widgets" replace />} />
                <Route path="/Downloads" element={<Navigate to="/Customize/Downloads" replace />} />
                <Route path="/Settings" element={<SettingsPage />} />
                <Route path="/" element={<HomePage />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function App(): JSX.Element {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  )
}

export default App
