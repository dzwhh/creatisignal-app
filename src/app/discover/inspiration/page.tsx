import { Topbar } from "@/components/layout/topbar"
import { MaterialsContent } from "@/components/materials/materials-content"

export default function InspirationPage() {
  return (
    <>
      <Topbar title="灵感发现" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1240px] mx-auto px-6 py-8 pb-[72px]">
          <MaterialsContent />
        </div>
      </main>
    </>
  )
}
