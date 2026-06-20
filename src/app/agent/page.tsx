import { Topbar } from "@/components/layout/topbar"
import { AgentChat } from "@/components/agent/agent-chat"

export default function AgentPage() {
  return (
    <>
      <Topbar title="Agent" />
      <AgentChat />
    </>
  )
}
