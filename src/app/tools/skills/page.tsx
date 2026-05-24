import { Topbar } from "@/components/layout/topbar"
import { SkillsHub } from "@/components/tools/skills-hub"

export default function Page() {
  return (
    <>
      <Topbar title="Skills Hub" />
      <main className="flex-1 overflow-y-auto bg-white">
        <SkillsHub />
      </main>
    </>
  )
}
