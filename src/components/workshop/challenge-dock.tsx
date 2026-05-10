"use client"

import { useState, useEffect } from "react"
import { WALKTHROUGH_STEPS, getWalkthroughState, type WalkthroughStep } from "@/lib/walkthrough/walkthrough-engine"

interface Toast {
  id: string
  step: WalkthroughStep
  level: number
}

interface Props {
  toasts: Toast[]
}

function DockToast({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 4000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="animate-slide-up-fade rounded-2xl glass-strong glass-border-accent px-5 py-3 flex items-center gap-3 min-w-[240px] shadow-2xl">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/20 text-base">🎉</span>
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm font-bold text-green">Challenge Complete!</div>
        <div className="font-body text-xs text-subtext/80 mt-0.5">
          {toast.step.title} · +{toast.step.xpReward} XP · Lv.{toast.level}
        </div>
      </div>
    </div>
  )
}

export function ChallengeDock({ toasts, onDismissToast }: { toasts: Toast[]; onDismissToast: (id: string) => void }) {
  const [completed, setCompleted] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const state = getWalkthroughState()
    setCompleted(state.completed)
    const interval = setInterval(() => {
      const s = getWalkthroughState()
      setCompleted(s.completed)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const currentStepIndex = WALKTHROUGH_STEPS.findIndex((s) => !completed.includes(s.id))
  const completedCount = completed.length
  const totalSteps = WALKTHROUGH_STEPS.length

  return (
    <>
      <div className="fixed z-30 flex flex-col gap-2" style={{ bottom: "1.5rem", left: "1rem" }}>
        {toasts.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {toasts.map((t) => (
              <DockToast key={t.id} toast={t} onDone={() => onDismissToast(t.id)} />
            ))}
          </div>
        )}

        <div className="glass-strong glass-border-accent rounded-2xl overflow-hidden" style={{ width: "280px" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue/20">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#89b4fa" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            </div>
            <span className="font-display text-sm font-bold text-text">Walkthrough</span>
            <span className="ml-auto rounded-full bg-mauve/15 px-2 py-0.5 font-display text-xs font-bold text-mauve">
              {completedCount}/{totalSteps}
            </span>
          </div>

          <div className="p-3 space-y-1">
            {WALKTHROUGH_STEPS.map((step, i) => {
              const done = completed.includes(step.id)
              const active = currentStepIndex === i
              const isExpanded = expanded === step.id
              return (
                <div key={step.id}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : step.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-left ${
                      done ? "bg-green/5" : active ? "bg-blue/5 hover:bg-blue/[0.08]" : "opacity-40 hover:opacity-60"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        done
                          ? "bg-green/20 text-green"
                          : active
                            ? "bg-blue/20 text-blue"
                            : "bg-white/5 text-subtext/30"
                      }`}
                    >
                      {done ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-display text-xs font-bold ${done ? "text-green" : active ? "text-text" : "text-subtext/50"}`}>
                        {step.title}
                      </div>
                      <div className="font-body text-[10px] text-subtext/50 mt-0.5">
                        {done ? `+${step.xpReward} XP earned` : step.description}
                      </div>
                    </div>
                    {!done && active && (
                      <span className="flex h-2 w-2 rounded-full bg-blue animate-pulse shrink-0" />
                    )}
                    <svg
                      className={`h-3 w-3 shrink-0 text-subtext/30 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="mx-3 mt-1 mb-2 rounded-lg bg-white/[0.03] px-3 py-2 animate-fade-in">
                      <div className="font-body text-[11px] text-subtext/70 leading-relaxed">
                        {step.title === "Become a Creator" && "Go to the Agents tab and fill out the create form. Give your agent a name, system prompt, and at least one skill."}
                        {step.title === "Skill Builder" && "Open the skill editor for your agent and write a skill in markdown. Skills define what your agent knows how to do."}
                        {step.title === "Into the Wild" && "Switch to the Workshop tab and drag your agent from the left sidebar into the 3D scene. Drop it anywhere on the grid."}
                        {step.title === "First Contact" && "Click on your agent in the scene to open the chat panel, then type a message and press send."}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {completedCount === totalSteps && (
            <div className="border-t border-white/5 px-4 py-2.5">
              <div className="font-body text-[10px] text-green/60 text-center">All challenges complete! 🎉</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
