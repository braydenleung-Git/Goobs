"use client"

import { useState, useEffect } from "react"

export type TabId = "workshop" | "agents"

interface TopNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span
              className="font-display text-xl font-bold tracking-wide"
              style={{
                background: "linear-gradient(135deg, #89b4fa, #cba6f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              goobs
            </span>

            <div className="flex gap-1">
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
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>
    </nav>
  )
}
