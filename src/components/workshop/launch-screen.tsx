"use client"

import { useState } from "react"
import { resetProgression } from "@/lib/progression/progression-engine"

interface Props {
  onStart: () => void
}

export function LaunchScreen({ onStart }: Props) {
  const [resetting, setResetting] = useState(false)

  const handleStart = async () => {
    setResetting(true)
    try {
      await fetch("/api/demo/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "full" }),
      })
    } catch {}
    localStorage.removeItem("goobs-walkthrough")
    localStorage.removeItem("goobs-progress")
    localStorage.removeItem("goobs-runs")
    resetProgression()
    setResetting(false)
    onStart()
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base">
      <div className="relative flex flex-col items-center gap-8 px-6">
        <h1
          className="font-display text-8xl sm:text-9xl md:text-[10rem] font-bold leading-none tracking-tight"
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
        </h1>

        <p className="font-body text-lg text-subtext/70 text-center max-w-md">
          Create chibi AI agents (called goobs), give them skills and tools, and watch them work and roam in a living 3D workshop
        </p>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleStart}
            disabled={resetting}
            className="group relative rounded-full px-8 py-3 font-display text-base font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, rgba(137,180,250,0.25), rgba(203,166,247,0.25))",
              border: "1px solid rgba(137,180,250,0.2)",
              color: "#cdd6f4",
              boxShadow: "0 0 30px rgba(137,180,250,0.15)",
            }}
          >
            <span className="relative z-10">{resetting ? "Resetting..." : "Get Started"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
