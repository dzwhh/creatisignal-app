import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function Page() {
  return (
    <>
      <Topbar title="我的报告" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="我的报告" desc="查看历史生成的创意 Report、分析结果和 Brief。" />
      </main>
    </>
  )
}
