import {trpc} from '../utils/trpc'

function Replay(props:{
    replayOpener,
    replayData:object
}):JSX.Element{
  
    const map = props.replayData.map
    const date = props.replayData.date
    const players = props.replayData.players
    const teams = new Map();
    const winners = props.replayData.winners[0]
    players.forEach(player => {
        console.log(player)
        if(!teams.has(player.allyTeamId)){
            teams.set(player.allyTeamId, [])
        }
        let team = teams.get(player.allyTeamId)
        team.push(player)
        teams.set(player.allyTeamId,team)
    })
    console.log("---------")
    console.log(players)
    console.log(teams)
    //console.log(teams.get(0))
    const teamDivs = teams.keys().map(team=>(<div className={`mx-2 p-2 bg-neutral-950 border-3 ${team==winners? 'text-green-500' : 'text-red-500'} rounded-lg`} key={`${team}`}>{teams.get(team).map(player => <p key={player.name}>{player.name}</p>)}</div>))
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
        Map: {map}
        <div className="text-base text-neutral-500 ">{date ? new Date(date).toLocaleString() : 'Unknown'}</div>
        <div className='flex'>
             {teamDivs.flatMap( (div) => [<p key={div}>vs</p>, div].slice(1))}
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
        Replays
        <div className='mx-auto  text-xl'>
            <div>
               {replaysList}
               {replays.isSuccess ? <></> : <div>Processing Replays..</div> } 
            </div>
            
        </div>
    </div>
    </>
}