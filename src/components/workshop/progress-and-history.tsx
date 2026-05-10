"use client"

import { useState, useEffect } from "react"

interface RunRecord {
  id: string
  challengeSlug: string
  finalPass: boolean
  totalScore: number
  createdAt: string
}

export function ProgressAndHistory() {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [unlockedWorkstations, setUnlockedWorkstations] = useState<string[]>([])
  const [runs, setRuns] = useState<RunRecord[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("goobs-progress")
    if (stored) {
      try {
        const p = JSON.parse(stored)
        setXp(p.xp ?? 0)
        setLevel(p.level ?? 1)
        setUnlockedWorkstations(p.unlockedWorkstations ?? [])
      } catch {}
    }
    const storedRuns = localStorage.getItem("goobs-runs")
    if (storedRuns) {
      try {
        setRuns(JSON.parse(storedRuns))
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "goobs-progress",
      JSON.stringify({ xp, level, unlockedWorkstations }),
    )
  }, [xp, level, unlockedWorkstations])

  const maxXpForLevel = level * 500 + 200

  return (
    <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold">Progress</h2>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Level {level}</span>
          <span className="text-xs text-gray-400">{xp} / {maxXpForLevel} XP</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${Math.min(100, (xp / maxXpForLevel) * 100)}%` }}
          />
        </div>
      </div>

      {unlockedWorkstations.length > 0 && (
        <div>
          <div className="mb-1 text-xs text-gray-400">Unlocked Workstations:</div>
          <div className="flex flex-wrap gap-1">
            {unlockedWorkstations.map((w) => (
              <span
                key={w}
                className="rounded bg-green-900/50 px-2 py-0.5 text-xs text-green-300"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {runs.length > 0 && (
        <div>
          <div className="mb-1 text-xs text-gray-400">Recent Runs:</div>
          <div className="max-h-40 space-y-1 overflow-auto">
            {runs.slice(-10).reverse().map((r) => (
              <div
                key={r.id}
                className={`flex items-center justify-between rounded px-2 py-1 text-xs ${
                  r.finalPass ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-300"
                }`}
              >
                <span>{r.challengeSlug}</span>
                <span className="text-gray-400">{r.finalPass ? "PASS" : "FAIL"} · {r.totalScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
