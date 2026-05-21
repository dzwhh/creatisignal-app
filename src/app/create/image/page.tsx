import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function ImageCreatePage() {
  return (
    <>
      <Topbar title="图片创作" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="图片创作" desc="基于 AI 模型生成商品图、场景图与创意素材。" />
      </main>
    </>
  )
}
