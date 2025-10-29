import ReplaysVeiw from "./ReplaysView"
import SkirmishVeiw from "./SkirmishView"
import CampaignView from "./CampaignView"
import { useState } from "react"
export default function SingleplayerPage(): JSX.Element {
  const veiws = new Map([
    ["Replays", ReplaysVeiw],
    ["Skirmish", SkirmishVeiw],
    ["Campaign", CampaignView]
  ])
  console.log(veiws)
  const [veiw,setVeiw] = useState("Replays")
  const navbuttonStyle = " transition-colors duration-150"

  return (<>

  <div
  className=" bg-neutral-900 flex gap-3 text-xl text-neutral-500"
  >
    <button className={navbuttonStyle+` ${veiw=="Replays"?"text-neutral-200 ":"text-neutral-500 hover:text-neutral-400"}`}
    onClick={()=>setVeiw("Replays")}>
      Replays
    </button>
    <button className={navbuttonStyle+` ${veiw=="Skirmish"?"text-neutral-200":"text-neutral-500 hover:text-neutral-400"}`}
    onClick={()=>setVeiw("Skirmish")} >
      Skirmish
    </button>
    <button className={navbuttonStyle+` ${veiw=="Campaign"?"text-neutral-200":"text-neutral-500 hover:text-neutral-400"}`}
    onClick={()=>setVeiw("Campaign")}>
      Campaign
    </button>
  </div>
  <div>
    {
    (()=>{


    switch(veiw){
      case "Replays":
        return <ReplaysVeiw/>
      
      case "Skirmish":
        return <SkirmishVeiw/> 
        
      case "Campaign":
        return <CampaignView/>
    }})()
    }
  </div>
  </>)
}
