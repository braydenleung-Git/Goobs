"use client"

import type { ChallengeDef } from "@/lib/progression/progression-engine"

interface Props {
  challenge: ChallengeDef
  onDone: () => void
}

const GUIDES: Record<string, { learn: string; steps: string[] }> = {
  "create-agent": {
    learn: "How to create and name your first agent",
    steps: [
      "Click the Agents tab in the top nav",
      "Click 'Create Agent' and fill in a name",
      "Your agent will appear in the list — ready to deploy",
    ],
  },
  "add-skill": {
    learn: "How to give your agent knowledge with skills",
    steps: [
      "Open an agent's edit panel (pencil icon)",
      "Scroll to the Skills section and click 'Add Skill'",
      "Write markdown teaching your agent about a topic",
      "Save the skill — it's now part of your agent's knowledge",
    ],
  },
  "deploy-workshop": {
    learn: "How to bring your agent into the 3D workshop",
    steps: [
      "Go to the Workshop tab",
      "Open the agent drawer (left edge of screen)",
      "Drag an agent card into the scene",
      "Your agent appears as a chibi character in the 3D world",
    ],
  },
  "first-chat": {
    learn: "How to talk to your agent and see it respond",
    steps: [
      "Click on your agent in the 3D scene",
      "A chat panel opens on the right side",
      "Type a message and press Enter",
      "Watch your agent think, then respond with markdown-formatted answers",
    ],
  },
  "field-two-agents": {
    learn: "How to deploy multiple agents and unlock file tools",
    steps: [
      "Open the agent drawer (left edge)",
      "Drag a second agent into the workshop",
      "File tools (read/write/list) are now unlocked for all agents",
    ],
  },
  "write-a-file": {
    learn: "How agents write files using their tools",
    steps: [
      "Make sure your agent has a tool profile set (Read+Write or Full)",
      "Chat with your agent and ask it to write a file",
      "Watch the tool call card appear in the chat with a file link",
    ],
  },
  "exec-bash": {
    learn: "How agents run bash commands using their tools",
    steps: [
      "Make sure your agent has a Full tool profile",
      "Chat with your agent and ask it to run a command",
      "See the command and its output in the chat tool call card",
      "Bash tools are now unlocked permanently",
    ],
  },
  "build-script": {
    learn: "How agents combine writing and executing for real automation",
    steps: [
      "Ask your agent to write a Python script and run it",
      "It will write the file, then execute it with bash",
      "Repeat this 2 times to complete the challenge",
    ],
  },
}

export function ChallengeDetailPopup({ challenge, onDone }: Props) {
  const guide = GUIDES[challenge.id]
  const tierColors = ["", "#89b4fa", "#cba6f7", "#fab387"]
  const tierColor = tierColors[challenge.tier] || "#89b4fa"

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onDone} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="glass-strong glass-border-accent w-full max-w-md animate-scale-in rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full px-2 py-0.5 font-display text-[10px] font-bold" style={{ background: `${tierColor}20`, color: tierColor }}>
                Tier {challenge.tier}
              </span>
              <h2 className="font-display text-base font-bold text-text">{challenge.title}</h2>
            </div>
            <button onClick={onDone} className="btn-ghost flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs shrink-0">✕</button>
          </div>

          {challenge.description && (
            <p className="font-body text-xs text-subtext/50 mb-3">{challenge.description}</p>
          )}

          {guide && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm">📖</span>
                  <span className="font-display text-xs font-bold text-text/80">What you&apos;ll learn</span>
                </div>
                <p className="font-body text-[11px] text-subtext/60 leading-relaxed pl-6">{guide.learn}</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm">🎯</span>
                  <span className="font-display text-xs font-bold text-text/80">How to complete</span>
                </div>
                <ol className="pl-6 space-y-1">
                  {guide.steps.map((step, i) => (
                    <li key={i} className="font-body text-[11px] text-subtext/60 leading-relaxed list-decimal">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="rounded-full bg-green/10 px-2.5 py-0.5 font-display text-[10px] font-bold text-green">+{challenge.xpReward} XP</span>
            <button onClick={onDone} className="btn-primary rounded-full px-5 py-1.5 font-display text-xs font-bold">
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
