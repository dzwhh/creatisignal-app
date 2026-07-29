import { Topbar } from "@/components/layout/topbar"
import { GmvMaxShell, type GmvMaxTab } from "@/components/ads/gmv-max/gmv-max-shell"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const initialTab: GmvMaxTab = tab === "history" ? "history" : "create"

  return (
    <>
      <Topbar title="GMV Max 创编" />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <GmvMaxShell initialTab={initialTab} />
      </main>
    </>
  )
}
