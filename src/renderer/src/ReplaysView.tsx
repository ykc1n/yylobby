import {trpc} from '../utils/trpc'

interface ReplayData {
    filename: string
    map: string
    game: string
    gameType: string
    duration: number
    date: Date
    players: any[]
    winners?: number[]
}

function Replay(props:{
    replayOpener: unknown
    replayData: ReplayData
}):JSX.Element{
  
    const map = props.replayData.map
    const date = props.replayData.date
    const players = props.replayData.players
    const gameType = props.replayData.gameType
    const durationMinutes = Math.floor(props.replayData.duration / 60000)
    const teams = new Map();
    const winners = props.replayData.winners?.[0]
    players.forEach(player => {
        console.log(player)
        if(!teams.has(player.allyTeamId)){
            teams.set(player.allyTeamId, [])
        }
        const team = teams.get(player.allyTeamId)
        team.push(player)
        teams.set(player.allyTeamId,team)
    })
    console.log("---------")
    console.log(players)
    console.log(teams)

    //console.log(teams.get(0))
    const teamDivs = teams.keys().map(team=>(<div className={`mx-2 p-2  ${team==winners? 'text-green-500' : 'text-red-500'} rounded-lg`} key={`${team}`}>{teams.get(team).map(player => <p key={player.name}>{player.name}</p>)}</div>))
    .toArray()
    console.log(teamDivs)
    const handleOpenReplay = ():void => {
        console.log("Frontend: handleOpenReplay called with filename:", props.replayData.filename)
        props.replayOpener.mutate({filename:props.replayData.filename}, {
            onSuccess: () => {
                console.log("Frontend: Mutation succeeded")
            },
            onError: (error) => {
                console.error("Frontend: Mutation failed:", error)
            }
        })
    }

    return (<div className='px-4 py-2 bg-neutral-900 hover:bg-neutral-700 transition-all duration-300 m-1'
        onClick={handleOpenReplay}>
        <div className="font-semibold">{gameType} on {map}</div>
        <div className="text-base text-neutral-500 ">
            {date ? new Date(date).toLocaleString() : 'Unknown'} • {durationMinutes} min
        </div>
        <div className='flex text-base'>
             {teamDivs.flatMap( (div, idx) => idx === 0 ? [div] : [<p className="align-middle my-auto" key={`vs-${idx}`}>vs</p>, div])}
        </div>
    </div>)
}

export default function ReplaysVeiw():JSX.Element{
    const replays = trpc.getReplays.useQuery()
    const replayOpener = trpc.openReplay.useMutation()
    const replaysList = []
    if(replays.isSuccess){
        console.log("erm")
        replays.data.data.forEach(replay => {
            //console.log(replay)
            replaysList.push(Replay({ replayOpener:replayOpener, replayData:replay}))
        });
        
    } 

    //console.log(replays.data)
    return <>
    <div>
        <div className='mx-auto  text-xl'>
            <div>
               {replaysList}
               {replays.isSuccess ? <></> : <div>Processing Replays..</div> } 
            </div>
            
        </div>
    </div>
    </>
}