import { Topbar } from "@/components/layout/topbar"
import { AnalysisDetail } from "@/components/assistant/analysis/analysis-detail"
import { loadSampleBreakdown } from "@/lib/replicate/breakdown-utils"

export default async function AnalysisDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ title?: string }>
}) {
  await params // 当前仅 demo，id 不影响数据；保留以便日后多 task 切换
  const { title } = await searchParams

  const data = loadSampleBreakdown()

  return (
    <>
      <Topbar title="创意分析" />
      <AnalysisDetail
        data={data}
        title={title?.trim() || "高 CTR 素材分析"}
        generatedAt="刚刚"
      />
    </>
  )
}
