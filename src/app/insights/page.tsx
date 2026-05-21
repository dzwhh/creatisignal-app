import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function InsightsPage() {
  return (
    <>
      <Topbar title="素材洞察" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="素材洞察" desc="分析投放素材的表现趋势、创意创新方向与竞品对标数据。" />
      </main>
    </>
  )
}
