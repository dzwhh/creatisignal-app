"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  Bot,
  Database,
  FileSearch,
  Globe,
  Paperclip,
  Sparkles,
  Telescope,
  User as UserIcon,
  Wand2,
  Zap,
} from "lucide-react"
import { useAgentState, BLUEPRINTS, type AgentMessage, type ReasoningStep } from "@/lib/agent/state"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { ReasoningTrace } from "./reasoning-trace"
import { AnswerCard } from "./answer-card"
import { cn } from "@/lib/utils"

type CapabilityKey = keyof typeof BLUEPRINTS

const CAPABILITIES: Array<{
  id: CapabilityKey
  icon: typeof Telescope
  title: string
  hint: string
  prompt: string
  tone: "violet" | "amber" | "blue" | "green"
}> = [
  {
    id: "research",
    icon: Telescope,
    title: "研究市场对手",
    hint: "多步骤拆解竞品近 7 天投放结构",
    prompt: "分析竞品 fentybeauty 最近 7 天 TikTok 投放的爆款素材结构与受众覆盖，并对比我们的素材差异。",
    tone: "violet",
  },
  {
    id: "report",
    icon: FileSearch,
    title: "拉取数据 + 生成报告",
    hint: "从素材洞察拉数据 → 自动出复盘文档",
    prompt: "复盘本周 US TikTok GMV Max 投放，给出 ROI 低于 1.5 的素材 + 改进建议。",
    tone: "blue",
  },
  {
    id: "rewrite",
    icon: Wand2,
    title: "批量改写脚本",
    hint: "把已采纳脚本一键变 5 个 hook 变体",
    prompt: "为 Hotligh ZF7899 磁吸车载灯生成 5 个 hook 变体，主打防水和续航。",
    tone: "amber",
  },
  {
    id: "research",  // 重复指向 research，复用 blueprint
    icon: Zap,
    title: "监控我的素材表现",
    hint: "ROI < 1.5 自动提醒并提建议",
    prompt: "持续监控自有素材 ROI，低于 1.5 时给我消息提醒，并附改 hook 或暂停的建议。",
    tone: "green",
  },
]

const TONE_META: Record<"violet" | "amber" | "blue" | "green", { iconBg: string; iconColor: string }> = {
  violet: { iconBg: "#f5f3ff", iconColor: "#7c3aed" },
  amber:  { iconBg: "#fffbeb", iconColor: "#d97706" },
  blue:   { iconBg: "#eff6ff", iconColor: "#2563eb" },
  green:  { iconBg: "#f0fdf4", iconColor: "#16a34a" },
}

const TOOL_CHIPS: { icon: typeof Paperclip; label: string }[] = [
  { icon: Paperclip, label: "附件" },
  { icon: Globe,     label: "搜网" },
  { icon: Database,  label: "调用数据库" },
  { icon: Zap,       label: "Skills Hub" },
]

const STEP_DURATION_MS = 850

export function AgentChat() {
  const { state, startConversation, advanceReasoning, finalizeAnswer } = useAgentState()
  const activeThread = state.threads.find((t) => t.id === state.activeThreadId) ?? null

  const [input, setInput] = useState("")
  const [pickedBlueprint, setPickedBlueprint] = useState<CapabilityKey>("research")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new messages / running state
  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [activeThread?.messages.length, activeThread?.status])

  function pickCapability(c: typeof CAPABILITIES[number]) {
    setInput(c.prompt)
    setPickedBlueprint(c.id)
  }

  function send() {
    const text = input.trim()
    if (!text) return
    const blueprint = BLUEPRINTS[pickedBlueprint]
    const { threadId, agentMsgId, blueprint: bp } = startConversation(text, blueprint)
    setInput("")
    // 动画推理步骤：每步先 running, 1 个间隔后 done
    bp.reasoning.forEach((_, idx) => {
      window.setTimeout(() => advanceReasoning(threadId, agentMsgId, idx, "running"), idx * STEP_DURATION_MS + 100)
      window.setTimeout(() => advanceReasoning(threadId, agentMsgId, idx, "done"),     idx * STEP_DURATION_MS + STEP_DURATION_MS - 100)
    })
    // 最后一步完成后，揭示 answer
    window.setTimeout(() => finalizeAnswer(threadId, agentMsgId, bp.answer), bp.reasoning.length * STEP_DURATION_MS + 200)
  }

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-[var(--soft-2)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {activeThread ? (
          <ConversationView messages={activeThread.messages} />
        ) : (
          <WelcomeView onPick={pickCapability} />
        )}
      </div>

      {/* 底部输入栏 */}
      <div className="sticky bottom-0 border-t border-[var(--line)] bg-white px-6 py-3.5">
        <div className="max-w-[760px] mx-auto">
          <div className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 flex flex-col gap-2 shadow-[0_2px_12px_rgba(9,9,11,0.04)] focus-within:border-[var(--text)]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault()
                  send()
                }
              }}
              rows={2}
              placeholder={activeThread ? "继续追问…" : "问点什么，或粘贴链接 / 数据"}
              className="w-full resize-none outline-none text-[13px] leading-relaxed text-[var(--text)] placeholder:text-[var(--muted-2)]"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {TOOL_CHIPS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    className="h-7 px-2 rounded-md text-[11px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1"
                  >
                    <t.icon size={11} strokeWidth={2.4} />
                    {t.label}
                  </button>
                ))}
              </div>
              <RainbowButton
                type="button"
                disabled={!input.trim()}
                onClick={send}
                className="h-9 px-3.5 rounded-xl text-[12.5px]"
              >
                发送
                <ArrowRight size={12} strokeWidth={2.4} className="ml-1.5" />
              </RainbowButton>
            </div>
          </div>
          <p className="text-center text-[10px] text-[var(--muted-2)] mt-2">
            Agent 可能出错，请校验关键结论 · ⌘/Ctrl + Enter 发送
          </p>
        </div>
      </div>
    </main>
  )
}

