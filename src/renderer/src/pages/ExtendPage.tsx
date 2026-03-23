import { Routes, Route, Navigate } from 'react-router-dom'
import DownloadsPage from './DownloadsPage'
import HotkeysPage from './HotkeysPage'
import WidgetsPage from './WidgetsPage'

export default function ExtendPage(): JSX.Element {
  return (
    <div className="flex h-full min-h-0 flex-col">
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
