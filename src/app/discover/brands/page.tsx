import { Topbar } from "@/components/layout/topbar"
import { BrandsOverview } from "@/components/competitors/brands-overview"

export default function BrandsPage() {
  return (
    <>
      <Topbar title="品牌追踪" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1240px] mx-auto px-6 py-8 pb-[72px]">
          <BrandsOverview />
        </div>
      </main>
    </>
  )
}
