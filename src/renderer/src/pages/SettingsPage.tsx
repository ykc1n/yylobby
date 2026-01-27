import { useThemeStore, themeColors, ThemeColor } from '../themeStore'

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

  return (
    <div className="min-h-[calc(100vh-52px)] bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
          <p className="text-neutral-500">Customize your lobby experience</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Theme Color Section */}
          <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg p-6">
            <h2 className="text-sm font-medium text-white uppercase tracking-wider mb-4">Appearance</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-3">Theme Color</label>
                <p className="text-xs text-neutral-600 mb-4">
                  This color will be used for accents, glows, and highlights throughout the app.
                </p>

                {/* Color Picker Grid */}
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setThemeColor(color)}
                      className={`group relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200
                        ${themeColor === color
                          ? `border-neutral-600 bg-neutral-800/50 ring-2 ${colorRingClasses[color]} ring-offset-2 ring-offset-neutral-900`
                          : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${colorPreviewBg[color]} transition-transform duration-200 group-hover:scale-110`} />
                      <span className={`text-xs font-medium ${themeColor === color ? 'text-white' : 'text-neutral-500'}`}>
                        {themeColors[color].name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Section */}
              <div className="mt-6 pt-6 border-t border-neutral-800/50">
                <label className="block text-sm text-neutral-400 mb-3">Preview</label>
                <div className="space-y-4">
                  {/* Button Preview */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-600 w-20">Button:</span>
                    <button
                      className={`px-4 py-2 ${theme.bg} ${theme.bgHover} text-white text-sm font-semibold rounded-lg transition-all duration-200 ${theme.shadow} ${theme.shadowHover}`}
                    >
                      Primary Button
                    </button>
                  </div>

                  {/* Text Preview */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-600 w-20">Text:</span>
                    <span className={`text-sm font-medium ${theme.text}`}>Accent Text Color</span>
                  </div>

                  {/* Tab Preview */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-600 w-20">Tab:</span>
                    <div className="flex gap-1">
                      <span className={`px-3 py-1.5 text-xs font-medium rounded ${theme.bgSubtle} ${theme.text}`}>
                        Active Tab
                      </span>
                      <span className="px-3 py-1.5 text-xs font-medium rounded text-neutral-500 hover:text-neutral-300 hover:bg-white/5">
                        Inactive Tab
                      </span>
                    </div>
                  </div>

                  {/* Glow Preview */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-600 w-20">Glow:</span>
                    <div
                      className={`w-24 h-1 rounded-full ${theme.bg}`}
                      style={{ boxShadow: `0 0 12px rgba(${theme.rgb}, 0.5)` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder for future settings */}
          <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-lg p-6">
            <h2 className="text-sm font-medium text-white uppercase tracking-wider mb-4">Game Settings</h2>
            <p className="text-sm text-neutral-600">More settings coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
