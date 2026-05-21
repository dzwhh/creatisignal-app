import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function Page() {
  return (
    <>
      <Topbar title="上传的资产" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="上传的资产" desc="管理本地上传、插件采集和素材库选择的内容。" />
      </main>
    </>
  )
}
