import { Topbar } from "@/components/layout/topbar"
import { ReplicateWorkspace } from "@/components/replicate/replicate-workspace"
import { MATERIALS } from "@/lib/insights/mock"

// Next.js 16: params + searchParams are Promises — must await
export default async function ReplicatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ product?: string; source?: string; step?: string; title?: string }>
}) {
  const { id } = await params
  const { product, source, step: stepRaw, title } = await searchParams

  const material = MATERIALS.find((m) => m.fingerprint === id) ?? null
  // step 显式优先；否则交给 workspace 按 source 推断
  const stepNum = stepRaw ? Number(stepRaw) : NaN
  const initialStep = (stepNum >= 1 && stepNum <= 4 ? stepNum : undefined) as 1 | 2 | 3 | 4 | undefined

  return (
    <>
      <Topbar title="爆款复刻" />
      <ReplicateWorkspace
        material={material}
        materialId={id}
        productSkuFromQuery={product}
        sourceFromQuery={source}
        initialStep={initialStep}
        projectTitle={title}
      />
    </>
  )
}
