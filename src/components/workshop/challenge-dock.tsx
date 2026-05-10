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
  const [open, setOpen] = useState(false)
  const [completed, setCompleted] = useState<string[]>([])

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
      <div className="fixed bottom-6 left-6 z-30 flex flex-col gap-2" style={{ bottom: "1.5rem", left: "6rem" }}>
        {toasts.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {toasts.map((t) => (
              <DockToast key={t.id} toast={t} onDone={() => onDismissToast(t.id)} />
            ))}
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="glass-strong glass-border-accent rounded-2xl px-4 py-2.5 flex items-center gap-3 transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue/20">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#89b4fa" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
            </div>
            <span className="font-display text-sm font-bold text-text">Walkthrough</span>
          </div>
          <span className="rounded-full bg-mauve/15 px-2 py-0.5 font-display text-xs font-bold text-mauve">
            {completedCount}/{totalSteps}
          </span>
          <svg
            className={`h-3.5 w-3.5 text-subtext/50 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="glass-strong glass-border-accent rounded-2xl p-4 w-72 animate-fade-in">
            <div className="space-y-1.5">
              {WALKTHROUGH_STEPS.map((step, i) => {
                const done = completed.includes(step.id)
                const active = currentStepIndex === i
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                      done ? "bg-green/5" : active ? "bg-blue/5" : "opacity-40"
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
                  </div>
                )
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="font-body text-[10px] text-subtext/30 text-center">
                {completedCount === totalSteps
                  ? "All challenges complete! 🎉"
                  : `Complete walkthrough steps to unlock rewards`}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
