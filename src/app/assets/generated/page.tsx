import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function Page() {
  return (
    <>
      <Topbar title="AI 生成" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="AI 生成" desc="查看 AI 生成的图片、视频和爆款复刻结果。" />
      </main>
    </>
  )
}
