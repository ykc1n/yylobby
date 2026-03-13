import { useState, useMemo } from 'react'
import { GlassPanel } from '../components/GlassPanel'
import { trpc } from '../../utils/trpc'
import { useThemeStore, themeColors } from '../themeStore'

// Categorize actions into logical groups
const categories: Record<string, { label: string; match: (action: string) => boolean }> = {
  combat: {
    label: 'Combat',
    match: (a) => /^(attack|areaattack|fight|manualfire|airmanualfire|oneclickwep|firestate|settargetcircle|selfd)$/.test(a),
  },
  movement: {
    label: 'Movement & Orders',
    match: (a) => /^(rawmove|patrol|stop|wait|guard|areaguard|loadunits|loadselected|unloadunits|jump|repeat|priority|movestate|wantcloak|wantonoff|pushpull|stopproduction|globalbuildcancel)$/.test(a),
  },
  building: {
    label: 'Building',
    match: (a) => /^(reclaim|repair|resurrect|areamex|areaterramex|buildfacing|buildspacing|build_field_unit|field_fac_select|techup)$/.test(a) || a.startsWith('buildfacing') || a.startsWith('buildspacing'),
  },
  camera: {
    label: 'Camera',
    match: (a) => /^(togglecammode|toggleoverview|moveforward|moveback|moveleft|moveright|moveup|movedown|movefast|moveslow|movereset|movetilt|increaseviewradius|decreaseviewradius)$/.test(a),
  },
  selection: {
    label: 'Selection',
    match: (a) => a.startsWith('select') || /^(group\d+|groupclear)$/.test(a),
  },
  interface: {
    label: 'Interface',
    match: (a) => /^(crudemenu|crudesubmenu|exitwindow|HideInterface|hideinterfaceandcursor|viewlobby|luaui|epic_chili|togglestatsgraph|showeco|showmetalmap|showelevation|showpathtraversability|showhealthbars|lastmsgpos)$/.test(a) || a.startsWith('epic_chili') || a.startsWith('luaui'),
  },
  chat: {
    label: 'Chat',
    match: (a) => /^(chat|chatall|chatally|chatspec|chatswitchall|chatswitchally|chatswitchspec|edit_|pastetext)/.test(a),
  },
  spectator: {
    label: 'Spectator',
    match: (a) => a.startsWith('specteam') || a === 'controlunit',
  },
  system: {
    label: 'System',
    match: (a) => /^(pause|speedup|slowdown|singlestep|quitforce|screenshot|savegame|createvideo|debug|debugcolvol|gameinfo|forcestart|NoSound|DynamicSky|togglelos|drawinmap|clearmapmarks|placebeacon|selectmissiles)$/.test(a) || a.startsWith('screenshot'),
  },
}

function categorize(action: string): string {
  for (const [key, cat] of Object.entries(categories)) {
    if (cat.match(action)) return key
  }
  return 'other'
}

function formatKey(key: string): string {
  return key
    .replace(/^Any\+/, '')
    .replace(/^C\+/i, 'Ctrl+')
    .replace(/^A\+/i, 'Alt+')
    .replace(/^S\+/i, 'Shift+')
    .replace(/numpad_enter/i, 'Num Enter')
    .replace(/numpad\+/i, 'Num+')
    .replace(/numpad-/i, 'Num-')
    .replace(/backspace/i, 'Backspace')
    .replace(/escape/i, 'Esc')
    .replace(/\bdelete\b/i, 'Del')
    .replace(/\binsert\b/i, 'Ins')
    .replace(/\bpageup\b/i, 'PgUp')
    .replace(/\bpagedown\b/i, 'PgDn')
    .replace(/backquote/i, '`')
}

function formatAction(action: string): string {
  return action
    .replace(/^epic_chili_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function KeyBadge({ keyStr, theme }: { keyStr: string; theme: typeof themeColors[keyof typeof themeColors] }): JSX.Element {
  const parts = formatKey(keyStr).split('+')
  return (
    <span className="inline-flex items-center gap-0.5">
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="text-neutral-600 mx-0.5">+</span>}
          <kbd
            className="inline-block px-1.5 py-0.5 text-xs font-mono rounded border bg-neutral-800/60 border-white/10 text-neutral-200"
            style={{ borderBottomWidth: 2, borderBottomColor: `rgba(${theme.rgb}, 0.3)` }}
          >
            {part}
          </kbd>
        </span>
      ))}
    </span>
  )
}

