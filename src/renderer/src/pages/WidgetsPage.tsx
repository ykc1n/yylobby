import { useState } from 'react'
import { GlassPanel } from '../components/GlassPanel'
import { trpc } from '../../utils/trpc'
import { useThemeStore, themeColors } from '../themeStore'

// Hexagon grid pattern - proper honeycomb tiling
const hexGridSvg = `data:image/svg+xml,${encodeURIComponent(
  `<svg width="24" height="42" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0l12 7v14l-12 7-12-7V7z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M0 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
    <path d="M24 21l12 7v14l-12 7-12-7V28z" fill="none" stroke="rgba(255,255,255,0.012)"/>
  </svg>`
)}`

interface WidgetEntry {
  filename: string
  name: string
  path: string
  size: number
  modifiedAt: number
  enabled: boolean
  desc?: string
  author?: string
  date?: string
  license?: string
}

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function WidgetDetail({ widget, theme }: { widget: WidgetEntry; theme: typeof themeColors[keyof typeof themeColors] }): JSX.Element {
  const contentQuery = trpc.getWidgetContent.useQuery({ path: widget.path })

  return (
    <GlassPanel className="p-4 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-neutral-800/50 border border-white/10 flex items-center justify-center">
          <svg className={`w-6 h-6 ${theme.text} opacity-60`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-base font-normal tracking-wide text-white/90 mb-1 text-center">{widget.name}</h3>
        {widget.desc && (
          <p className="text-sm text-neutral-400 tracking-wide text-center">{widget.desc}</p>
        )}
      </div>

      {/* Info Cards */}
      <div className="space-y-2 mb-4">
        {widget.author && (
          <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10">
            <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-1">Author</div>
            <div className="text-sm text-neutral-200">{widget.author}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10">
            <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-1">Size</div>
            <div className="text-sm text-neutral-200">{formatSize(widget.size)}</div>
          </div>
          <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10">
            <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-1">Modified</div>
            <div className="text-sm text-neutral-200">{new Date(widget.modifiedAt).toLocaleDateString()}</div>
          </div>
        </div>

        {(widget.license || widget.date) && (
          <div className="grid grid-cols-2 gap-2">
            {widget.license && (
              <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10">
                <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-1">License</div>
                <div className="text-sm text-neutral-200">{widget.license}</div>
              </div>
            )}
            {widget.date && (
              <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10">
                <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-1">Date</div>
                <div className="text-sm text-neutral-200">{widget.date}</div>
              </div>
            )}
          </div>
        )}

        <div className="p-3 rounded-lg bg-neutral-800/50 border border-white/10">
          <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-1">Filename</div>
          <div className="text-xs text-neutral-300 font-mono break-all">{widget.filename}</div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-2">Source Code</div>
        <div className="flex-1 min-h-0 rounded-lg bg-black/40 border border-white/10 overflow-auto">
          {contentQuery.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="relative w-8 h-8">
                <div
                  className="absolute top-0 left-0 w-full h-full border-2 rounded-full animate-spin"
                  style={{ borderColor: `rgba(${theme.rgb}, 0.2)`, borderTopColor: `rgba(${theme.rgb}, 0.8)` }}
                />
              </div>
            </div>
          ) : contentQuery.data?.content ? (
            <pre className="p-3 text-xs text-neutral-300 font-mono leading-relaxed whitespace-pre overflow-x-auto">
              <code>{contentQuery.data.content}</code>
            </pre>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-neutral-600">
              Could not read file
            </div>
          )}
        </div>
      </div>
    </GlassPanel>
  )
}

export default function WidgetsPage(): JSX.Element {
  const widgetsQuery = trpc.getWidgets.useQuery()
  const toggleMutation = trpc.toggleWidget.useMutation({
    onSuccess: () => widgetsQuery.refetch()
  })
  const data = widgetsQuery.data
  const widgets = (data?.widgets ?? []) as WidgetEntry[]
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]
  const [selectedWidget, setSelectedWidget] = useState('')
  const [search, setSearch] = useState('')

  const filteredWidgets = search
    ? widgets.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
    : widgets
  const selected = widgets.find(w => w.path === selectedWidget)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden min-h-0 min-w-0">
        {/* Widget List */}
        <div className="col-span-2 flex flex-col overflow-hidden min-w-0">
          <GlassPanel className="flex-1 flex flex-col overflow-hidden relative">
            {/* Hex Grid Background */}
            <div
              className="absolute inset-0 opacity-100 pointer-events-none"
              style={{ backgroundImage: `url("${hexGridSvg}")` }}
            />
            <div className="px-4 py-3 relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-normal text-white/80 tracking-[0.12em] uppercase">Widgets</h2>
                <span className="text-xs text-neutral-500">{filteredWidgets.length}</span>
              </div>
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search widgets..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 bg-neutral-800/50 border border-white/10 rounded-lg outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 relative z-10">
              {widgetsQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative w-10 h-10 mb-3">
                    <div
                      className="absolute top-0 left-0 w-full h-full border-2 rounded-full animate-spin"
                      style={{ borderColor: `rgba(${theme.rgb}, 0.2)`, borderTopColor: `rgba(${theme.rgb}, 0.8)` }}
                    />
                  </div>
                  <div className="text-sm text-neutral-600">Loading...</div>
                </div>
              ) : widgetsQuery.isError ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                  <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-red-400/70">Failed to read the widget folder.</p>
                </div>
              ) : !data?.exists ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                  <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <p className="text-sm text-neutral-600">Widget folder does not exist yet</p>
                </div>
              ) : filteredWidgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                  <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-sm text-neutral-600">No widgets found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredWidgets.map((widget) => {
                    const isSelected = widget.path === selectedWidget
                    return (
                      <div
                        key={widget.path}
                        onClick={() => setSelectedWidget(widget.path)}
                        className={`p-2.5 rounded-lg cursor-pointer transition-all duration-200 group shadow-lg
                          ${isSelected
                            ? 'bg-gradient-to-br from-neutral-700/55 to-neutral-800/50 border border-white/20'
                            : 'bg-gradient-to-br from-neutral-800/45 to-neutral-900/35 hover:from-neutral-700/55 hover:to-neutral-800/50 border border-white/10 hover:border-white/20'
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {/* Icon */}
                          <div className={`w-6 h-6 rounded flex-shrink-0 border flex items-center justify-center ${
                            isSelected
                              ? `${widget.enabled ? theme.text : 'text-neutral-500'} bg-white/[0.08] border-white/[0.15]`
                              : `bg-white/[0.05] border-white/[0.08] ${widget.enabled ? '' : 'opacity-40'}`
                          }`}>
                            <svg className={`w-3 h-3 ${isSelected ? '' : `${widget.enabled ? theme.text : 'text-neutral-600'} opacity-60`}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div className={`flex-1 min-w-0 text-sm tracking-wide truncate ${widget.enabled ? 'text-white/85' : 'text-white/40'}`}>
                            {widget.name}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pl-8">
                          <div className="text-[11px] text-neutral-500 tracking-wide truncate">
                            {formatSize(widget.size)}
                            {widget.author && <> · {widget.author}</>}
                          </div>
                          {/* Toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleMutation.mutate({ path: widget.path, enabled: !widget.enabled })
                            }}
                            className={`relative flex-shrink-0 w-8 h-4 rounded-full transition-colors duration-200 ${
                              widget.enabled
                                ? 'border'
                                : 'bg-neutral-700/60 border border-white/10'
                            }`}
                            style={widget.enabled ? { backgroundColor: `rgba(${theme.rgb}, 0.5)`, borderColor: `rgba(${theme.rgb}, 0.6)` } : undefined}
                          >
                            <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                              widget.enabled
                                ? 'left-[16px] bg-white'
                                : 'left-0.5 bg-neutral-400'
                            }`} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </GlassPanel>
        </div>

        {/* Sidebar - Widget Detail or Placeholder */}
        <div className="overflow-y-auto min-w-0 flex flex-col">
          {selected ? (
            <WidgetDetail key={selected.path} widget={selected} theme={theme} />
          ) : (
            <GlassPanel className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-neutral-800/50 border border-white/10 flex items-center justify-center">
                <svg className={`w-6 h-6 ${theme.text} opacity-60`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-neutral-600 text-sm">Select a widget</p>
              {data && (
                <div className="mt-4 p-3 rounded-lg bg-neutral-800/50 border border-white/10">
                  <div className="text-[10px] tracking-wide text-neutral-500 uppercase mb-1">Folder</div>
                  <div className="text-xs text-neutral-400 font-mono break-all">{data.directory}</div>
                </div>
              )}
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  )
}
