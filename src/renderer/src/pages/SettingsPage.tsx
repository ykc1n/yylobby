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
    <div className="min-h-[calc(100vh-52px)] p-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-normal tracking-wide text-white/90 mb-1">Settings</h1>
          <p className="text-sm text-neutral-500 tracking-wide">Customize your experience</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Theme Color Section */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5">
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

          {/* Placeholder for future settings */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5">
            <h2 className="text-sm font-normal text-white/80 tracking-[0.12em] uppercase mb-3">Game Settings</h2>
            <p className="text-sm text-neutral-600 tracking-wide">More settings coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
