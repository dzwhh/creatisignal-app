import { Topbar } from "@/components/layout/topbar"
import { AccountManagePage } from "@/components/insights/pages/account-manage-page"

export default function AccountsRoute() {
  return (
    <>
      <Topbar title="账户管理" />
      <main className="flex-1 overflow-y-auto bg-[var(--soft-2)]">
        <AccountManagePage />
      </main>
    </>
  )
}
