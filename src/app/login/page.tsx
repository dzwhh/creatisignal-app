"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── mock 登录页：admin / adminx，通过后写 cs_auth cookie ────────────────────

const VALID_USER = "admin"
const VALID_PASS = "adminx"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (username.trim() !== VALID_USER || password !== VALID_PASS) {
      setError("账号或密码不正确")
      return
    }
    setError(null)
    setLoading(true)
    document.cookie = "cs_auth=1; path=/; max-age=604800"
    router.replace("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--panel)] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-[var(--lime)]/25 blur-[120px]" />
      <div className="absolute -bottom-40 -left-24 w-[380px] h-[380px] rounded-full bg-[var(--lime-soft)] blur-[100px]" />

      <div className="relative w-[400px] max-w-[calc(100vw-48px)]">
        <div className="flex flex-col items-center mb-7">
          <div className="w-11 h-11 rounded-xl bg-[var(--near-black)] flex items-center justify-center shadow-[0_10px_28px_rgba(9,9,11,0.25)]">
            <Sparkles size={20} className="text-[var(--lime)]" />
          </div>
          <h1 className="mt-3.5 text-[20px] font-extrabold text-[var(--text)]">CreatiSignal</h1>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">AI 驱动的创意广告工作台</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_20px_60px_rgba(9,9,11,0.08)]"
        >
          <label className="block">
            <span className="text-[12px] font-bold text-[var(--text)]">账号</span>
            <div className="mt-1.5 relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
              <input
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null) }}
                placeholder="请输入账号"
                autoComplete="username"
                className="w-full h-10 rounded-lg border border-[var(--line)] pl-9 pr-3 text-[13px] text-[var(--text)] placeholder:text-[var(--muted-2)] outline-none focus:border-[#b8d94a] focus:ring-2 focus:ring-[var(--lime)]/40 transition"
              />
            </div>
          </label>

          <label className="block mt-4">
            <span className="text-[12px] font-bold text-[var(--text)]">密码</span>
            <div className="mt-1.5 relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder="请输入密码"
                autoComplete="current-password"
                className="w-full h-10 rounded-lg border border-[var(--line)] pl-9 pr-10 text-[13px] text-[var(--text)] placeholder:text-[var(--muted-2)] outline-none focus:border-[#b8d94a] focus:ring-2 focus:ring-[var(--lime)]/40 transition"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "隐藏密码" : "显示密码"}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted-2)] hover:text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </label>

          {error && (
            <p className="mt-3 text-[12px] font-bold text-[#d4380d]">{error}</p>
          )}

          <button
            type="submit"
            disabled={!username || !password || loading}
            className={cn(
              "mt-5 w-full h-[42px] rounded-full bg-[var(--near-black)] text-white text-[13.5px] font-bold cursor-pointer transition-opacity",
              "hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
            )}
          >
            {loading ? "登录中…" : "登 录"}
          </button>
        </form>

        <p className="mt-5 text-center text-[11.5px] text-[var(--muted-2)]">
          登录即代表同意《服务条款》与《隐私政策》
        </p>
      </div>
    </div>
  )
}
