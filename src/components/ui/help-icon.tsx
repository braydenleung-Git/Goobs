"use client"

import { useState, useRef, useEffect } from "react"

export function HelpIcon({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [open])

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="ml-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/5 text-[9px] text-subtext/40 hover:bg-white/15 hover:text-subtext/70 transition-colors cursor-pointer"
      >
        ?
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-56 animate-fade-in">
          <div className="glass-strong glass-border-accent rounded-xl px-3 py-2 text-[11px] text-subtext/80 leading-relaxed shadow-2xl">
            {children}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-px h-2 w-2 rotate-45 bg-surface border-r border-b border-white/5" />
        </div>
      )}
    </span>
  )
}
