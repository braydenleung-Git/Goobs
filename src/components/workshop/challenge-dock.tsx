"use client"

import { useState, useEffect, useRef } from "react"
import { getProgressionState, CHALLENGES, type Tier, type ChallengeDef } from "@/lib/progression/progression-engine"
import { ChallengeDetailPopup } from "./challenge-detail-popup"

interface Toast {
  id: string
  title: string
  subtitle: string
}

interface Props {
  toasts: Toast[]
  sidebarOpen?: boolean
  onDismissToast: (id: string) => void
}

function DockToast({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  const [progress, setProgress] = useState(100)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const duration = 3000
    const start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const elapsed = now - start
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        doneRef.current()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="animate-slide-up-fade rounded-2xl glass-strong glass-border-accent overflow-hidden shadow-2xl">
      <div className="px-5 py-3 flex items-center gap-3 min-w-[240px]">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/20 text-base">🎉</span>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm font-bold text-green">{toast.title}</div>
          <div className="font-body text-xs text-subtext/80 mt-0.5">{toast.subtitle}</div>
        </div>
      </div>
      <div className="h-0.5 w-full bg-white/5">
        <div className="h-full bg-green/40 transition-none" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

function TierBadge({ tier }: { tier: Tier }) {
  const colors = ["", "#89b4fa", "#cba6f7", "#fab387"]
  return (
    <span className="rounded-full px-2 py-0.5 font-display text-[10px] font-bold" style={{ background: `${colors[tier]}20`, color: colors[tier] }}>
      Tier {tier}
    </span>
  )
}

export function ChallengeDock({ toasts, onDismissToast, sidebarOpen }: Props) {
  const [state, setState] = useState(getProgressionState)
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeDef | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setState(getProgressionState())
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const visibleTiers = ([1, 2, 3] as Tier[]).filter((t) => t === state.tier && CHALLENGES.some((c) => c.tier === t))
  const allDone = CHALLENGES.every((c) => state.completedChallenges.includes(c.id))
  const completedCount = state.completedChallenges.length
  const totalChallenges = CHALLENGES.length

  const tierLabels: Record<number, string> = { 1: "Onboarding", 2: "Tools", 3: "Automation" }

  const counterLabel = (c: typeof CHALLENGES[number]) => {
    if (c.id === "field-two-agents") return `Agents deployed: ${state.counters.deployCount}/2`
    if (c.id === "write-a-file") return `Files written: ${state.counters.writeFileCount}/1`
    if (c.id === "exec-bash") return `Commands run: ${state.counters.bashExecCount}/1`
    if (c.id === "build-script") return `Scripts built: ${state.counters.buildScriptCount}/2`
    return ""
  }

  return (
    <>
      <div
        className="fixed z-30 flex flex-col gap-2 transition-all duration-200 ease-out"
        style={{ bottom: "1.5rem", left: sidebarOpen ? "17rem" : "1rem" }}
      >
        {toasts.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {toasts.map((t) => (
              <DockToast key={t.id} toast={t} onDone={() => onDismissToast(t.id)} />
            ))}
          </div>
        )}

        <div className="glass-strong glass-border-accent rounded-2xl overflow-hidden" style={{ width: "300px" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue/20">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#89b4fa" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            </div>
            <span className="font-display text-sm font-bold text-text">Challenges</span>
            <span className="ml-auto rounded-full bg-mauve/15 px-2 py-0.5 font-display text-xs font-bold text-mauve">
              {completedCount}/{totalChallenges}
            </span>
          </div>

          <div className="p-3 space-y-2">
            {allDone ? (
              <div className="text-center py-4 px-2">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-display text-sm font-bold text-green">All Challenges Complete</div>
                <div className="font-body text-[10px] text-subtext/50 mt-1">You&apos;ve mastered Goobs. Now go build something.</div>
              </div>
            ) : visibleTiers.map((tier) => {
              const challenges = CHALLENGES.filter((c) => c.tier === tier)
              const allDone = challenges.every((c) => state.completedChallenges.includes(c.id))
              return (
                <div key={tier}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-body text-[10px] text-subtext/40 uppercase tracking-wider">{tierLabels[tier]}</span>
                    <TierBadge tier={tier} />
                    {allDone && <span className="rounded-full bg-green/10 px-1.5 py-0.5 font-body text-[8px] text-green">done</span>}
                  </div>
                  {challenges.map((c, ci) => {
                    const done = state.completedChallenges.includes(c.id)
                    const active = !done && state.tier >= c.tier
                    return (
                      <div key={c.id} onClick={() => setSelectedChallenge(c)} className={`cursor-pointer flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1.5 transition-colors hover:bg-white/[0.03] ${done ? "bg-green/5" : active ? "bg-blue/5" : "opacity-40"}`}>
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${done ? "bg-green/20 text-green" : active ? "bg-blue/20 text-blue" : "bg-white/5 text-subtext/30"}`}>
                          {done ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <span>{ci + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-display text-xs font-bold ${done ? "text-green" : active ? "text-text" : "text-subtext/50"}`}>{c.title}</div>
                          <div className="font-body text-[10px] text-subtext/50 mt-0.5">{done ? `+${c.xpReward} XP` : counterLabel(c) || c.description}</div>
                        </div>
                        {!done && active && <span className="flex h-2 w-2 rounded-full bg-blue animate-pulse shrink-0" />}
                      </div>
                    )
                  })}
                  {tier < visibleTiers[visibleTiers.length - 1] && <div className="mt-2 mb-1 border-t border-white/5" />}
                </div>
              )
            })}

            {/* Unlock badges */}
            <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
              <UnlockBadge label="Filesystem" unlocked={state.unlocks.filesystem} />
              <UnlockBadge label="Bash" unlocked={state.unlocks.bash} />
            </div>
          </div>
        </div>
      </div>
      {selectedChallenge && <ChallengeDetailPopup challenge={selectedChallenge} onDone={() => setSelectedChallenge(null)} />}
    </>
  )
}

function UnlockBadge({ label, unlocked }: { label: string; unlocked: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-body text-[9px] tracking-wider uppercase transition-all ${unlocked ? "bg-green/10 text-green" : "bg-white/[0.03] text-subtext/20"}`}
    >
      {unlocked ? `${label} ✓` : label}
    </span>
  )
}
