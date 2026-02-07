import { NavLink } from 'react-router-dom'
import { useThemeStore, themeColors } from '../themeStore'
import { useNews } from '../store/appStore'
import { useActions } from '@renderer/hooks/useActions'

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
  const { testDownload } = useActions()

  return (
    <div className="min-h-[calc(100vh-52px)] grid grid-cols-3 grid-rows-6  p-6">
      {/* Main Glassy Panel */}
      <div className="relative max-w-6xl col-span-1 row-span-4  bg-black/30 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-black/40">
        {/* Hex Grid Background for main panel */}
        <div
          className="absolute inset-0 opacity-100 pointer-events-none rounded-2xl"
          style={{ backgroundImage: `url("${hexGridSvg}")` }}
        />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Hero Section */}


        {/* Quick Actions Grid */}
        <div className="relative">

        {/* Stats Section */}
        <div>
              <p className="text-4xl">yylobby</p>
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
            
            <div>
              TESTING 
              <button onClick={testDownload} className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                Test Download
              </button>
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
                <div className='relative p-5'>
                  Login to see news.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
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
