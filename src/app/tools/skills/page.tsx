import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function Page() {
  return (
    <>
      <Topbar title="Skills Hub" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="Skills Hub" desc="配置和管理 AI 技能工作流，扩展创意工作台能力。" />
      </main>
    </>
  )
}
