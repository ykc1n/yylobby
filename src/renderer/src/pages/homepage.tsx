import { NavLink } from 'react-router-dom'
import { useThemeStore, themeColors } from '../themeStore'

export default function HomePage(): JSX.Element {
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  return (
    <div className="min-h-[calc(100vh-52px)]">
      {/* Hero Section */}
      <div className="relative">
        <div className="relative px-8 py-12 text-center">
          <div className="inline-block mb-4">
            <span className={`px-4 py-1.5 text-xs font-medium tracking-[0.2em] uppercase ${theme.text} bg-white/[0.03] border border-white/[0.06] rounded-full`}>
              Zero-K Lobby
            </span>
          </div>
          <h1 className="text-4xl font-normal tracking-wide text-white/90 mb-3">
            Welcome, <span className={theme.text}>Commander</span>
          </h1>
          <p className="text-base text-neutral-500 max-w-lg mx-auto tracking-wide">
            Command your forces across vast battlefields. Build, strategize, and conquer.
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-3 gap-3 max-w-4xl mx-auto">
          {/* Play Now Card */}
          <NavLink to="/Multiplayer" className="group h-full">
            <div className="relative p-5 h-full bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl overflow-hidden transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.08]">
              <div className="relative">
                <div
                  className="w-10 h-10 mb-4 flex items-center justify-center rounded-lg bg-white/[0.04]"
                >
                  <svg className={`w-5 h-5 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-normal tracking-wide text-white/90 mb-1">Multiplayer</h3>
                <p className="text-sm text-neutral-500 tracking-wide">Join battles worldwide</p>
              </div>
            </div>
          </NavLink>

          {/* Singleplayer Card */}
          <NavLink to="/Singleplayer" className="group h-full">
            <div className="relative p-5 h-full bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl overflow-hidden transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.08]">
              <div className="relative">
                <div className="w-10 h-10 mb-4 flex items-center justify-center bg-white/[0.04] rounded-lg">
                  <svg className="w-5 h-5 text-emerald-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-normal tracking-wide text-white/90 mb-1">Singleplayer</h3>
                <p className="text-sm text-neutral-500 tracking-wide">Practice against AI</p>
              </div>
            </div>
          </NavLink>

          {/* Replays Card */}
          <NavLink to="/Singleplayer/Replays" className="group h-full">
            <div className="relative p-5 h-full bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-xl overflow-hidden transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.08]">
              <div className="relative">
                <div className="w-10 h-10 mb-4 flex items-center justify-center bg-white/[0.04] rounded-lg">
                  <svg className="w-5 h-5 text-violet-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-normal tracking-wide text-white/90 mb-1">Replays</h3>
                <p className="text-sm text-neutral-500 tracking-wide">Watch past battles</p>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Stats Section */}
        <div className="mt-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Online Players" value="--" />
            <StatCard label="Active Battles" value="--" />
            <StatCard label="Your Wins" value="--" />
            <StatCard label="Total Games" value="--" />
          </div>
        </div>

        {/* News/Updates Section */}
        <div className="mt-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-medium text-neutral-400">Latest Updates</h2>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
  )
}

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-lg">
      <div className="text-2xl font-normal text-white/90 mb-1 tracking-wide">{value}</div>
      <div className="text-xs text-neutral-500 uppercase tracking-[0.15em]">{label}</div>
    </div>
  )
}

function NewsCard({ title, date, description }: { title: string; date: string; description: string }): JSX.Element {
  return (
    <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-lg hover:bg-white/[0.03] transition-colors duration-200">
      <div className="flex items-start justify-between mb-1.5">
        <h3 className="text-sm font-normal tracking-wide text-white/80">{title}</h3>
        <span className="text-xs text-neutral-600 tracking-wide">{date}</span>
      </div>
      <p className="text-sm text-neutral-500 tracking-wide leading-relaxed">{description}</p>
    </div>
  )
}
