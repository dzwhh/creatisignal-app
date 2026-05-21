import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function Page() {
  return (
    <>
      <Topbar title="浏览器插件" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="浏览器插件" desc="安装和管理浏览器插件，一键采集竞品素材。" />
      </main>
    </>
  )
}
