"use client"

import { useState, useEffect } from "react"

interface Challenge {
  slug: string
  name: string
  description: string
  xpReward: number
  workstationTarget: string
}

interface RunResult {
  runId: string
  challengeSlug: string
  output: string
  finalPass: boolean
  totalScore: number
  xpAwarded: number
  level: number
  runtimeEvents: string[]
  rationale: string
}

interface Props {
  onRunStart?: () => void
  onRunComplete?: (result: RunResult) => void
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
    onRunStart?.()
    try {
      const res = await fetch("/api/challenges/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeSlug: selected, agentId, model }),
      })
      const data = await res.json()
      setResult(data)
      onRunComplete?.(data)
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
    <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold">Challenges</h2>

      <div className="space-y-2">
        {challenges.map((c) => (
          <button
            key={c.slug}
            className={`w-full rounded border px-3 py-2 text-left text-sm transition ${
              selected === c.slug
                ? "border-indigo-500 bg-indigo-900/30"
                : "border-gray-600 bg-gray-800 hover:bg-gray-750"
            }`}
            onClick={() => setSelected(c.slug)}
          >
            <div className="font-medium">{c.name}</div>
            <div className="text-xs text-gray-400">
              {c.description} — {c.xpReward} XP
            </div>
            {c.workstationTarget && (
              <div className="mt-1 text-xs text-gray-500">
                Workstation: {c.workstationTarget}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <select
          className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm"
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

        <input
          className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Model name"
        />
      </div>

      <button
        className={`w-full rounded px-4 py-2 text-sm font-medium ${
          running
            ? "cursor-not-allowed bg-gray-600"
            : "bg-indigo-600 hover:bg-indigo-500"
        }`}
        disabled={running || !selected || !agentId}
        onClick={runChallenge}
      >
        {running ? "Running..." : "Run Challenge"}
      </button>

      {result && (
        <div
          className={`rounded border p-3 text-sm ${
            result.finalPass
              ? "border-green-700 bg-green-900/30"
              : "border-red-700 bg-red-900/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {result.finalPass ? "PASS" : "FAIL"}
            </span>
            <span className="text-xs text-gray-400">
              Score: {result.totalScore}/100
            </span>
          </div>
          {result.finalPass && (
            <div className="mt-1 text-xs text-gray-400">
              +{result.xpAwarded} XP · Level {result.level}
            </div>
          )}
          {result.rationale && (
            <div className="mt-1 text-xs text-gray-500">{result.rationale}</div>
          )}
          {result.output && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-gray-400">
                Output ({result.output.length} chars)
              </summary>
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded bg-gray-950 p-2 text-xs text-gray-300">
                {result.output}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
