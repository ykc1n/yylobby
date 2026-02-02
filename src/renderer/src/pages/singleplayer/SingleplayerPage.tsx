import ReplaysVeiw from "./ReplaysView"
import SkirmishVeiw from "./SkirmishView"
import CampaignView from "./CampaignView"
import { Routes, Route, NavLink, Navigate } from "react-router-dom"
import { useThemeStore, themeColors } from "../../themeStore"

export default function SingleplayerPage(): JSX.Element {
  const themeColor = useThemeStore((state) => state.themeColor)
  const theme = themeColors[themeColor]

  const navLinkClass = ({ isActive }: { isActive: boolean }): string => {
    if (isActive) {
      return `relative px-4 py-2 text-sm font-normal tracking-[0.1em] uppercase transition-all duration-200 ${theme.text} after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-px after:bg-current after:opacity-60`
    }
    return "relative px-4 py-2 text-sm font-normal tracking-[0.1em] uppercase transition-all duration-200 text-neutral-500 hover:text-neutral-400"
  }

  return (<>
  <div className="bg-black/30 backdrop-blur-xl border-b border-white/[0.08] flex gap-1 px-3 py-1">
    <NavLink to="/Singleplayer/Replays" className={navLinkClass}>
      Replays
    </NavLink>
    <NavLink to="/Singleplayer/Skirmish" className={navLinkClass}>
      Skirmish
    </NavLink>
    <NavLink to="/Singleplayer/Campaign" className={navLinkClass}>
      Campaign
    </NavLink>
  </div>
  <div className="">
    <Routes>
      <Route path="Replays" element={<ReplaysVeiw />} />
      <Route path="Skirmish" element={<SkirmishVeiw />} />
      <Route path="Campaign" element={<CampaignView />} />
      <Route path="" element={<Navigate to="/Singleplayer/Replays" replace />} />
    </Routes>
  </div>
  </>)
}