export default function HotkeysPage(): JSX.Element {
  const hotkeysQuery = trpc.getHotkeys.useQuery()
  const hotkeys = hotkeysQuery.data ?? []
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Group hotkeys by action (merge duplicates), then categorize
  const grouped = useMemo(() => {
    const actionMap = new Map<string, string[]>()
    for (const hk of hotkeys) {
      const existing = actionMap.get(hk.action) ?? []
      for (const k of hk.keys) {
        if (k !== 'None' && !existing.includes(k)) existing.push(k)
      }
      actionMap.set(hk.action, existing)
    }

    // Filter out actions with no keys
    const entries = Array.from(actionMap.entries()).filter(([, keys]) => keys.length > 0)

    // Group by category
    const catMap = new Map<string, Array<{ action: string; keys: string[] }>>()
    for (const [action, keys] of entries) {
      const cat = categorize(action)
      if (!catMap.has(cat)) catMap.set(cat, [])
      catMap.get(cat)!.push({ action, keys })
    }

    // Sort each category's actions
    for (const arr of catMap.values()) {
      arr.sort((a, b) => a.action.localeCompare(b.action))
    }

    return catMap
  }, [hotkeys])

  // Filter by search
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const result = new Map<string, Array<{ action: string; keys: string[] }>>()
    for (const [cat, entries] of grouped) {
      if (activeCategory && cat !== activeCategory) continue
      const matching = q
        ? entries.filter((e) => e.action.toLowerCase().includes(q) || e.keys.some((k) => k.toLowerCase().includes(q)))
        : entries
      if (matching.length > 0) result.set(cat, matching)
    }
    return result
  }, [grouped, search, activeCategory])

  const totalCount = Array.from(filtered.values()).reduce((sum, arr) => sum + arr.length, 0)

  const allCategories = useMemo(() => {
    const cats = Array.from(grouped.keys())
    const order = [...Object.keys(categories), 'other']
    return cats.sort((a, b) => order.indexOf(a) - order.indexOf(b))
  }, [grouped])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex gap-4 p-4 overflow-hidden min-h-0">
        {/* Sidebar - Categories */}
        <div className="w-48 flex-shrink-0">
          <GlassPanel className="p-3 flex flex-col gap-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`text-left px-3 py-1.5 rounded-lg text-sm tracking-wide transition-all ${
                activeCategory === null
                  ? `${theme.text} bg-white/[0.08]`
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              All
            </button>
            {allCategories.map((cat) => {
              const label = categories[cat]?.label ?? 'Other'
              const count = grouped.get(cat)?.length ?? 0
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-3 py-1.5 rounded-lg text-sm tracking-wide transition-all flex items-center justify-between ${
                    activeCategory === cat
                      ? `${theme.text} bg-white/[0.08]`
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-xs text-neutral-600">{count}</span>
                </button>
              )
            })}
          </GlassPanel>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <GlassPanel className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-normal text-white/80 tracking-[0.12em] uppercase">Hotkeys</h2>
                <span className="text-xs text-neutral-500">{totalCount}</span>
              </div>
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search hotkeys..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 bg-neutral-800/50 border border-white/10 rounded-lg outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            {/* Hotkey list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {hotkeysQuery.isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative w-10 h-10 mb-3">
                    <div
                      className="absolute top-0 left-0 w-full h-full border-2 rounded-full animate-spin"
                      style={{ borderColor: `rgba(${theme.rgb}, 0.2)`, borderTopColor: `rgba(${theme.rgb}, 0.8)` }}
                    />
                  </div>
                  <div className="text-sm text-neutral-600">Loading...</div>
                </div>
              ) : hotkeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                  <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm">No hotkey config found</p>
                  <p className="text-xs text-neutral-700 mt-1">zk_keys.lua not found in game directory</p>
                </div>
              ) : totalCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-600">
                  <p className="text-sm">No matching hotkeys</p>
                </div>
              ) : (
                Array.from(filtered.entries()).map(([cat, entries]) => {
                  const label = categories[cat]?.label ?? 'Other'
                  return (
                    <div key={cat} className="mb-4">
                      <div className="sticky top-0 z-10 py-1.5 bg-neutral-950/80 backdrop-blur-sm">
                        <h3 className={`text-xs font-normal tracking-[0.12em] uppercase ${theme.text} opacity-70`}>{label}</h3>
                      </div>
                      <div className="space-y-px">
                        {entries.map((entry) => (
                          <div
                            key={entry.action}
                            className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                          >
                            <span className="text-sm text-neutral-300 min-w-0 truncate mr-4">{formatAction(entry.action)}</span>
                            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                              {entry.keys.map((k, i) => (
                                <KeyBadge key={i} keyStr={k} theme={theme} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
