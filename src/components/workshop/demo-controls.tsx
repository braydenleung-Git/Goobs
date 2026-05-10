"use client"

import { useState } from "react"

export function DemoControls() {
  const [showCriteria, setShowCriteria] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState("")

  const handleReset = async () => {
    setResetting(true)
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" })
      if (res.ok) {
        setMessage("Demo reset: runs cleared, agents and progress preserved")
      } else {
        setMessage("Reset failed")
      }
    } catch {
      setMessage("Reset failed — check server")
    } finally {
      setResetting(false)
    }
  }

  const handleFullReset = async () => {
    if (!confirm("This will reset all progress. Continue?")) return
    localStorage.removeItem("goobs-progress")
    localStorage.removeItem("goobs-runs")
    await handleReset()
    setMessage("Full reset complete — refresh the page")
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-900 p-4">
      <div className="flex gap-2">
        <button
          className="rounded bg-gray-700 px-3 py-1 text-xs hover:bg-gray-600 disabled:opacity-50"
          disabled={resetting}
          onClick={handleReset}
        >
          {resetting ? "Resetting..." : "Quick Reset"}
        </button>
        <button
          className="rounded bg-red-900/50 px-3 py-1 text-xs text-red-300 hover:bg-red-900"
          onClick={handleFullReset}
        >
          Full Reset
        </button>
        <button
          className="ml-auto rounded bg-gray-700 px-3 py-1 text-xs hover:bg-gray-600"
          onClick={() => setShowCriteria(!showCriteria)}
        >
          {showCriteria ? "Hide Criteria" : "Show Criteria"}
        </button>
      </div>

      {message && (
        <div className="rounded bg-blue-900/30 px-3 py-1 text-xs text-blue-300">
          {message}
        </div>
      )}

      {showCriteria && (
        <div className="space-y-2 rounded bg-gray-950 p-3 text-xs">
          <div className="font-semibold text-gray-300">Judging Alignment</div>
          <div className="space-y-1 text-gray-400">
            <p>
              <span className="text-indigo-300">Technical Execution:</span> R3F
              3D scene, real LLM orchestration, progression engine, Prisma/SQLite
            </p>
            <p>
              <span className="text-indigo-300">Innovation:</span> Embodied
              workshop characters with physical workstation routing
            </p>
            <p>
              <span className="text-indigo-300">Impact:</span> Learning loop
              for real agent concepts — prompts, models, tools
            </p>
            <p>
              <span className="text-indigo-300">Presentation:</span> Visual arc
              — create agent, walk to station, execute task, level up, unlock
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
