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

// Color mappings for each theme - minimal glass aesthetic
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
    text: 'text-blue-400/90',
    textHover: 'hover:text-blue-400',
    bg: 'bg-blue-500/80',
    bgSubtle: 'bg-blue-500/10',
    bgHover: 'hover:bg-blue-500/90',
    border: 'border-blue-400/20',
    borderHover: 'hover:border-blue-400/30',
    shadow: '',
    shadowHover: '',
    gradient: 'from-blue-500/3',
    rgb: '96,165,250',
  },
  cyan: {
    name: 'Cyan',
    text: 'text-cyan-400/90',
    textHover: 'hover:text-cyan-400',
    bg: 'bg-cyan-500/80',
    bgSubtle: 'bg-cyan-500/10',
    bgHover: 'hover:bg-cyan-500/90',
    border: 'border-cyan-400/20',
    borderHover: 'hover:border-cyan-400/30',
    shadow: '',
    shadowHover: '',
    gradient: 'from-cyan-500/3',
    rgb: '34,211,238',
  },
  violet: {
    name: 'Violet',
    text: 'text-violet-400/90',
    textHover: 'hover:text-violet-400',
    bg: 'bg-violet-500/80',
    bgSubtle: 'bg-violet-500/10',
    bgHover: 'hover:bg-violet-500/90',
    border: 'border-violet-400/20',
    borderHover: 'hover:border-violet-400/30',
    shadow: '',
    shadowHover: '',
    gradient: 'from-violet-500/3',
    rgb: '167,139,250',
  },
  emerald: {
    name: 'Emerald',
    text: 'text-emerald-400/90',
    textHover: 'hover:text-emerald-400',
    bg: 'bg-emerald-500/80',
    bgSubtle: 'bg-emerald-500/10',
    bgHover: 'hover:bg-emerald-500/90',
    border: 'border-emerald-400/20',
    borderHover: 'hover:border-emerald-400/30',
    shadow: '',
    shadowHover: '',
    gradient: 'from-emerald-500/3',
    rgb: '52,211,153',
  },
  rose: {
    name: 'Rose',
    text: 'text-rose-400/90',
    textHover: 'hover:text-rose-400',
    bg: 'bg-rose-500/80',
    bgSubtle: 'bg-rose-500/10',
    bgHover: 'hover:bg-rose-500/90',
    border: 'border-rose-400/20',
    borderHover: 'hover:border-rose-400/30',
    shadow: '',
    shadowHover: '',
    gradient: 'from-rose-500/3',
    rgb: '251,113,133',
  },
  amber: {
    name: 'Amber',
    text: 'text-amber-400/90',
    textHover: 'hover:text-amber-400',
    bg: 'bg-amber-500/80',
    bgSubtle: 'bg-amber-500/10',
    bgHover: 'hover:bg-amber-500/90',
    border: 'border-amber-400/20',
    borderHover: 'hover:border-amber-400/30',
    shadow: '',
    shadowHover: '',
    gradient: 'from-amber-500/3',
    rgb: '251,191,36',
  },
  red: {
    name: 'Red',
    text: 'text-red-400/90',
    textHover: 'hover:text-red-400',
    bg: 'bg-red-500/80',
    bgSubtle: 'bg-red-500/10',
    bgHover: 'hover:bg-red-500/90',
    border: 'border-red-400/20',
    borderHover: 'hover:border-red-400/30',
    shadow: '',
    shadowHover: '',
    gradient: 'from-red-500/3',
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
