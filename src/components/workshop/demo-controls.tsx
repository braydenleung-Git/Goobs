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
      setTimeout(() => setMessage(""), 3000)
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
    <div className="space-y-3">
      {message && (
        <div className="animate-fade-in rounded-xl bg-blue/10 px-4 py-2 font-body text-sm text-blue">
          {message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          className="btn-ghost rounded-full bg-white/[0.03] px-4 py-1.5 font-body text-xs font-medium"
          disabled={resetting}
          onClick={handleReset}
        >
          {resetting ? "Resetting..." : "Quick Reset"}
        </button>
        <button
          className="btn-ghost rounded-full bg-red/5 px-4 py-1.5 font-body text-xs font-medium text-red/80 hover:bg-red/10"
          onClick={handleFullReset}
        >
          Full Reset
        </button>
        <button
          className="btn-ghost ml-auto rounded-full bg-white/[0.03] px-4 py-1.5 font-body text-xs font-medium"
          onClick={() => setShowCriteria(!showCriteria)}
        >
          {showCriteria ? "Hide Criteria" : "Judging Criteria"}
        </button>
      </div>

      {showCriteria && (
        <div className="animate-fade-in rounded-2xl bg-base/50 p-4 font-body text-xs leading-relaxed text-subtext/80">
          <div className="mb-2 font-display text-sm font-bold text-text">Judging Alignment</div>
          <div className="space-y-2">
            <p>
              <span className="font-bold text-blue">Technical Execution:</span> R3F 3D scene, real LLM orchestration, progression engine, Prisma/SQLite
            </p>
            <p>
              <span className="font-bold text-mauve">Innovation:</span> Embodied workshop characters with physical workstation routing
            </p>
            <p>
              <span className="font-bold text-green">Impact:</span> Learning loop for real agent concepts — prompts, models, tools
            </p>
            <p>
              <span className="font-bold text-peach">Presentation:</span> Visual arc — create agent, walk to station, execute task, level up, unlock
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
