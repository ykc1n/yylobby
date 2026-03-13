import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useThemeStore, themeColors } from '../themeStore'
import DownloadsPage from './DownloadsPage'
import HotkeysPage from './HotkeysPage'
import WidgetsPage from './WidgetsPage'

export default function ExtendPage(): JSX.Element {
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const navLinkClass = ({ isActive }: { isActive: boolean }): string => {
    if (isActive) {
      return `relative px-4 py-2 text-sm font-normal tracking-[0.1em] uppercase transition-all duration-200 ${theme.text} after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-px after:bg-current after:opacity-60`
    }
    return 'relative px-4 py-2 text-sm font-normal tracking-[0.1em] uppercase transition-all duration-200 text-neutral-500 hover:text-neutral-400'
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 flex items-center justify-center gap-1 border-b border-white/[0.08] bg-black/30 px-3 py-1 backdrop-blur-xl">
        <NavLink to="/Customize/Widgets" className={navLinkClass}>
          Widgets
        </NavLink>
        <NavLink to="/Customize/Hotkeys" className={navLinkClass}>
          Hotkeys
        </NavLink>
        <div className="mx-2 h-5 w-px bg-white/[0.1]" />
        <NavLink to="/Customize/Downloads" className={navLinkClass}>
          Downloads
        </NavLink>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden p-3">
        <Routes>
          <Route path="Widgets" element={<WidgetsPage />} />
          <Route path="Downloads" element={<DownloadsPage />} />
          <Route path="Hotkeys" element={<HotkeysPage />} />
          <Route path="" element={<Navigate to="/Customize/Widgets" replace />} />
        </Routes>
      </div>
    </div>
  )
}
