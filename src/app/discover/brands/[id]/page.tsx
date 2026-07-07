import Link from "next/link"
import { Topbar } from "@/components/layout/topbar"
import { BrandDetail } from "@/components/competitors/brand-detail"
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
          {detail ? (
            <BrandDetail detail={detail} />
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--line-strong)] py-20 text-center">
              <p className="text-[14px] text-[var(--muted)]">未找到该品牌</p>
              <Link
                href="/discover/brands"
                className="inline-block mt-3 text-[13px] font-extrabold text-[#5a7821] hover:underline"
              >
                返回品牌追踪
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
