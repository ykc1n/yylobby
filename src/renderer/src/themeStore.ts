import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeColor = 'blue' | 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber' | 'red'

interface ThemeState {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeColor: 'blue',
      setThemeColor: (color) => set({ themeColor: color }),
    }),
    {
      name: 'yylobby-theme',
    }
  )
)

// Color mappings for each theme
export const themeColors: Record<ThemeColor, {
  name: string
  text: string
  textHover: string
  bg: string
  bgSubtle: string
  bgHover: string
  border: string
  borderHover: string
  shadow: string
  shadowHover: string
  gradient: string
  rgb: string
}> = {
  blue: {
    name: 'Blue',
    text: 'text-blue-400',
    textHover: 'hover:text-blue-400',
    bg: 'bg-blue-600',
    bgSubtle: 'bg-blue-500/15',
    bgHover: 'hover:bg-blue-500',
    border: 'border-blue-500/30',
    borderHover: 'hover:border-blue-500/40',
    shadow: 'shadow-[0_0_12px_rgba(96,165,250,0.15)]',
    shadowHover: 'hover:shadow-[0_0_16px_rgba(96,165,250,0.25)]',
    gradient: 'from-blue-500/5',
    rgb: '96,165,250',
  },
  cyan: {
    name: 'Cyan',
    text: 'text-cyan-400',
    textHover: 'hover:text-cyan-400',
    bg: 'bg-cyan-600',
    bgSubtle: 'bg-cyan-500/15',
    bgHover: 'hover:bg-cyan-500',
    border: 'border-cyan-500/30',
    borderHover: 'hover:border-cyan-500/40',
    shadow: 'shadow-[0_0_12px_rgba(34,211,238,0.15)]',
    shadowHover: 'hover:shadow-[0_0_16px_rgba(34,211,238,0.25)]',
    gradient: 'from-cyan-500/5',
    rgb: '34,211,238',
  },
  violet: {
    name: 'Violet',
    text: 'text-violet-400',
    textHover: 'hover:text-violet-400',
    bg: 'bg-violet-600',
    bgSubtle: 'bg-violet-500/15',
    bgHover: 'hover:bg-violet-500',
    border: 'border-violet-500/30',
    borderHover: 'hover:border-violet-500/40',
    shadow: 'shadow-[0_0_12px_rgba(167,139,250,0.15)]',
    shadowHover: 'hover:shadow-[0_0_16px_rgba(167,139,250,0.25)]',
    gradient: 'from-violet-500/5',
    rgb: '167,139,250',
  },
  emerald: {
    name: 'Emerald',
    text: 'text-emerald-400',
    textHover: 'hover:text-emerald-400',
    bg: 'bg-emerald-600',
    bgSubtle: 'bg-emerald-500/15',
    bgHover: 'hover:bg-emerald-500',
    border: 'border-emerald-500/30',
    borderHover: 'hover:border-emerald-500/40',
    shadow: 'shadow-[0_0_12px_rgba(52,211,153,0.15)]',
    shadowHover: 'hover:shadow-[0_0_16px_rgba(52,211,153,0.25)]',
    gradient: 'from-emerald-500/5',
    rgb: '52,211,153',
  },
  rose: {
    name: 'Rose',
    text: 'text-rose-400',
    textHover: 'hover:text-rose-400',
    bg: 'bg-rose-600',
    bgSubtle: 'bg-rose-500/15',
    bgHover: 'hover:bg-rose-500',
    border: 'border-rose-500/30',
    borderHover: 'hover:border-rose-500/40',
    shadow: 'shadow-[0_0_12px_rgba(251,113,133,0.15)]',
    shadowHover: 'hover:shadow-[0_0_16px_rgba(251,113,133,0.25)]',
    gradient: 'from-rose-500/5',
    rgb: '251,113,133',
  },
  amber: {
    name: 'Amber',
    text: 'text-amber-400',
    textHover: 'hover:text-amber-400',
    bg: 'bg-amber-600',
    bgSubtle: 'bg-amber-500/15',
    bgHover: 'hover:bg-amber-500',
    border: 'border-amber-500/30',
    borderHover: 'hover:border-amber-500/40',
    shadow: 'shadow-[0_0_12px_rgba(251,191,36,0.15)]',
    shadowHover: 'hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]',
    gradient: 'from-amber-500/5',
    rgb: '251,191,36',
  },
  red: {
    name: 'Red',
    text: 'text-red-400',
    textHover: 'hover:text-red-400',
    bg: 'bg-red-600',
    bgSubtle: 'bg-red-500/15',
    bgHover: 'hover:bg-red-500',
    border: 'border-red-500/30',
    borderHover: 'hover:border-red-500/40',
    shadow: 'shadow-[0_0_12px_rgba(248,113,113,0.15)]',
    shadowHover: 'hover:shadow-[0_0_16px_rgba(248,113,113,0.25)]',
    gradient: 'from-red-500/5',
    rgb: '248,113,113',
  },
}

// Hook to get current theme colors
export function useTheme() {
  const themeColor = useThemeStore((state) => state.themeColor)
  return themeColors[themeColor]
}

// Get theme colors without hook (for non-component use)
export function getThemeColors(color: ThemeColor) {
  return themeColors[color]
}
