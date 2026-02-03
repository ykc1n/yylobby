import { useState, useEffect } from 'react'
import { useThemeStore, themeColors, ThemeColor } from '../themeStore'
import { trpc } from '../../utils/trpc'

const COLOR_OPTIONS: ThemeColor[] = ['blue', 'cyan', 'violet', 'emerald', 'rose', 'amber', 'red']

// Preview colors for the color picker (actual Tailwind bg classes)
const colorPreviewBg: Record<ThemeColor, string> = {
  blue: 'bg-blue-500',
  cyan: 'bg-cyan-500',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
}

const colorRingClasses: Record<ThemeColor, string> = {
  blue: 'ring-blue-400',
  cyan: 'ring-cyan-400',
  violet: 'ring-violet-400',
  emerald: 'ring-emerald-400',
  rose: 'ring-rose-400',
  amber: 'ring-amber-400',
  red: 'ring-red-400',
}

export default function SettingsPage(): JSX.Element {
  const { themeColor, setThemeColor } = useThemeStore()
  const theme = themeColors[themeColor]

  // Settings state
  const [zeroKDirectory, setZeroKDirectory] = useState('')
  const [replayDirectories, setReplayDirectories] = useState<string[]>([])

  // tRPC queries and mutations
  const settingsQuery = trpc.getSettings.useQuery()
  const setZeroKDirMutation = trpc.setZeroKDirectory.useMutation()
  const addReplayDirMutation = trpc.addReplayDirectory.useMutation()
  const removeReplayDirMutation = trpc.removeReplayDirectory.useMutation()
  const browseMutation = trpc.browseForDirectory.useMutation()

  // Load settings on mount
  useEffect(() => {
    if (settingsQuery.data) {
      setZeroKDirectory(settingsQuery.data.zeroKDirectory)
      setReplayDirectories(settingsQuery.data.replayDirectories)
    }
  }, [settingsQuery.data])

  const handleBrowseZeroK = async (): Promise<void> => {
    const result = await browseMutation.mutateAsync()
    if (!result.canceled && result.path) {
      setZeroKDirectory(result.path)
      await setZeroKDirMutation.mutateAsync({ directory: result.path })
      settingsQuery.refetch()
    }
  }

  const handleSaveZeroKDirectory = async (): Promise<void> => {
    await setZeroKDirMutation.mutateAsync({ directory: zeroKDirectory })
    settingsQuery.refetch()
  }

  const handleBrowseReplayDir = async (): Promise<void> => {
    const result = await browseMutation.mutateAsync()
    if (!result.canceled && result.path) {
      await addReplayDirMutation.mutateAsync({ directory: result.path })
      settingsQuery.refetch()
    }
  }

  const handleRemoveReplayDir = async (directory: string): Promise<void> => {
    await removeReplayDirMutation.mutateAsync({ directory })
    settingsQuery.refetch()
  }

  return (
    <div className="min-h-[calc(100vh-52px)] p-6">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-6 p-6 bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-xl shadow-black/30">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            <h1 className="text-2xl font-normal tracking-wide text-white mb-1">Settings</h1>
            <p className="text-sm text-neutral-400 tracking-wide">Customize your experience</p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Theme Color Section */}
          <div className="relative bg-black/30 backdrop-blur-xl border border-white/[0.08] rounded-xl p-5 shadow-lg shadow-black/20">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            <div className="relative">
            <h2 className="text-sm font-normal text-white/80 tracking-[0.12em] uppercase mb-4">Appearance</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-3 tracking-[0.1em] uppercase">Accent Color</label>

                {/* Color Picker Grid */}
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setThemeColor(color)}
                      className={`group relative flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-all duration-200
                        ${themeColor === color
                          ? 'bg-white/[0.08]'
                          : 'bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${colorPreviewBg[color]} opacity-80 transition-transform duration-200 group-hover:scale-105`} />
                      <span className={`text-[10px] font-medium ${themeColor === color ? 'text-white/80' : 'text-neutral-500'}`}>
                        {themeColors[color].name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Section */}
              <div className="mt-6 pt-4">
                <label className="block text-xs text-neutral-400 mb-3 tracking-[0.1em] uppercase">Preview</label>
                <div className="space-y-3">
                  {/* Button Preview */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-600 w-16 tracking-wide">Button</span>
                    <button
                      className={`px-4 py-2 ${theme.bg} ${theme.bgHover} text-white text-sm font-normal tracking-[0.1em] uppercase rounded-lg transition-all duration-200`}
                    >
                      Action
                    </button>
                  </div>

                  {/* Text Preview */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-600 w-16 tracking-wide">Text</span>
                    <span className={`text-sm font-normal tracking-wide ${theme.text}`}>Accent color</span>
                  </div>

                  {/* Tab Preview */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-600 w-16 tracking-wide">Tab</span>
                    <div className="flex gap-1">
                      <span className={`px-3 py-1.5 text-xs font-normal tracking-wide rounded-md bg-white/[0.06] ${theme.text}`}>
                        Active
                      </span>
                      <span className="px-3 py-1.5 text-xs font-normal tracking-wide rounded-md text-neutral-500">
                        Inactive
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Game Directories Section */}
          <div className="relative bg-black/30 backdrop-blur-xl border border-white/[0.08] rounded-xl p-5 shadow-lg shadow-black/20">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-sm font-normal text-white/80 tracking-[0.12em] uppercase mb-4">Game Directories</h2>

              <div className="space-y-5">
                {/* Zero-K Directory */}
                <div>
                  <label className="block text-xs text-neutral-400 mb-2 tracking-[0.1em] uppercase">Zero-K Installation Directory</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={zeroKDirectory}
                      onChange={(e) => setZeroKDirectory(e.target.value)}
                      onBlur={handleSaveZeroKDirectory}
                      placeholder="C:/Program Files (x86)/Steam/steamapps/common/Zero-K"
                      className="flex-1 px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.15] transition-colors tracking-wide"
                    />
                    <button
                      onClick={handleBrowseZeroK}
                      className={`px-4 py-2.5 ${theme.bg} ${theme.bgHover} text-white text-sm font-normal tracking-wide rounded-lg transition-all duration-200`}
                    >
                      Browse
                    </button>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1.5 tracking-wide">
                    The folder containing Zero-K (should have engine, demos, cache folders)
                  </p>
                </div>

                {/* Replay Directories */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-neutral-400 tracking-[0.1em] uppercase">Additional Replay Directories</label>
                    <button
                      onClick={handleBrowseReplayDir}
                      className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Directory
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Default demos folder (read-only) */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                      <svg className="w-4 h-4 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="flex-1 text-sm text-neutral-400 truncate tracking-wide">
                        {zeroKDirectory}/demos
                      </span>
                      <span className="text-xs text-neutral-600 px-2 py-0.5 bg-white/[0.04] rounded">Default</span>
                    </div>

                    {/* Additional directories */}
                    {replayDirectories.map((dir) => (
                      <div key={dir} className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-lg group">
                        <svg className="w-4 h-4 text-neutral-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="flex-1 text-sm text-neutral-300 truncate tracking-wide">{dir}</span>
                        <button
                          onClick={() => handleRemoveReplayDir(dir)}
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {replayDirectories.length === 0 && (
                      <p className="text-xs text-neutral-600 tracking-wide py-2">
                        No additional replay directories configured
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-1.5 tracking-wide">
                    Add extra folders to scan for replay files (.sdfz)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
