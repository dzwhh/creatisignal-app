import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function Page() {
  return (
    <>
      <Topbar title="视频创作" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="视频创作" desc="基于 AI 模型生成短视频广告素材和 UGC 内容。" />
      </main>
    </>
  )
}
