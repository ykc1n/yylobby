import { NavLink } from 'react-router-dom'
import { useThemeStore, themeColors } from '../themeStore'

export default function HomePage(): JSX.Element {
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  return (
    <div className="min-h-[calc(100vh-52px)] p-6">
      {/* Hero Section */}
      <div className="relative max-w-5xl mx-auto mb-6">
        <div className="relative px-8 py-10 text-center bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
          <div className="relative">
            <div className="inline-block mb-4">
              <span className={`px-4 py-1.5 text-xs font-medium tracking-[0.2em] uppercase ${theme.text} bg-white/[0.06] border border-white/[0.1] rounded-full backdrop-blur-sm`}>
                Zero-K Lobby
              </span>
            </div>
            <h1 className="text-4xl font-normal tracking-wide text-white mb-3">
              Welcome, <span className={theme.text}>Commander</span>
            </h1>
            <p className="text-base text-neutral-400 max-w-lg mx-auto tracking-wide">
              Command your forces across vast battlefields. Build, strategize, and conquer.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {/* Play Now Card */}
          <NavLink to="/Multiplayer" className="group h-full">
            <div className="relative p-6 h-full bg-black/30 backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-300 hover:bg-black/40 hover:border-white/[0.15] hover:shadow-xl hover:shadow-black/40 hover:scale-[1.02]">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
                  <svg className={`w-6 h-6 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-normal tracking-wide text-white mb-1">Multiplayer</h3>
                <p className="text-sm text-neutral-400 tracking-wide">Join battles worldwide</p>
              </div>
            </div>
          </NavLink>

          {/* Singleplayer Card */}
          <NavLink to="/Singleplayer" className="group h-full">
            <div className="relative p-6 h-full bg-black/30 backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-300 hover:bg-black/40 hover:border-white/[0.15] hover:shadow-xl hover:shadow-black/40 hover:scale-[1.02]">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 mb-4 flex items-center justify-center bg-white/[0.06] border border-white/[0.08] rounded-xl backdrop-blur-sm">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-normal tracking-wide text-white mb-1">Singleplayer</h3>
                <p className="text-sm text-neutral-400 tracking-wide">Practice against AI</p>
              </div>
            </div>
          </NavLink>

          {/* Replays Card */}
          <NavLink to="/Singleplayer/Replays" className="group h-full">
            <div className="relative p-6 h-full bg-black/30 backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-300 hover:bg-black/40 hover:border-white/[0.15] hover:shadow-xl hover:shadow-black/40 hover:scale-[1.02]">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-12 h-12 mb-4 flex items-center justify-center bg-white/[0.06] border border-white/[0.08] rounded-xl backdrop-blur-sm">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-normal tracking-wide text-white mb-1">Replays</h3>
                <p className="text-sm text-neutral-400 tracking-wide">Watch past battles</p>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Stats Section */}
        <div className="mt-6">
          <div className="p-5 bg-black/30 backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Online Players" value="--" />
              <StatCard label="Active Battles" value="--" />
              <StatCard label="Your Wins" value="--" />
              <StatCard label="Total Games" value="--" />
            </div>
          </div>
        </div>

        {/* News/Updates Section */}
        <div className="mt-6">
          <div className="p-5 bg-black/30 backdrop-blur-xl border border-white/[0.08] rounded-xl">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-medium text-neutral-300 tracking-wide uppercase">Latest Updates</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-white/[0.1] to-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NewsCard
                title="Welcome to Zero-K Lobby"
                date="Just now"
                description="Your new command center for all Zero-K battles."
              />
              <NewsCard
                title="Getting Started"
                date="Tips"
                description="Use the navigation above to explore different sections."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="relative p-4 bg-white/[0.03] border border-white/[0.06] rounded-lg text-center">
      <div className="text-2xl font-light text-white mb-1 tracking-wide">{value}</div>
      <div className="text-xs text-neutral-400 uppercase tracking-[0.15em]">{label}</div>
    </div>
  )
}

function NewsCard({ title, date, description }: { title: string; date: string; description: string }): JSX.Element {
  return (
    <div className="relative p-4 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-normal tracking-wide text-white">{title}</h3>
        <span className="text-xs text-neutral-500 tracking-wide px-2 py-0.5 bg-white/[0.04] rounded">{date}</span>
      </div>
      <p className="text-sm text-neutral-400 tracking-wide leading-relaxed">{description}</p>
    </div>
  )
}
