import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function Page() {
  return (
    <>
      <Topbar title="创意画布" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="创意画布" desc="自由编排素材元素，可视化设计广告创意版面。" />
      </main>
    </>
  )
}
