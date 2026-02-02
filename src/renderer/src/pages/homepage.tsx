import { NavLink } from 'react-router-dom'
import { useThemeStore, themeColors } from '../themeStore'
import { useNews } from '../store/appStore'

// Hexagon grid pattern - proper honeycomb tiling
const hexGridSvg = `data:image/svg+xml,${encodeURIComponent(
  `<svg width="24" height="42" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0l12 7v14l-12 7-12-7V7z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M0 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M24 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
  </svg>`
)}`

export default function HomePage(): JSX.Element {
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]
  const news = useNews()

  return (
    <div className="min-h-[calc(100vh-52px)] p-6">
      {/* Hero Section */}
      <div className="relative max-w-6xl mx-auto mb-8">
        <div className="relative px-8 py-12 text-center bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl shadow-xl shadow-black/30 overflow-hidden">
          {/* Hex Grid Background */}
          <div
            className="absolute inset-0 opacity-100 pointer-events-none"
            style={{ backgroundImage: `url("${hexGridSvg}")` }}
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
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
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Play Now Card */}
          <NavLink to="/Multiplayer" className="group h-full">
            <div className="relative p-8 h-full bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl overflow-hidden transition-all duration-300 hover:bg-black/50 hover:border-white/[0.15] hover:shadow-xl hover:shadow-black/40 hover:scale-[1.02] shadow-xl shadow-black/30">
              {/* Hex Grid Background */}
              <div
                className="absolute inset-0 opacity-100 pointer-events-none"
                style={{ backgroundImage: `url("${hexGridSvg}")` }}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 mb-5 flex items-center justify-center bg-white/[0.06] border border-white/[0.08] rounded-xl backdrop-blur-sm">
                  <svg className={`w-7 h-7 ${theme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal tracking-wide text-white mb-2">Multiplayer</h3>
                <p className="text-sm text-neutral-400 tracking-wide">Join battles worldwide</p>
              </div>
            </div>
          </NavLink>

          {/* Singleplayer Card */}
          <NavLink to="/Singleplayer" className="group h-full">
            <div className="relative p-8 h-full bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl overflow-hidden transition-all duration-300 hover:bg-black/50 hover:border-white/[0.15] hover:shadow-xl hover:shadow-black/40 hover:scale-[1.02] shadow-xl shadow-black/30">
              {/* Hex Grid Background */}
              <div
                className="absolute inset-0 opacity-100 pointer-events-none"
                style={{ backgroundImage: `url("${hexGridSvg}")` }}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 mb-5 flex items-center justify-center bg-white/[0.06] border border-white/[0.08] rounded-xl backdrop-blur-sm">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal tracking-wide text-white mb-2">Singleplayer</h3>
                <p className="text-sm text-neutral-400 tracking-wide">Practice against AI</p>
              </div>
            </div>
          </NavLink>

          {/* Replays Card */}
          <NavLink to="/Singleplayer/Replays" className="group h-full">
            <div className="relative p-8 h-full bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl overflow-hidden transition-all duration-300 hover:bg-black/50 hover:border-white/[0.15] hover:shadow-xl hover:shadow-black/40 hover:scale-[1.02] shadow-xl shadow-black/30">
              {/* Hex Grid Background */}
              <div
                className="absolute inset-0 opacity-100 pointer-events-none"
                style={{ backgroundImage: `url("${hexGridSvg}")` }}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 mb-5 flex items-center justify-center bg-white/[0.06] border border-white/[0.08] rounded-xl backdrop-blur-sm">
                  <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal tracking-wide text-white mb-2">Replays</h3>
                <p className="text-sm text-neutral-400 tracking-wide">Watch past battles</p>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Stats Section */}
        <div className="mt-8">
          <div className="relative p-6 bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl overflow-hidden shadow-xl shadow-black/30">
            {/* Hex Grid Background */}
            <div
              className="absolute inset-0 opacity-100 pointer-events-none"
              style={{ backgroundImage: `url("${hexGridSvg}")` }}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            <div className="relative grid grid-cols-4 gap-6">
              <StatCard label="Online Players" value="--" />
              <StatCard label="Active Battles" value="--" />
              <StatCard label="Your Wins" value="--" />
              <StatCard label="Total Games" value="--" />
            </div>
          </div>
        </div>

        {/* News/Updates Section */}
        <div className="mt-8">
          <div className="relative p-6 bg-black/40 backdrop-blur-2xl border border-white/[0.1] rounded-xl overflow-hidden shadow-xl shadow-black/30">
            {/* Hex Grid Background */}
            <div
              className="absolute inset-0 opacity-100 pointer-events-none"
              style={{ backgroundImage: `url("${hexGridSvg}")` }}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            <div className="relative flex items-center gap-3 mb-5">
              <h2 className="text-sm font-medium text-neutral-300 tracking-wide uppercase">Latest Updates</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-white/[0.1] to-transparent" />
            </div>

            <div className="relative grid grid-cols-2 gap-5">
              {news.length > 0 ? (
                news.slice(0, 6).map((item, index) => (
                  <NewsCard
                    key={index}
                    title={item.Header}
                    date={formatNewsDate(item.Time)}
                    description={item.Text}
                    url={item.Url}
                  />
                ))
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="relative p-5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-center">
      <div className="text-3xl font-light text-white mb-2 tracking-wide">{value}</div>
      <div className="text-xs text-neutral-400 uppercase tracking-[0.15em]">{label}</div>
    </div>
  )
}

function formatNewsDate(dateString: string): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
}

function NewsCard({ title, date, description, url }: { title: string; date: string; description: string; url?: string }): JSX.Element {
  const content = (
    <div className="relative p-5 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-normal tracking-wide text-white line-clamp-1">{title}</h3>
        <span className="text-xs text-neutral-500 tracking-wide px-2 py-0.5 bg-white/[0.04] rounded flex-shrink-0 ml-2">{date}</span>
      </div>
      <p className="text-sm text-neutral-400 tracking-wide leading-relaxed line-clamp-2">{description}</p>
    </div>
  )

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}
