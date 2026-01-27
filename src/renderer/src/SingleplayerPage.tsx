import ReplaysVeiw from "./ReplaysView"
import SkirmishVeiw from "./SkirmishView"
import CampaignView from "./CampaignView"
import { Routes, Route, NavLink, Navigate } from "react-router-dom"
import { useThemeStore, themeColors } from "./themeStore"

export default function SingleplayerPage(): JSX.Element {
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const navLinkClass = ({ isActive }: { isActive: boolean }): string => {
    if (isActive) {
      return `relative px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all duration-300 ${theme.text} after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-current`
    }
    return "relative px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all duration-300 text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
  }

  return (<>
  <style>{`
    .subnav-glow::after {
      box-shadow: 0 0 6px rgba(${theme.rgb}, 0.4);
    }
  `}</style>
  <div className="bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-800/50 flex gap-1 px-2 py-1">
    <NavLink to="/Singleplayer/Replays" className={(props) => `${navLinkClass(props)} ${props.isActive ? 'subnav-glow' : ''}`}>
      Replays
    </NavLink>
    <NavLink to="/Singleplayer/Skirmish" className={(props) => `${navLinkClass(props)} ${props.isActive ? 'subnav-glow' : ''}`}>
      Skirmish
    </NavLink>
    <NavLink to="/Singleplayer/Campaign" className={(props) => `${navLinkClass(props)} ${props.isActive ? 'subnav-glow' : ''}`}>
      Campaign
    </NavLink>
  </div>
  <div>
    <Routes>
      <Route path="Replays" element={<ReplaysVeiw />} />
      <Route path="Skirmish" element={<SkirmishVeiw />} />
      <Route path="Campaign" element={<CampaignView />} />
      <Route path="" element={<Navigate to="/Singleplayer/Replays" replace />} />
    </Routes>
  </div>
  </>)
}
