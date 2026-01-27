import { NavLink } from 'react-router-dom'
import { useThemeStore, themeColors } from '../themeStore'

export default function HomePage(): JSX.Element {
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  return (
    <div className="min-h-[calc(100vh-52px)] bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at top, rgba(${theme.rgb}, 0.06), transparent 50%)` }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-[100px] rounded-full"
          style={{ backgroundColor: `rgba(${theme.rgb}, 0.03)` }}
        />

        <div className="relative px-8 py-16 text-center">
          <div className="inline-block mb-4">
            <span className={`px-3 py-1 text-xs font-medium tracking-widest uppercase ${theme.text} ${theme.bgSubtle} border ${theme.border} rounded-full`}>
              Zero-K Lobby Client
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
            Welcome, <span className={theme.text}>Commander</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Command your forces across vast battlefields. Build, strategize, and conquer in the ultimate sci-fi RTS experience.
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
          {/* Play Now Card */}
          <NavLink to="/Multiplayer" className="group h-full">
            <div
              className="relative p-6 h-full bg-neutral-900/80 border border-neutral-800 rounded-lg overflow-hidden transition-all duration-300 hover:bg-neutral-900"
              style={{ ['--hover-border' as string]: `rgba(${theme.rgb}, 0.4)` }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = `rgba(${theme.rgb}, 0.4)`}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
            >
              <div
                className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(to bottom right, rgba(${theme.rgb}, 0.05), transparent)` }}
              />
              <div
                className="absolute top-0 right-0 w-32 h-32 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 transition-colors duration-300"
                style={{ backgroundColor: `rgba(${theme.rgb}, 0.05)` }}
              />

              <div className="relative">
                <div
                  className="w-12 h-12 mb-4 flex items-center justify-center rounded-lg border"
                  style={{ backgroundColor: `rgba(${theme.rgb}, 0.1)`, borderColor: `rgba(${theme.rgb}, 0.2)` }}
                >
                  <svg className={`w-6 h-6 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Multiplayer</h3>
                <p className="text-sm text-neutral-500">Join battles and compete against players worldwide</p>
              </div>
            </div>
          </NavLink>

          {/* Singleplayer Card */}
          <NavLink to="/Singleplayer" className="group h-full">
            <div className="relative p-6 h-full bg-neutral-900/80 border border-neutral-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:bg-neutral-900">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors duration-300" />

              <div className="relative">
                <div className="w-12 h-12 mb-4 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Singleplayer</h3>
                <p className="text-sm text-neutral-500">Practice against AI or explore campaign missions</p>
              </div>
            </div>
          </NavLink>

          {/* Replays Card */}
          <NavLink to="/Singleplayer/Replays" className="group h-full">
            <div className="relative p-6 h-full bg-neutral-900/80 border border-neutral-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-violet-500/40 hover:bg-neutral-900">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-500/10 transition-colors duration-300" />

              <div className="relative">
                <div className="w-12 h-12 mb-4 flex items-center justify-center bg-violet-500/10 border border-violet-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Replays</h3>
                <p className="text-sm text-neutral-500">Watch and analyze your past battles</p>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Stats Section */}
        <div className="mt-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Online Players" value="--" />
            <StatCard label="Active Battles" value="--" />
            <StatCard label="Your Wins" value="--" />
            <StatCard label="Total Games" value="--" />
          </div>
        </div>

        {/* News/Updates Section */}
        <div className="mt-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white">Latest Updates</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-neutral-800 to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NewsCard
              title="Welcome to Zero-K Lobby"
              date="Just now"
              description="Your new command center for all Zero-K battles. Browse multiplayer games, watch replays, and more."
            />
            <NewsCard
              title="Getting Started"
              date="Tips"
              description="Use the navigation above to explore different sections. Join a multiplayer battle or practice against AI."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="p-4 bg-neutral-950/50 border border-neutral-800/50 rounded-lg">
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-neutral-500 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function NewsCard({ title, date, description }: { title: string; date: string; description: string }): JSX.Element {
  return (
    <div className="p-4 bg-neutral-950/50 border border-neutral-800/50 rounded-lg hover:border-neutral-700/50 transition-colors duration-300">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <span className="text-xs text-neutral-600">{date}</span>
      </div>
      <p className="text-sm text-neutral-500">{description}</p>
    </div>
  )
}
