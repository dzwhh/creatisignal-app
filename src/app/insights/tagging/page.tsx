import { Topbar } from "@/components/layout/topbar"
import { InsightsShell } from "@/components/insights/insights-shell"

export default function TaggingRoute() {
  return (
    <>
      <Topbar title="素材洞察" />
      <InsightsShell initialTab="tagging" />
    </>
  )
}
