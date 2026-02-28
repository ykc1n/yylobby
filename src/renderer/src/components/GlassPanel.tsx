import { HTMLAttributes } from 'react'

const variants = {
  default: "bg-black/60 backdrop-blur-2xl border border-white/[0.1] rounded-xl shadow-xl shadow-black/30",
  subtle:  "bg-black/30 backdrop-blur-xl border border-white/[0.08] rounded-lg shadow-lg shadow-black/20",
}

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants
}

export function GlassPanel({ variant = 'default', className, children, ...props }: GlassPanelProps) {
  return (
    <div className={`${variants[variant]} ${className ?? ''}`} {...props}>
      {children}
    </div>
  )
}
