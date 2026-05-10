"use client"

import { useState } from "react"

export function DemoControls() {
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
      </div>
    </div>
  )
}
