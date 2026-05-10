"use client"

import { useState, useEffect } from "react"

interface Challenge {
  slug: string
  name: string
  description: string
  xpReward: number
  workstationTarget: string
}

export interface RunResult {
  runId: string
  challengeSlug: string
  output: string
  finalPass: boolean
  totalScore: number
  xpAwarded: number
  level: number
  runtimeEvents: string[]
  rationale: string
  toolCalls?: Array<{ name: string; success: boolean }>
}

interface Props {
  onRunStart?: (agentId: string, workstationTarget: string) => void
  onRunComplete?: (result: RunResult, agentId: string) => void
}

export function ChallengeRunnerPanel({ onRunStart, onRunComplete }: Props) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selected, setSelected] = useState("")
  const [agentId, setAgentId] = useState("")
  const [model, setModel] = useState("OpenCode/deepseek-v4-flash")
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([])
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)

  useEffect(() => {
    fetch("/api/challenges/run")
      .then((r) => r.json())
      .then(setChallenges)
    fetch("/api/agents")
      .then((r) => r.json())
      .then(setAgents)
  }, [])

  const runChallenge = async () => {
    if (!selected || !agentId) return
    setRunning(true)
    setResult(null)
    const challenge = challenges.find((c) => c.slug === selected)
    onRunStart?.(agentId, challenge?.workstationTarget ?? "computer")
    try {
      const res = await fetch("/api/challenges/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeSlug: selected, agentId, model }),
      })
      const data = await res.json()
      setResult(data)
      onRunComplete?.(data, agentId)
    } catch {
      setResult({
        runId: "",
        challengeSlug: selected,
        output: "",
        finalPass: false,
        totalScore: 0,
        xpAwarded: 0,
        level: 1,
        runtimeEvents: ["state:error"],
        rationale: "Network error during run",
      })
    } finally {
      setRunning(false)
    }
  }

  const selectedChallenge = challenges.find((c) => c.slug === selected)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {challenges.map((c) => (
          <button
            key={c.slug}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
              selected === c.slug
                ? "border-blue/30 bg-blue/5"
                : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
            }`}
            onClick={() => { setSelected(c.slug); setResult(null) }}
          >
            <div className="font-display text-sm font-bold text-text">{c.name}</div>
            <div className="mt-0.5 font-body text-xs text-subtext/70">
              {c.description}
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="tag-pill rounded-full bg-peach/10 px-2 py-0.5 font-body text-[10px] text-peach">
                {c.xpReward} XP
              </span>
              <span className="font-body text-[10px] text-subtext/50">
                {c.workstationTarget}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block font-display text-xs font-bold text-subtext uppercase tracking-wider">
            Agent
          </label>
          <select
            className="input-glass"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            <option value="">Select agent...</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block font-display text-xs font-bold text-subtext uppercase tracking-wider">
            Model
          </label>
          <input
            className="input-glass"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Model name"
          />
        </div>
      </div>

      <button
        className={`btn-primary w-full ${running ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={running || !selected || !agentId}
        onClick={runChallenge}
      >
        {running ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue/30 border-t-blue" />
            Running...
          </span>
        ) : (
          "Run Challenge"
        )}
      </button>

      {result && (
        <div
          className={`animate-fade-in rounded-2xl border p-4 ${
            result.finalPass
              ? "border-green/20 bg-green/5"
              : "border-red/20 bg-red/5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-display text-sm font-bold ${result.finalPass ? "text-green" : "text-red"}`}>
              {result.finalPass ? "PASS" : "FAIL"}
            </span>
            <span className="font-body text-xs text-subtext">
              Score: {result.totalScore}/100
            </span>
          </div>
          {result.finalPass && (
            <div className="mt-1 font-body text-xs text-subtext/70">
              +{result.xpAwarded} XP · Level {result.level}
            </div>
          )}
          {result.rationale && (
            <div className="mt-2 font-body text-xs text-subtext/60">
              {result.rationale}
            </div>
          )}
          {result.output && (
            <details className="mt-3">
              <summary className="cursor-pointer font-body text-xs text-subtext/50 hover:text-subtext">
                Output ({result.output.length} chars)
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-base/50 p-3 font-mono text-xs text-subtext/80">
                {result.output}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
