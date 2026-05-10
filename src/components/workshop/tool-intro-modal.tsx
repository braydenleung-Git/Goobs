"use client"

interface Props {
  onDone: () => void
}

export function ToolIntroModal({ onDone }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onDone} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="glass-strong glass-border-accent w-full max-w-md animate-scale-in rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
          <div className="mb-2 text-center">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="font-display text-lg font-bold text-text text-center mb-1">Tools Unlocked!</h2>
          <p className="font-body text-sm text-subtext/60 text-center mb-4">
            Your agents can now use tools to take real actions
          </p>

          <div className="space-y-3">
            <div className="rounded-xl bg-blue/5 border border-blue/10 p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">📄</span>
                <span className="font-display text-sm font-bold text-text">File Tools</span>
              </div>
              <p className="font-body text-[11px] text-subtext/60 leading-relaxed pl-7">
                Read, write, and list files in your agent&apos;s workspace.
              </p>
            </div>

            <div className="rounded-xl bg-peach/5 border border-peach/10 p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🖥</span>
                <span className="font-display text-sm font-bold text-text">Bash Commands</span>
              </div>
              <p className="font-body text-[11px] text-subtext/60 leading-relaxed pl-7">
                Run shell commands, execute scripts, install packages.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
            <p className="font-body text-[11px] text-subtext/50 leading-relaxed">
              <span className="text-blue">How to enable:</span> Open an agent&apos;s edit panel and set a
              tool profile. &quot;Read+Write&quot; gives file access, &quot;Full&quot; also allows bash commands.
              Then chat with your agent and ask it to use its tools.
            </p>
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
