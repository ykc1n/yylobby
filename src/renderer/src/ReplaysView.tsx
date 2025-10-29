import {trpc} from '../utils/trpc'

function Replay(props:{
    name:string
}):JSX.Element{
    let data = props.name.split("_")
    let map = data[2]
    let date = data[0]
    return (<div className='px-4 py-2 bg-neutral-900 hover:bg-neutral-700 transition-all duration-300 m-1'>
        Map: {map}
        <div className="text-base text-neutral-500 ">{date}</div>
    </div>)
}

export default function ReplaysVeiw():JSX.Element{
    const replays = trpc.getReplays.useQuery()
    const replaysList = []
    if(replays.isSuccess){
        replays.data.data.forEach(replay => {
            console.log(replay)
            replaysList.push(Replay({name:replay}))
        });
    }
    console.log(replays.data)
    return <>
    <div>
        Replays
        <div className='mx-auto  text-xl'>
            <div>
               {replaysList} 
            </div>
            
        </div>
    </div>
    </>
}