import ReplaysVeiw from './ReplaysView'
import SkirmishVeiw from './SkirmishView'
import { Routes, Route, Navigate } from 'react-router-dom'

export default function SingleplayerPage(): JSX.Element {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-hidden p-3">
        <Routes>
          <Route path="Replays" element={<ReplaysVeiw />} />
          <Route path="Skirmish" element={<SkirmishVeiw />} />
          <Route path="" element={<Navigate to="/Singleplayer/Replays" replace />} />
        </Routes>
      </div>
    </div>
  )
}
