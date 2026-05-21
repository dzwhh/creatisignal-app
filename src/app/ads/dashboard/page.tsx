import { Topbar } from "@/components/layout/topbar"
import { PlaceholderPage } from "@/components/ui/placeholder-page"

export default function Page() {
  return (
    <>
      <Topbar title="投放看板" />
      <main className="flex-1 overflow-y-auto">
        <PlaceholderPage title="投放看板" desc="实时查看广告账户的花费、展示、CTR 与 ROI 数据。" />
      </main>
    </>
  )
}
