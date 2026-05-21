import { Topbar } from "@/components/layout/topbar"
import { CompetitorsContent } from "@/components/competitors/competitors-content"

export default function BrandsPage() {
  return (
    <>
      <Topbar title="品牌追踪" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1240px] mx-auto px-6 py-8 pb-[72px]">
          <CompetitorsContent />
        </div>
      </main>
    </>
  )
}
