import BattleList from './BattleList'
import LobbySidebar from './LobbySidebar'

export default function MultiplayerPage(): JSX.Element {
  return (
    <div className="h-[calc(100vh-52px)] p-4 overflow-hidden">
      <div className="h-full grid grid-cols-4 gap-4">
        {/* Battle List - takes 2 columns */}
        <div className="col-span-2 flex flex-col min-h-0">
          <BattleList />
        </div>

        {/* Lobby Sidebar (Chat + Player List) - takes 2 columns */}
        <div className="col-span-2 flex flex-col min-h-0">
          <LobbySidebar />
        </div>
      </div>
    </div>
  )
}
