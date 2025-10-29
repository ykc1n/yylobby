import BattleList from './BattleList'
import Chat from './Chat'
export default function MultiplayerPage(): JSX.Element {
  return (<>
            <div className='grid grid-cols-3'>
              <div className="col-span-2">    
            {/* <BattleListGrid/> */}
            <BattleList/>
            </div>  
            <Chat/> 
            </div>
  </>)
}
