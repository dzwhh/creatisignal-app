import { Topbar } from "@/components/layout/topbar"
import { ReportsContent, type ReportTab } from "@/components/reports/reports-content"

const VALID_TABS: ReportTab[] = ["report", "analysis", "brief", "generate"]

// Next.js 16: searchParams is a Promise — must await
export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; item?: string }>
}) {
  const { tab, item } = await searchParams
  const initialTab: ReportTab = VALID_TABS.includes(tab as ReportTab) ? (tab as ReportTab) : "report"
  const highlightFirst = item === "first"

  return (
    <>
      <Topbar title="我的任务" />
      <main className="flex-1 overflow-y-auto">
        <ReportsContent initialTab={initialTab} highlightFirst={highlightFirst} />
      </main>
    </>
  )
}
