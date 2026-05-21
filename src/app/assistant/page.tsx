import { Topbar } from "@/components/layout/topbar"
import { AssistantChat } from "@/components/assistant/assistant-chat"
import { TaskResultSection } from "@/components/dashboard/task-result-section"
import { TopCreativesSection } from "@/components/dashboard/top-creatives-section"
import { CompetitorSection } from "@/components/dashboard/competitor-section"

export default function AssistantPage() {
  return (
    <>
      <Topbar title="创意助手" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1040px] mx-auto px-6 py-8 pb-[72px]">
          {/* Hero */}
          <div className="text-center mb-6">
            <h1 className="text-[26px] font-extrabold leading-snug">创意助手</h1>
            <p className="mt-3 text-[14px] text-[#9a9da6]">
              选择任务类型，开始 AI 驱动的创意工作流
            </p>
          </div>

          {/* Chat box */}
          <AssistantChat />

          {/* Divider */}
          <div className="my-10 border-t border-[var(--line)]" />

          {/* Task results */}
          <TaskResultSection />

          {/* Top creatives */}
          <div className="mt-10">
            <TopCreativesSection />
          </div>

          {/* Competitor tracking */}
          <div className="mt-10">
            <CompetitorSection />
          </div>
        </div>
      </main>
    </>
  )
}
