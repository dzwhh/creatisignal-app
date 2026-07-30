import { Topbar } from "@/components/layout/topbar"
import { BrandDetailRoute } from "@/components/competitors/brand-detail-route"
import { getBrandDetail } from "@/lib/competitors/mock"

// Next.js 16: params 是 Promise — 必须 await
export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = getBrandDetail(id)

  return (
    <>
      <Topbar title="品牌追踪" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1240px] mx-auto px-6 py-6 pb-[72px]">
          <BrandDetailRoute id={id} serverDetail={detail} />
        </div>
      </main>
    </>
  )
}
