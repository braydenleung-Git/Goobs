"use client"

interface Props {
  onDone: () => void
}

const INTROS = [
  { icon: "🤖", title: "Agents", body: "Chibi AI characters you create and customize. Each agent has a system prompt that defines its personality, skills it knows, and tools it can use." },
  { icon: "🧠", title: "Skills", body: "Knowledge blocks you write in markdown. Skills teach your agent about specific topics — like Python, design patterns, or your project's API." },
  { icon: "🔧", title: "Tools", body: "Actions your agent can take — reading and writing files, running bash commands. Tools are unlocked by completing challenges." },
  { icon: "🏆", title: "Challenges", body: "Guided missions that teach you step by step. Complete them to unlock new tools and capabilities for your agents." },
]

export function IntroCards({ onDone }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="glass-strong glass-border-accent w-full max-w-lg animate-scale-in rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
          <div className="mb-5 text-center">
            <h2 className="font-display text-xl font-bold text-text">Welcome to Goobs</h2>
            <p className="font-body text-sm text-subtext/60 mt-1">A quick look at what you can do</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {INTROS.map((item) => (
              <div key={item.title} className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5">
                <div className="text-lg mb-1.5">{item.icon}</div>
                <h3 className="font-display text-sm font-bold text-text mb-1">{item.title}</h3>
                <p className="font-body text-[11px] text-subtext/60 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-center">
            <button onClick={onDone} className="btn-primary rounded-full px-8 py-2.5 font-display text-sm font-bold">
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
