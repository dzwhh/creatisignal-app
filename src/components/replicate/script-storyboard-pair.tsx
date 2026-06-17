"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, Check, Edit3, FileText, Film, Lock, Unlock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScriptStep, ScriptTimeRange, StoryboardShot } from "@/lib/insights/types"

interface Props {
  script: ScriptStep[]
  storyboard: StoryboardShot[]
}

const TIME_RANGES: ScriptTimeRange[] = ["0-3s", "3-8s", "8-13s", "13-15s"]

// 把 ScriptStep[] 拼成一段可编辑文本（带 [timeRange] 标记）
function scriptToText(steps: ScriptStep[]): string {
  return steps.map((s) => `[${s.timeRange}] ${s.voiceover}`).join("\n\n")
}

// 把编辑后的文本解析回 timeRange 段落，便于"同步"到分镜
function parseScriptText(text: string): Record<ScriptTimeRange, string> {
  const out: Record<ScriptTimeRange, string> = { "0-3s": "", "3-8s": "", "8-13s": "", "13-15s": "" }
  // 用 [time] 切分
  const regex = /\[(\d+-\d+s)\]([^\[]*)/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    const tr = m[1] as ScriptTimeRange
    if (TIME_RANGES.includes(tr)) {
      out[tr] = m[2].trim()
    }
  }
  return out
}

export function ScriptStoryboardPair({ script, storyboard }: Props) {
  // ─── 内容脚本（整段编辑） ───────────────────────────────────────────────
  const [scriptText, setScriptText] = useState(() => scriptToText(script))
  const [editingScript, setEditingScript] = useState(false)
  const [scriptDraft, setScriptDraft] = useState(scriptText)

  // 父级方向切换时（script 数组变），重置内部状态
  useEffect(() => {
    const fresh = scriptToText(script)
    setScriptText(fresh)
    setScriptDraft(fresh)
    setEditingScript(false)
  }, [script])

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

  // ─── 分镜：本地副本 + 锁定 + 单块编辑 ──────────────────────────────────
  const [shots, setShots] = useState<StoryboardShot[]>(() => storyboard)
  const [locked, setLocked] = useState<Set<ScriptTimeRange>>(new Set())
  const [editingShotKey, setEditingShotKey] = useState<ScriptTimeRange | null>(null)
  const [shotDraft, setShotDraft] = useState("")

  useEffect(() => {
    setShots(storyboard)
    setLocked(new Set())
    setEditingShotKey(null)
  }, [storyboard])

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

  // ─── 同步：把内容脚本对应段落同步到未锁定的分镜 ────────────────────────
  const [syncing, setSyncing] = useState(false)
  function handleSync() {
    if (syncing) return
    setSyncing(true)
    const parsed = parseScriptText(scriptText)
    setShots((prev) => prev.map((s) => {
      if (locked.has(s.timeRange)) return s
      const newVoiceover = parsed[s.timeRange]
      if (!newVoiceover) return s
      // mock 同步逻辑：把分镜 shot 描述改成"基于：xxx"
      return { ...s, shot: `（同步自内容脚本）${newVoiceover.slice(0, 40)}${newVoiceover.length > 40 ? "…" : ""}` }
    }))
    window.setTimeout(() => setSyncing(false), 800)
  }

  const unlockedCount = TIME_RANGES.length - locked.size

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
              placeholder="用 [0-3s] / [3-8s] / [8-13s] / [13-15s] 标记每段口播"
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
          <ArrowRight
            size={18}
            strokeWidth={2.6}
            className={cn(
              "transition-colors",
              syncing ? "text-[#1a2010]" : "text-[var(--muted)] group-hover:text-[#1a2010]"
            )}
          />
          {/* hover 显示"同步"主题色文字（小气泡） */}
          <span
            className={cn(
              "absolute -bottom-7 left-1/2 -translate-x-1/2 px-1.5 h-5 rounded-md text-[10px] font-extrabold whitespace-nowrap pointer-events-none",
              "transition-opacity",
              syncing
                ? "opacity-100 bg-[#1a2010] text-[var(--lime)]"
                : "opacity-0 group-hover:opacity-100 bg-[#1a2010] text-[var(--lime)]"
            )}
          >
            {syncing ? "同步中…" : "同步"}
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
          </div>
          <span className="text-[10px] font-bold text-[var(--muted-2)]">
            {unlockedCount} 可同步 · {locked.size} 已锁定
          </span>
        </div>
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
      </section>
    </div>
  )
}
