"use client"

interface Props {
  onStart: () => void
  onSkip: () => void
}

export function LaunchScreen({ onStart, onSkip }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base">
      <div className="relative flex flex-col items-center gap-8 px-6">
        <h1
          className="font-display text-7xl sm:text-8xl md:text-9xl font-bold leading-none tracking-tight"
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
          Your agent workshop — create, train, and deploy AI companions in a living 3D playset
        </p>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onStart}
            className="group relative rounded-full px-8 py-3 font-display text-base font-bold transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, rgba(137,180,250,0.25), rgba(203,166,247,0.25))",
              border: "1px solid rgba(137,180,250,0.2)",
              color: "#cdd6f4",
              boxShadow: "0 0 30px rgba(137,180,250,0.15)",
            }}
          >
            <span className="relative z-10">Start Walkthrough</span>
          </button>

          <button
            onClick={onSkip}
            className="font-body text-xs text-subtext/30 hover:text-subtext/60 transition-colors"
          >
            skip to workshop
          </button>
        </div>
      </div>
    </div>
  )
}
