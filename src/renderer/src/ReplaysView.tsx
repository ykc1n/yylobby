import { useState } from 'react'
import {trpc} from '../utils/trpc'
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"

interface PlayerData {
    name: string
    [key: string]: unknown
}

interface ReplayData {
    filename: string
    map: string
    game: string
    gameType: string
    duration: number
    date: Date
    players: PlayerData[]
    winners?: number[]
    teams: Map<number, PlayerData[]>
}

function Replay(props:{
    replaySelector: (filename: string) => void
    replayData: ReplayData
    selected: boolean
}):JSX.Element{
  
    const map = props.replayData.map
    const date = props.replayData.date
    const gameType = props.replayData.gameType
    const durationMinutes = Math.floor(props.replayData.duration / 60000)
    const winners = props.replayData.winners?.[0]
    const teams = props.replayData.teams

    const teamDivs = teams.keys().map(team=>(
        <div className={`flex flex-col gap-1 ${team==winners? 'text-green-400' : 'text-red-400'}`} key={`${team}`}>
            {teams.get(team)?.map(player => (
                <p key={player.name} className="text-sm truncate">{player.name}</p>
            ))}
        </div>
    )).toArray()

    return (
        <Card 
            className={`cursor-pointer transition-all hover:border-neutral-600 ${props.selected ? 'border-neutral-500 bg-neutral-800' : 'border-neutral-800 bg-neutral-900/50'}`}
            onClick={() => props.replaySelector(props.replayData.filename)}
        >
            <CardContent className="p-4">
                <div className="font-semibold text-base mb-1">{gameType} • {map}</div>
                <div className="text-sm text-muted-foreground mb-3">
                    {date ? new Date(date).toLocaleDateString() : 'Unknown'} • {durationMinutes} min
                </div>
                <div className='flex gap-3 text-sm'>
                    {teamDivs.flatMap((div, idx) => idx === 0 ? [div] : [
                        <span key={`vs-${idx}`} className="text-muted-foreground self-center">vs</span>, 
                        div
                    ])}
                </div>
            </CardContent>
        </Card>
    )
}


function SelectedReplay(props:{replayData:ReplayData, playReplay: ReturnType<typeof trpc.openReplay.useMutation>}):JSX.Element{
    const teams = props.replayData.teams
    const winners = props.replayData.winners?.[0]
    const durationMinutes = Math.floor(props.replayData.duration / 60000)
    
    const teamDivs = teams.keys().map(team=>(
        <div className={`flex flex-col gap-1 p-3 rounded-lg border ${team==winners? 'text-green-400 border-green-900/50 bg-green-950/20' : 'text-red-400 border-red-900/50 bg-red-950/20'}`} key={`${team}`}>
            {teams.get(team)?.map(player => (
                <p key={player.name} className="text-sm truncate">{player.name}</p>
            ))}
        </div>
    )).toArray()
    
    const handlePlayReplay = ():void=>{
        props.playReplay.mutate({filename:props.replayData.filename})
    }
    
    return (
        <Card className="border-neutral-800 bg-neutral-900/50">
            <CardHeader>
                <CardTitle className="text-xl">{props.replayData.gameType} on {props.replayData.map}</CardTitle>
                <div className="text-sm text-muted-foreground">
                    {props.replayData.date ? new Date(props.replayData.date).toLocaleString() : 'Unknown'} • {durationMinutes} min
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className='flex gap-3 justify-center'>
                    {teamDivs.flatMap((div, idx) => idx === 0 ? [div] : [
                        <span key={`vs-${idx}`} className="text-muted-foreground self-center font-semibold">VS</span>, 
                        div
                    ])}
                </div>
                
                <div className='text-xs text-muted-foreground font-mono truncate'>
                    {props.replayData.filename}
                </div>
                
                <Button 
                    onClick={handlePlayReplay}
                    className="w-full"
                    size="lg"
                >
                    Play Replay
                </Button>
            </CardContent>
        </Card>
    )
}

export default function ReplaysVeiw():JSX.Element{
    const [selectedGame, setSelectedGame] = useState<'zerok' | 'bar'>('zerok')
    const replayQuery = trpc.getReplays.useQuery({ game: selectedGame })
    const replayOpener = trpc.openReplay.useMutation()
    const replays = new Map<string, ReplayData>()
    const [selectedReplay,setSelectedReplay] = useState("");
    
    if(replayQuery.isSuccess && Array.isArray(replayQuery.data.data)){
        replayQuery.data.data.forEach((replay: ReplayData) => replays.set(replay.filename, replay));
    }
    

    return (
        <div className="h-full flex flex-col overflow-hidden bg-background">
            <div className='flex gap-2 p-4 border-b border-border'>
                <Button 
                    variant={selectedGame === 'zerok' ? 'default' : 'outline'}
                    onClick={() => setSelectedGame('zerok')}
                >
                    Zero-K
                </Button>
                <Button 
                    variant={selectedGame === 'bar' ? 'default' : 'outline'}
                    onClick={() => setSelectedGame('bar')}
                >
                    Beyond All Reason
                </Button>
            </div>
            
            <div className='flex-1 grid grid-cols-3 gap-4 p-4 overflow-hidden min-h-0 min-w-0'>
                <div className='col-span-2 overflow-y-auto overflow-x-hidden min-w-0 space-y-2'>
                   {replayQuery.isSuccess ? (
                       replays.values().toArray().map(replay => {
                        const selected = replay.filename === selectedReplay
                        return <Replay 
                            key={replay.filename}
                            replaySelector={setSelectedReplay}
                            replayData={replay}
                            selected={selected}
                        />
                       })
                   ) : (
                       <div className="flex flex-col items-center justify-center h-full">
                           <div className="relative w-16 h-16 mb-4">
                               <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                           </div>
                           <div className="text-xl text-muted-foreground animate-pulse">
                               Processing Replays...
                           </div>
                       </div>
                   )}
                </div>
                
                <div className="overflow-y-auto min-w-0">
                    {selectedReplay && replays.has(selectedReplay) && (
                        <SelectedReplay 
                            replayData={replays.get(selectedReplay)!} 
                            playReplay={replayOpener}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
