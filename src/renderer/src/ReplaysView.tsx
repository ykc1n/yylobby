import { useState } from 'react'
import {trpc} from '../utils/trpc'

/*
IDEA:
build order tracker


or like, demo db

can save a demo in db
add tags, name, and parse it
can also simulate it, and store data, having it be more percise than gex 30sec increments
can query demos based on map, name, tags, etc
perfect for optimizers


*/
interface ReplayData {
    filename: string
    map: string
    game: string
    gameType: string
    duration: number
    date: Date
    players: unknown[]
    winners?: number[]
    teams: Map<number,object[]>
}

function Replay(props:{
    replaySelector: unknown
    replayData: ReplayData
    selected: boolean
}):JSX.Element{
  
    const map = props.replayData.map
    const date = props.replayData.date
    const players = props.replayData.players
    const gameType = props.replayData.gameType
    const durationMinutes = Math.floor(props.replayData.duration / 60000)
    const winners = props.replayData.winners?.[0]
    const teams = props.replayData.teams
    console.log("---------")
    console.log(players)
    console.log(teams)

    //console.log(teams.get(0))
    const teamDivs = teams.keys().map(team=>(<div className={`mx-2 p-2  ${team==winners? 'text-green-500' : 'text-red-500'} rounded-lg`} key={`${team}`}>{teams.get(team).map(player => <p key={player.name}>{player.name}</p>)}</div>))
    .toArray()
    console.log(teamDivs)

    return (<div className={`px-4 py-2 ${props.selected? 'bg-neutral-500' : 'bg-neutral-900 hover:bg-neutral-800'} transition-all duration-300 m-1`}
    onClick={(()=>{props.replaySelector(props.replayData.filename)})}>
        <div className="font-semibold">{gameType} on {map}</div>
        <div className="text-base text-neutral-500 ">
            {date ? new Date(date).toLocaleString() : 'Unknown'} • {durationMinutes} min
        </div>
        <div className='flex text-base'>
             {teamDivs.flatMap( (div, idx) => idx === 0 ? [div] : [<p className="align-middle my-auto" key={`vs-${idx}`}>vs</p>, div])}
        </div>
    </div>)
}


function SelectedReplay(props:{replayData:ReplayData, playReplay}){
    const teams = props.replayData.teams
    const winners = props.replayData.winners
    const teamDivs = teams.keys().map(team=>(<div className={`mx-2 p-2  ${team==winners? 'text-green-500' : 'text-red-500'} rounded-lg`} key={`${team}`}>{teams.get(team).map(player => <p key={player.name}>{player.name}</p>)}</div>))
    .toArray()
    const handlePlayReplay = ():void=>{
        props.playReplay.mutate({filename:props.replayData.filename})
    }
    return (
        <div>
            <div className='font-semibold text-center'>
                {props.replayData.gameType} on {props.replayData.map}

            </div>        
            <div className='flex text-base justify-center'>
             {teamDivs.flatMap( (div, idx) => idx === 0 ? [div] : [<p className="align-middle my-auto" key={`vs-${idx}`}>vs</p>, div])}
        </div>

            <div className='text-sm text-neutral-500'>
                 {props.replayData.filename}
            </div>
            <div className='bg-neutral-900 text-center text-2xl flex justify-center hover:bg-neutral-700 transtion-all duration-300'
            onClick={handlePlayReplay}>
                Play Replay
            </div>

        </div>
    )
}
export default function ReplaysVeiw():JSX.Element{
    const [selectedGame, setSelectedGame] = useState<'zerok' | 'bar'>('zerok')
    const replayQuery = trpc.getReplays.useQuery({ game: selectedGame })
    const replayOpener = trpc.openReplay.useMutation()
    const replays = new Map()
    const [selectedReplay,setSelectedReplay] = useState("");
    console.log(selectedReplay)
    
    if(replayQuery.isSuccess)
        replayQuery.data.data.forEach(replay => replays.set(replay.filename, replay));
    

    //console.log(replays.data)
    return <>
    <div>
        <div className='flex gap-4 mb-4 p-4 bg-neutral-800'>
            <button 
                className={`px-4 py-2 rounded ${selectedGame === 'zerok' ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-300'}`}
                onClick={() => setSelectedGame('zerok')}
            >
                Zero-K
            </button>
            <button 
                className={`px-4 py-2 rounded ${selectedGame === 'bar' ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-300'}`}
                onClick={() => setSelectedGame('bar')}
            >
                Beyond All Reason
            </button>
        </div>
        <div className='mx-auto grid grid-cols-3 text-xl '>
            <div className='col-span-2 overflow-auto'>
               {replays.values().toArray().map(replay =>{
                let selected = false
                console.log(replay.filename)
                console.log(selectedReplay)
                if(replay.fileName==selectedReplay){
                    selected = true
                    console.log("selected!!!!!!!!!")
                }
                return Replay({replaySelector:setSelectedReplay,replayData:replay ,selected:selected})
               })}
               {replayQuery.isSuccess ? <></> : <div>Processing Replays..</div> } 
            </div>
            <div>
                {replays.has(selectedReplay)? SelectedReplay({replayData:replays.get(selectedReplay), playReplay:replayOpener}): <></>}
            </div>
            
        </div>
    </div>
    </>
}