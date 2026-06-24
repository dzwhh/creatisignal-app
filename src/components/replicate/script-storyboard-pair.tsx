"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Check, Edit3, FileText, Film, Lock, Sparkles, Unlock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScriptStep, ScriptTimeRange, StoryboardShot } from "@/lib/insights/types"

interface Props {
  script: ScriptStep[]
  storyboard: StoryboardShot[]
  /** 若提供，则左栏直接显示这段原文（同步解析也用它），否则按 script[] 派生 */
  briefText?: string
}

// 把 ScriptStep[] 拼成一段可编辑文本（带 [timeRange] 标记）
function scriptToText(steps: ScriptStep[]): string {
  return steps.map((s) => `[${s.timeRange}] ${s.voiceover}`).join("\n\n")
}

// 把编辑后的文本解析回 timeRange 段落（兼容 [0-4s] 和 0–4s：两种格式）
function parseScriptText(text: string, knownTimeRanges: ScriptTimeRange[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const tr of knownTimeRanges) out[tr] = ""
  // 格式 1：[0-4s] content
  const r1 = /\[([\d.]+-[\d.]+s)\]([^[]*)/g
  let m: RegExpExecArray | null
  while ((m = r1.exec(text)) !== null) {
    const tr = m[1]
    if (tr in out) out[tr] = m[2].trim()
  }
  // 格式 2：- 0–4s：content  或  0-4s：content（带破折号或连字符 + 中文/英文冒号）
  const r2 = /[-•]?\s*([\d.]+)[-–]([\d.]+)s\s*[：:]\s*([^]*?)(?=(?:\n[-•]?\s*[\d.]+[-–][\d.]+s\s*[：:])|\n\s*\n|$)/g
  while ((m = r2.exec(text)) !== null) {
    const tr = `${m[1]}-${m[2]}s`
    if (tr in out && !out[tr]) {
      out[tr] = m[3].trim().replace(/\s+/g, " ").slice(0, 200)
    }
  }
  return out
}

export function ScriptStoryboardPair({ script, storyboard, briefText }: Props) {
  // 时间槽位从内容脚本派生（兼容任意分段、任意时长模板）
  const timeRanges = useMemo<ScriptTimeRange[]>(() => script.map((s) => s.timeRange), [script])

  // ─── 内容脚本（整段编辑） ───────────────────────────────────────────────
  // briefText 优先：左栏直接渲染原文；否则按 [timeRange] 标记格式渲染
  const initialText = briefText ?? scriptToText(script)
  const [scriptText, setScriptText] = useState(initialText)
  const [editingScript, setEditingScript] = useState(false)
  const [scriptDraft, setScriptDraft] = useState(initialText)

  useEffect(() => {
    const fresh = briefText ?? scriptToText(script)
    setScriptText(fresh)
    setScriptDraft(fresh)
    setEditingScript(false)
  }, [script, briefText])

  function startEditScript() {
    setScriptDraft(scriptText)
    setEditingScript(true)
  }
  function saveScript() {
    setScriptText(scriptDraft)
    setEditingScript(false)
  }
  function cancelEditScript() {
    setScriptDraft(scriptText)
    setEditingScript(false)
  }

  // ─── 分镜：默认空（仅时间槽位），同步按钮 AI 生成 ──────────────────────
  const emptyShots = useMemo<StoryboardShot[]>(() => {
    return timeRanges.map((tr) => ({
      timeRange: tr,
      framing: "—",
      shot: "",
      materials: [],
    }))
  }, [timeRanges])
  const [shots, setShots] = useState<StoryboardShot[]>(() => emptyShots)
  const [generated, setGenerated] = useState(false)
  const [locked, setLocked] = useState<Set<ScriptTimeRange>>(new Set())
  const [editingShotKey, setEditingShotKey] = useState<ScriptTimeRange | null>(null)
  const [shotDraft, setShotDraft] = useState("")

  useEffect(() => {
    setShots(emptyShots)
    setGenerated(false)
    setLocked(new Set())
    setEditingShotKey(null)
  }, [storyboard, emptyShots])

  function toggleLock(tr: ScriptTimeRange) {
    setLocked((prev) => {
      const next = new Set(prev)
      if (next.has(tr)) next.delete(tr); else next.add(tr)
      return next
    })
  }
  function startEditShot(tr: ScriptTimeRange, currentShot: string) {
    setShotDraft(currentShot)
    setEditingShotKey(tr)
  }
  function saveShot() {
    if (!editingShotKey) return
    setShots((prev) => prev.map((s) => s.timeRange === editingShotKey ? { ...s, shot: shotDraft } : s))
    setEditingShotKey(null)
  }
  function cancelEditShot() {
    setEditingShotKey(null)
  }

  // ─── 同步 = AI 根据内容脚本生成分镜 ─────────────────────────────────────
  const [syncing, setSyncing] = useState(false)
  // 基于槽位序号给一个合理的景别 / 默认素材回退
  function fallbackByPosition(index: number, total: number): { framing: string; materials: string[] } {
    if (total <= 1) return { framing: "中景", materials: ["主体", "场景元素"] }
    if (index === 0) return { framing: "近景", materials: ["主角面部特写", "动效气泡"] }
    if (index === total - 1) return { framing: "中近景", materials: ["品牌 Logo", "CTA 字幕", "二维码"] }
    // 中段按相对位置切换
    const pos = index / (total - 1)
    if (pos < 0.4) return { framing: "中景", materials: ["产品/界面", "使用场景"] }
    if (pos < 0.7) return { framing: "中近景", materials: ["产品细节", "对比演示"] }
    return { framing: "全景", materials: ["品牌动效", "信任元素"] }
  }
  function synthesizeShot(index: number, total: number, voiceover: string, fallback: StoryboardShot): { framing: string; shot: string; materials: string[] } {
    if (!voiceover.trim()) {
      return { framing: fallback.framing || "—", shot: fallback.shot, materials: fallback.materials }
    }
    const cfg = fallbackByPosition(index, total)
    const headline = voiceover.length > 38 ? voiceover.slice(0, 38) + "…" : voiceover
    return {
      framing: cfg.framing,
      shot: `${cfg.framing}：${headline}`,
      materials: cfg.materials,
    }
  }
  function handleSync() {
    if (syncing) return
    setSyncing(true)
    const parsed = parseScriptText(scriptText, timeRanges)
    window.setTimeout(() => {
      setShots((prev) => prev.map((s, i) => {
        if (locked.has(s.timeRange)) return s
        const voiceover = parsed[s.timeRange] ?? ""
        const fallback = storyboard.find((x) => x.timeRange === s.timeRange) ?? s
        const synth = synthesizeShot(i, prev.length, voiceover, fallback)
        return { ...s, ...synth }
      }))
      setGenerated(true)
      setSyncing(false)
    }, 1100)
  }

  const unlockedCount = timeRanges.length - locked.size

  return (
    <div className="flex items-stretch gap-3">
      {/* ─ 左：内容脚本（整段） ──────────────────────────────────────────── */}
      <section
        className={cn(
          "flex-1 rounded-xl border p-3 flex flex-col transition-all",
          editingScript
            ? "border-[#cdf066] bg-[var(--lime-soft)] shadow-[0_0_0_3px_rgba(201,255,41,0.32),0_8px_24px_rgba(201,255,41,0.18)]"
            : "border-[var(--line)] bg-white"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">
            <FileText size={11} />
            内容脚本
            {editingScript && (
              <span className="ml-1 inline-flex items-center gap-1 h-[18px] px-1.5 rounded-md bg-[var(--lime)] text-[#1a2010] text-[9.5px] font-extrabold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a2010] animate-pulse" />
                编辑中
              </span>
            )}
          </div>
          {!editingScript ? (
            <button
              type="button"
              onClick={startEditScript}
              className="h-6 px-2 rounded-full border border-[var(--line)] text-[10.5px] font-extrabold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1"
            >
              <Edit3 size={9} strokeWidth={2.4} />
              编辑
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={cancelEditScript}
                className="h-6 px-2 rounded-md border border-[var(--line)] text-[10.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1"
              >
                <X size={9} strokeWidth={2.4} /> 取消
              </button>
              <button
                type="button"
                onClick={saveScript}
                className="h-6 px-2 rounded-md bg-[var(--near-black)] text-white text-[10.5px] font-extrabold cursor-pointer hover:opacity-90 flex items-center gap-1"
              >
                <Check size={9} strokeWidth={2.6} /> 保存
              </button>
            </div>
          )}
        </div>

        {editingScript ? (
          <>
            <textarea
              value={scriptDraft}
              onChange={(e) => setScriptDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                  e.preventDefault()
                  saveScript()
                } else if (e.key === "Escape") {
                  cancelEditScript()
                }
              }}
              rows={12}
              autoFocus
              className="flex-1 rounded-lg border-2 border-[#cdf066] bg-white p-2.5 text-[11.5px] font-mono leading-relaxed text-[var(--text)] outline-none focus:border-[var(--lime)] focus:shadow-[0_0_0_3px_rgba(201,255,41,0.28)] resize-none transition-shadow"
              placeholder={`用 ${timeRanges.map((tr) => `[${tr}]`).join(" / ")} 标记每段口播`}
            />
            <p className="mt-1.5 text-[10px] text-[#5a7821] font-bold flex items-center gap-1">
              <Check size={9} strokeWidth={2.6} />
              已进入编辑模式 · ⌘/Ctrl+S 保存 · Esc 取消
            </p>
          </>
        ) : (
          <div className="flex-1 rounded-lg bg-[var(--soft-2)] border border-[var(--line)] p-2.5 overflow-y-auto">
            <pre className="text-[11.5px] font-mono leading-relaxed text-[var(--text)] whitespace-pre-wrap">
              {scriptText}
            </pre>
          </div>
        )}
      </section>

      {/* ─ 中：同步按钮（→ 主题色 hover "同步"） ─────────────────────────── */}
      <div className="flex items-center justify-center shrink-0">
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          title="把内容脚本的更新同步到右侧分镜（跳过已锁定）"
          className={cn(
            "group relative w-12 h-12 rounded-full flex items-center justify-center transition-all border",
            syncing
              ? "bg-[var(--lime-soft)] border-[#cdf066] cursor-wait"
              : "bg-white border-[var(--line)] hover:bg-[var(--lime)] hover:border-[#cdf066] cursor-pointer hover:shadow-[0_4px_14px_rgba(201,255,41,0.4)]"
          )}
        >
          {syncing ? (
            <Sparkles size={18} strokeWidth={2.6} className="text-[#1a2010] animate-pulse" />
          ) : (
            <ArrowRight
              size={18}
              strokeWidth={2.6}
              className="text-[var(--muted)] group-hover:text-[#1a2010] transition-colors"
            />
          )}
          {/* hover/同步状态 文字气泡 */}
          <span
            className={cn(
              "absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 h-5 rounded-md text-[10px] font-extrabold whitespace-nowrap pointer-events-none transition-opacity flex items-center gap-1",
              syncing
                ? "opacity-100 bg-[#1a2010] text-[var(--lime)]"
                : "opacity-0 group-hover:opacity-100 bg-[#1a2010] text-[var(--lime)]"
            )}
          >
            {syncing ? "AI 生成中…" : generated ? "重新生成分镜" : "AI 生成分镜"}
          </span>
        </button>
        {/* 锁定数提示 */}
        {locked.size > 0 && (
          <span className="absolute mt-[88px] inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-[#fffbeb] border border-[#fde68a] text-[9.5px] font-extrabold text-[#a16207] -translate-y-3 ml-[3px]">
            <Lock size={8} strokeWidth={2.6} />
            {locked.size} 锁
          </span>
        )}
      </div>

      {/* ─ 右：分镜脚本（每块独立锁定 + 编辑） ──────────────────────────── */}
      <section className="flex-1 rounded-xl border border-[var(--line)] bg-white p-3 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">
            <Film size={11} />
            分镜脚本
            {!generated && (
              <span className="ml-1 inline-flex items-center gap-1 h-[18px] px-1.5 rounded-md bg-[var(--soft)] text-[var(--muted)] text-[9.5px] font-extrabold tracking-wide">
                未生成
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-[var(--muted-2)]">
            {generated ? `${unlockedCount} 可同步 · ${locked.size} 已锁定` : `点击中间 → AI 生成`}
          </span>
        </div>
        {!generated && (
          <div className="flex-1 rounded-lg border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] flex flex-col items-center justify-center text-center p-6">
            <Sparkles size={24} className="text-[var(--muted-2)] mb-2" />
            <p className="text-[12.5px] font-extrabold text-[var(--text)]">分镜脚本尚未生成</p>
            <p className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed max-w-[260px]">
              确认好左侧内容脚本后，点击中间的 → 按钮，AI 会根据脚本自动生成分镜。
            </p>
          </div>
        )}
        {generated && (
        <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
          {shots.map((s) => {
            const isLocked = locked.has(s.timeRange)
            const isEditingThis = editingShotKey === s.timeRange
            return (
              <div
                key={s.timeRange}
                className={cn(
                  "rounded-lg border p-2 relative group transition-all",
                  isLocked
                    ? "border-[#cdf066] bg-[var(--lime-soft)]"
                    : "border-[var(--line)] bg-[var(--soft-2)]"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-extrabold text-[var(--muted-2)]">{s.timeRange}</span>
                    <span className="text-[10px] font-bold text-[var(--muted)]">· {s.framing}</span>
                  </div>
                  {/* 锁定按钮 */}
                  <button
                    type="button"
                    onClick={() => toggleLock(s.timeRange)}
                    title={isLocked ? "解锁分镜（同步将覆盖）" : "锁定分镜（同步不影响）"}
                    className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-colors",
                      isLocked
                        ? "bg-[#cdf066] text-[#1a2010] hover:bg-[var(--lime)]"
                        : "bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"
                    )}
                  >
                    {isLocked ? <Lock size={10} strokeWidth={2.6} /> : <Unlock size={10} strokeWidth={2.4} />}
                  </button>
                </div>

                {/* 镜头描述 */}
                {isEditingThis ? (
                  <textarea
                    value={shotDraft}
                    onChange={(e) => setShotDraft(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-[var(--line)] bg-white px-2 py-1.5 text-[11px] outline-none resize-none focus:border-[var(--line-strong)]"
                    autoFocus
                  />
                ) : (
                  <p className="text-[11.5px] font-semibold text-[var(--text)] leading-relaxed">{s.shot}</p>
                )}

                {/* 素材 / 备注（非编辑态展示） */}
                {!isEditingThis && (
                  <p className="text-[10.5px] text-[var(--muted)] mt-1">素材：{s.materials.join(" · ")}</p>
                )}

                {/* 右下角编辑按钮 / 编辑态的保存取消 */}
                {isEditingThis ? (
                  <div className="flex items-center justify-end gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={cancelEditShot}
                      className="h-6 px-2 rounded-md border border-[var(--line)] text-[10px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-white cursor-pointer flex items-center gap-1"
                    >
                      <X size={9} /> 取消
                    </button>
                    <button
                      type="button"
                      onClick={saveShot}
                      className="h-6 px-2 rounded-md bg-[var(--near-black)] text-white text-[10px] font-extrabold cursor-pointer hover:opacity-90 flex items-center gap-1"
                    >
                      <Check size={9} strokeWidth={2.6} /> 保存
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditShot(s.timeRange, s.shot)}
                    title="编辑这段分镜"
                    className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-md bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 size={9} strokeWidth={2.4} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        )}
      </section>
    </div>
  )
}
