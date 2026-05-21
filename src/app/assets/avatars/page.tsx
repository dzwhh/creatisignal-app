import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function Page() {
  return (
    <>
      <Topbar title="数字人" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="数字人" desc="管理数字人形象、素材要求和可复用口播角色。" />
      </main>
    </>
  )
}
