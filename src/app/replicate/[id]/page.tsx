import { Topbar } from "@/components/layout/topbar"
import { ReplicateWorkspace } from "@/components/replicate/replicate-workspace"
import { MATERIALS } from "@/lib/insights/mock"

// Next.js 16: params is a Promise — must await
export default async function ReplicatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ product?: string; source?: string }>
}) {
  const { id } = await params
  const { product, source } = await searchParams

  const material = MATERIALS.find((m) => m.fingerprint === id) ?? null

  return (
    <>
      <Topbar title="复刻工作台" />
      <ReplicateWorkspace
        material={material}
        materialId={id}
        productSkuFromQuery={product}
        sourceFromQuery={source}
      />
    </>
  )
}
