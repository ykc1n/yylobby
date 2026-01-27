import BattleList from './BattleList'
import Chat from './Chat'
import PlayerList from './PlayerList'

export default function MultiplayerPage(): JSX.Element {
  return (
    <div className="h-[calc(100vh-52px)] p-4 overflow-hidden">
      <div className="h-full grid grid-cols-4 gap-4">
        {/* Battle List - takes 2 columns */}
        <div className="col-span-2 flex flex-col min-h-0">
          <BattleList />
        </div>

        {/* Chat - takes 1 column */}
        <div className="flex flex-col min-h-0">
          <Chat />
        </div>

        {/* Player List - takes 1 column */}
        <div className="flex flex-col min-h-0">
          <PlayerList />
        </div>
      </div>
    </div>
  )
}
