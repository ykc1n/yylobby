export default function BattleList():JSX.Element{
    const numOfBattles = 50
    const battles = []
    for(let i =0;i<numOfBattles;i++){
        battles.push(Battle())
    }
    return(
        <div className="bg-neutral-950/70 backdrop-blur-xl p-4 m-4 rounded">

                
                <div className="flex py-2 items-center">
                <p className="text-3xl inline-block">Battles</p>
                
                {/* <p className="align-middle">Search</p>
                <input type="text" className="bg-white/1 shadow-[inset_0px_0px_40px_0px_rgba(255,255,255,.05)] rounded transition-color duration-300 hover:bg-white/5 m-2 p-1 px-2"/> */}
           </div> 

           
           

           
           <div className="px-5 grid grid-cols-3 h-[80vh] overflow-y-auto gap-8 ">
            {battles}
           </div>
         
        </div>
    )
}

function Battle():JSX.Element{
    return(

        <div className="p-4 rounded bg-white/1 shadow-[inset_0px_0px_20px_3px_rgba(255,255,255,.1)] transition-color duration-300 hover:bg-white/10 backdrop-blur-xl flex gap-4">
                <img
        src="src/assets/300.jpg"
        alt="test"
        height={100}
        width={100}
        /> 
        <div>

        
        <p className="text-m">therxyy's battle</p>
        
        <div className="flex gap-8 items-center">
            <p className="text-xl">2/2</p>
            <div>        
                <p>Some Map</p>
                <p> Running for 10m</p>

            </div>
        </div>
        </div>
        </div>
    )
}