// ─── Welcome 视图（无活跃 thread） ──────────────────────────────────────────

function WelcomeView({ onPick }: { onPick: (c: typeof CAPABILITIES[number]) => void }) {
  return (
    <div className="max-w-[760px] mx-auto px-8 py-10">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full bg-[var(--lime-soft)] border border-[#cdf066] text-[#3a4b1f] text-[11px] font-extrabold mb-3">
          <Sparkles size={10} strokeWidth={2.6} className="text-[#5a7821]" />
          AGENT · BETA
        </span>
        <h1 className="text-[26px] font-extrabold text-[var(--text)] tracking-tight leading-tight">
          Hello，想做点什么？
        </h1>
        <p className="text-[13px] text-[var(--muted)] mt-2">
          我能跑多步骤的研究 / 分析 / 生成任务，调用工具、读你的数据、自动出结果。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {CAPABILITIES.map((c, idx) => {
          const meta = TONE_META[c.tone]
          return (
            <button
              key={`${c.id}_${idx}`}
              type="button"
              onClick={() => onPick(c)}
              className="group rounded-2xl border border-[var(--line)] bg-white p-4 text-left cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(9,9,11,0.08)] hover:border-[var(--line-strong)]"
            >
              <div className="flex items-start gap-3 mb-2">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: meta.iconBg, color: meta.iconColor }}>
                  <c.icon size={16} strokeWidth={2.2} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-extrabold text-[var(--text)] leading-snug">{c.title}</p>
                  <p className="text-[11.5px] text-[var(--muted)] mt-1 leading-relaxed">{c.hint}</p>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--soft-2)] px-2.5 py-1.5 text-[11px] text-[var(--muted)] leading-relaxed line-clamp-2">
                {c.prompt}
              </div>
              <div className="mt-2 flex items-center justify-end text-[11px] font-extrabold text-[var(--text)] opacity-0 group-hover:opacity-100 transition-opacity">
                填入对话 <ArrowRight size={11} className="ml-1" />
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-center text-[11px] text-[var(--muted-2)] leading-relaxed">
        Agent 当前为 demo —— 点击能力卡填入示例，点发送会看到多步骤推理 → 多模态结果。
      </p>
    </div>
  )
}

// ─── 单条 thread 的 conversation timeline ──────────────────────────────────

function ConversationView({ messages }: { messages: AgentMessage[] }) {
  return (
    <div className="max-w-[820px] mx-auto px-6 py-6 space-y-5">
      {messages.map((m) => (m.role === "user" ? <UserBubble key={m.id} msg={m} /> : <AgentBlock key={m.id} msg={m} />))}
    </div>
  )
}

function UserBubble({ msg }: { msg: Extract<AgentMessage, { role: "user" }> }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="max-w-[85%] rounded-2xl bg-[var(--text)] text-white px-4 py-3 text-[13px] leading-relaxed">
        {msg.text}
      </div>
      <span className="w-8 h-8 rounded-full bg-[var(--soft)] text-[var(--text)] flex items-center justify-center shrink-0 mt-0.5">
        <UserIcon size={14} strokeWidth={2.4} />
      </span>
    </div>
  )
}

function AgentBlock({ msg }: { msg: Extract<AgentMessage, { role: "agent" }> }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-full bg-[var(--lime)] text-[#1a2010] flex items-center justify-center shrink-0 mt-0.5">
        <Bot size={14} strokeWidth={2.6} />
      </span>
      <div className="flex-1 min-w-0 space-y-3">
        <ReasoningTrace steps={msg.reasoning} />
        {msg.answer && <AnswerCard answer={msg.answer} />}
        {!msg.answer && <PendingAnswerCard reasoning={msg.reasoning} />}
      </div>
    </div>
  )
}

function PendingAnswerCard({ reasoning }: { reasoning: ReasoningStep[] }) {
  const total = reasoning.length
  const done = reasoning.filter((s) => s.status === "done").length
  return (
    <section className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-white p-5 text-center">
      <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--muted)] mb-2">
        <Sparkles size={11} className="text-[#7c3aed] animate-pulse" />
        生成结果中
      </div>
      <p className="text-[12px] text-[var(--muted)]">
        推理进度 <span className="font-extrabold text-[var(--text)] tabular-nums">{done}/{total}</span>，结果会自动出现在此处
      </p>
    </section>
  )
}
