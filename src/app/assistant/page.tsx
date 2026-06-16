import { Topbar } from "@/components/layout/topbar"
import { AssistantPageContent } from "@/components/assistant/assistant-page-content"

export default function AssistantPage() {
  return (
    <>
      <Topbar title="创意助手" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1040px] mx-auto px-6 py-8 pb-[72px]">
          <AssistantPageContent />
        </div>
      </main>
    </>
  )
}
