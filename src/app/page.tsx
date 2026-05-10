"use client"

import dynamic from "next/dynamic"
import { RuntimeStateProvider } from "@/components/scene/runtime-state-adapter"
import { ConfigPanels } from "@/components/workshop/config-panels"
import { ChallengeRunnerPanel } from "@/components/workshop/challenge-runner-panel"
import { ProgressAndHistory } from "@/components/workshop/progress-and-history"
import { DemoControls } from "@/components/workshop/demo-controls"

const WorkshopScene = dynamic(
  () => import("@/components/scene/workshop-scene").then((m) => ({ default: m.WorkshopScene })),
  { ssr: false },
)

export default function WorkshopPage() {
  return (
    <RuntimeStateProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-950 text-gray-100">
        <header className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
          <h1 className="text-lg font-bold tracking-tight">
            Goobs <span className="text-xs font-normal text-gray-500">The Agent Workshop</span>
          </h1>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto border-r border-gray-800 p-4">
            <ConfigPanels />
            <ChallengeRunnerPanel />
          </div>

          <div className="flex flex-1 flex-col">
            <div className="flex-1">
              <WorkshopScene />
            </div>
            <div className="flex gap-4 border-t border-gray-800 p-2">
              <div className="w-72">
                <ProgressAndHistory />
              </div>
              <div className="flex-1">
                <DemoControls />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RuntimeStateProvider>
  )
}
