import { Topbar } from "@/components/layout/topbar"
import { ReplicateHub } from "@/components/replicate/replicate-hub"

export default function ReplicateHubPage() {
  return (
    <>
      <Topbar title="复刻工作台" />
      <ReplicateHub />
    </>
  )
}
