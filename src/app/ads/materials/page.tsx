import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function Page() {
  return (
    <>
      <Topbar title="素材投放" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="素材投放" desc="管理广告系列与创意素材的投放配置和状态。" />
      </main>
    </>
  )
}
