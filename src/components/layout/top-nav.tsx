"use client"

import { useState, useEffect } from "react"

export type TabId = "workshop" | "agents"

interface TopNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onOpenConfig?: () => void
}

export function TopNav({ activeTab, onTabChange, onOpenConfig }: TopNavProps) {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    const load = () => {
      if (typeof window === "undefined") return
      const stored = localStorage.getItem("goobs-progress")
      if (stored) {
        try {
          const p = JSON.parse(stored)
          setXp(p.xp ?? 0)
          setLevel(p.level ?? 1)
        } catch {}
      }
    }
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [])

  const maxXpForLevel = level * 500 + 200
  const xpPercent = Math.min(100, (xp / maxXpForLevel) * 100)

  const tabs: { id: TabId; label: string }[] = [
    { id: "workshop", label: "Workshop" },
    { id: "agents", label: "Agents" },
  ]

  return (
    <nav className="relative z-50 mx-4 mt-2">
      <div className="glass rounded-2xl px-4 py-2">
        <div className="flex items-center">
          <div className="flex items-center gap-1 w-[200px]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={activeTab === tab.id ? "pill-active" : "pill-inactive"}
              >
                <span className="font-body text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 flex justify-center">
            <span
              className="font-display text-xl font-bold tracking-wide"
              style={{
                background: "linear-gradient(135deg, #89b4fa, #cba6f7, #f5c2e7, #a6e3a1, #fab387, #94e2d5, #89b4fa)",
                backgroundSize: "400% 400%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-flow 6s ease infinite",
              }}
            >
              goobs
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 w-[200px]">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-mauve/15 px-2.5 py-0.5 font-display text-xs font-bold text-mauve">
                Lv.{level}
              </span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-overlay/40">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${xpPercent}%`,
                    background: "linear-gradient(90deg, #cba6f7, #89b4fa, #94e2d5)",
                  }}
                />
              </div>
              <span className="font-body text-xs text-subtext">
                {xp}/{maxXpForLevel}
              </span>
            </div>
            {onOpenConfig && (
              <button
                onClick={onOpenConfig}
                className="btn-ghost flex h-8 w-8 items-center justify-center rounded-full p-0"
                title="Config"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
