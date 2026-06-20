"use client"

import { useCallback, useSyncExternalStore } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

export type ReasoningStepStatus = "pending" | "running" | "done"

export type ReasoningStep = {
  id: string
  label: string                   // 「搜网」「查库」...
  detail: string                  // 「12 条素材匹配」
  iconName:
    | "brain" | "globe" | "database" | "barchart" | "image" | "sparkles"
    | "filter" | "wand"
  status: ReasoningStepStatus
}

export type ChartKind = "pie" | "radar" | "line" | "bar"

export type ChartBlock = {
  kind: ChartKind
  title: string
  caption?: string
  data: Array<{ label: string; values: number[]; color?: string }>
  labels?: string[]               // 轴标签（折线 / 雷达用）
  domainLabels?: string[]         // 雷达多维标签
}

export type TableBlock = {
  title?: string
  columns: string[]
  rows: Array<Array<string | number>>
}

export type SuggestionChip = {
  label: string
  tone: "violet" | "amber" | "blue" | "green"
}

export type AnswerActionKind = "save_to_library" | "next_brief" | "go_replicate"

export type AgentAnswer = {
  intro: string                    // 自然语言开头
  kpis?: Array<{ label: string; value: string; sub?: string; tone?: "violet" | "amber" | "blue" | "green" }>
  charts?: ChartBlock[]
  table?: TableBlock
  highlights?: string[]            // bullet 要点
  suggestions?: SuggestionChip[]
  actions?: AnswerActionKind[]
}

export type AgentMessage =
  | { id: string; role: "user"; text: string; createdAt: string }
  | { id: string; role: "agent"; createdAt: string; reasoning: ReasoningStep[]; answer: AgentAnswer | null /* null when still computing */ }

export type AgentThread = {
  id: string
  title: string
  snippet: string
  createdAt: string
  status: "running" | "done"
  messages: AgentMessage[]
}

// ─── Mock initial threads ────────────────────────────────────────────────────

const MOCK_THREADS: AgentThread[] = [
  {
    id: "t1",
    title: "竞品 fentybeauty 投放结构",
    snippet: "已分析 12 条素材 · 输出报告 1 份",
    createdAt: "2026-06-20T14:08:00Z",
    status: "done",
    messages: [
      {
        id: "u1",
        role: "user",
        createdAt: "2026-06-20T14:08:00Z",
        text: "分析竞品 fentybeauty 最近 7 天 TikTok 投放的爆款素材结构与受众覆盖，并对比我们的素材差异。",
      },
      {
        id: "a1",
        role: "agent",
        createdAt: "2026-06-20T14:08:42Z",
        reasoning: [
          { id: "r1", label: "任务理解",      detail: "意图：竞品分析 + 横向对比",       iconName: "brain",     status: "done" },
          { id: "r2", label: "搜网",          detail: "fentybeauty TikTok · 近 7 天 · 12 条",  iconName: "globe",     status: "done" },
          { id: "r3", label: "查库",          detail: "拉取 Hotligh 自有素材 8 条",      iconName: "database",  status: "done" },
          { id: "r4", label: "数据分析",      detail: "聚类素材结构 → 提取共性元素",     iconName: "filter",    status: "done" },
          { id: "r5", label: "生成可视化",    detail: "3 张分析图 + 对比表",             iconName: "image",     status: "done" },
        ],
        answer: {
          intro: "我抓取了 fentybeauty 近 7 天 12 条 TikTok 素材，与你 Hotligh 的 8 条做了结构 + 受众层面的横向对比。下面是结论与建议。",
          kpis: [
            { label: "竞品素材数",    value: "12",    sub: "近 7 天",   tone: "violet" },
            { label: "主导风格",       value: "UGC 真实测评", sub: "占 67%", tone: "blue"   },
            { label: "平均 ROI 估算",  value: "2.8",   sub: "高于行业 +35%", tone: "green" },
            { label: "Hook 主类型",    value: "痛点提问", sub: "占 75%",  tone: "amber"  },
          ],
          charts: [
            {
              kind: "pie",
              title: "竞品素材结构分布",
              caption: "占比按 12 条样本聚类",
              data: [
                { label: "UGC 测评", values: [42], color: "#7c3aed" },
                { label: "口播开箱", values: [25], color: "#0ea5e9" },
                { label: "Before/After", values: [17], color: "#16a34a" },
                { label: "对比演示", values: [10], color: "#f97316" },
                { label: "其他",     values: [6],  color: "#a1a1aa" },
              ],
            },
            {
              kind: "radar",
              title: "维度对比（我们 vs 竞品）",
              caption: "0-100 评分",
              domainLabels: ["Hook 强度", "Scene 多样", "Selling 清晰", "证据可信", "CTA 直接", "视觉冲击"],
              data: [
                { label: "Hotligh", values: [72, 60, 78, 65, 55, 70], color: "#c9ff29" },
                { label: "fentybeauty", values: [88, 75, 70, 82, 60, 80], color: "#7c3aed" },
              ],
            },
            {
              kind: "line",
              title: "近 30 天日均 impressions 对比",
              labels: ["D-30", "D-25", "D-20", "D-15", "D-10", "D-5", "D-0"],
              data: [
                { label: "Hotligh",      values: [120, 132, 128, 140, 152, 148, 160], color: "#16a34a" },
                { label: "fentybeauty",  values: [210, 230, 248, 260, 282, 305, 320], color: "#7c3aed" },
              ],
            },
          ],
          table: {
            title: "关键指标对比",
            columns: ["维度", "Hotligh", "fentybeauty", "差距"],
            rows: [
              ["Hook 强度", 72, 88, "−16"],
              ["平均 ROI",  "1.9", "2.8", "−0.9"],
              ["视频时长 (s)", 18, 22, "−4"],
              ["UGC 占比",  "30%", "67%", "−37%"],
              ["证据出现率", "55%", "82%", "−27%"],
            ],
          },
          highlights: [
            "竞品 hook 强度 +16 分，强烈推荐复刻「痛点提问」类开头",
            "UGC 真实测评占比相差 37%，建议增加 UGC 拍摄计划",
            "证据可信度差距大 — 加入用户照片 / 检测报告 / 数据截图",
          ],
          suggestions: [
            { label: "复用「痛点提问」hook", tone: "violet" },
            { label: "增加 UGC 拍摄计划",      tone: "blue" },
            { label: "加入证据截图模块",      tone: "green" },
            { label: "拒绝模仿其品牌口号",     tone: "amber" },
          ],
          actions: ["save_to_library", "next_brief", "go_replicate"],
        },
      },
    ],
  },
  {
    id: "t2",
    title: "周二 US 投放复盘",
    snippet: "建议暂停 3 条 + 改 hook 5 条",
    createdAt: "2026-06-18T12:01:00Z",
    status: "done",
    messages: [
      {
        id: "u2",
        role: "user",
        createdAt: "2026-06-18T12:01:00Z",
        text: "复盘本周 US TikTok GMV Max 投放，给出 ROI 低于 1.5 的素材 + 改进建议。",
      },
      {
        id: "a2",
        role: "agent",
        createdAt: "2026-06-18T12:01:36Z",
        reasoning: [
          { id: "r1", label: "查库",     detail: "拉取本周 US 32 条素材",     iconName: "database", status: "done" },
          { id: "r2", label: "数据过滤", detail: "筛选 ROI < 1.5 → 8 条",     iconName: "filter",   status: "done" },
          { id: "r3", label: "建议生成", detail: "结合 hook / scene 模板",     iconName: "wand",     status: "done" },
        ],
        answer: {
          intro: "本周 US 共 32 条素材，其中 8 条 ROI < 1.5。建议如下：",
          kpis: [
            { label: "低 ROI 素材",  value: "8",   sub: "占 25%",  tone: "amber" },
            { label: "建议暂停",     value: "3",   sub: "ROI < 1.0", tone: "violet" },
            { label: "建议改 Hook", value: "5",   sub: "ROI 1.0-1.5", tone: "blue" },
          ],
          highlights: [
            "3 条 ROI < 1.0 的素材建议立即暂停",
            "5 条 ROI 1.0-1.5 的素材建议改写 hook + A/B 测",
            "整体投放健康度比上周下降 12%",
          ],
          suggestions: [
            { label: "暂停 ROI < 1.0",  tone: "amber" },
            { label: "AI 重写 hook",     tone: "violet" },
            { label: "导出 brief",       tone: "green" },
          ],
          actions: ["save_to_library", "next_brief"],
        },
      },
    ],
  },
  {
    id: "t3",
    title: "Hotligh ZF7899 文案 A/B",
    snippet: "5 个 hook 变体 / 已采纳 2",
    createdAt: "2026-06-17T21:08:00Z",
    status: "done",
    messages: [
      {
        id: "u3",
        role: "user",
        createdAt: "2026-06-17T21:08:00Z",
        text: "为 Hotligh ZF7899 磁吸车载灯生成 5 个 hook 变体，主打防水和续航。",
      },
      {
        id: "a3",
        role: "agent",
        createdAt: "2026-06-17T21:08:18Z",
        reasoning: [
          { id: "r1", label: "查库",     detail: "拉取 ZF7899 卖点", iconName: "database", status: "done" },
          { id: "r2", label: "改写",     detail: "生成 5 个 hook",   iconName: "wand",     status: "done" },
        ],
        answer: {
          intro: "为 ZF7899 生成 5 个 hook 变体，主打防水 + 续航：",
          highlights: [
            "「IPX7 全沉水 30 分钟，照样亮如初」",
            "「续航 30 小时，整夜照修不熄」",
            "「磁吸车顶免手持，泥泞天也能用」",
            "「3 档调光，应急 + 检修一灯搞定」",
            "「老司机不藏私的车载备灯首选」",
          ],
          suggestions: [
            { label: "采纳 Hook 1",  tone: "green" },
            { label: "采纳 Hook 2",  tone: "green" },
            { label: "再生成 5 条",   tone: "violet" },
          ],
          actions: ["save_to_library", "go_replicate"],
        },
      },
    ],
  },
]

// ─── Store ───────────────────────────────────────────────────────────────────

type AgentState = {
  threads: AgentThread[]
  activeThreadId: string | null
}

function defaultState(): AgentState {
  return { threads: MOCK_THREADS, activeThreadId: null }
}

let cached: AgentState | null = null
const listeners = new Set<() => void>()

function read(): AgentState {
  if (typeof window === "undefined") return SERVER_SNAPSHOT
  if (!cached) cached = defaultState()
  return cached
}

function set(updater: (prev: AgentState) => AgentState) {
  const prev = read()
  const next = updater(prev)
  if (next === prev) return
  cached = next
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

const SERVER_SNAPSHOT: AgentState = defaultState()
function getServerSnapshot(): AgentState { return SERVER_SNAPSHOT }

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAgentState() {
  const state = useSyncExternalStore(subscribe, read, getServerSnapshot)

  const selectThread = useCallback((id: string | null) => {
    set((s) => ({ ...s, activeThreadId: id }))
  }, [])

  const newThread = useCallback(() => {
    set((s) => ({ ...s, activeThreadId: null }))
  }, [])

  /**
   * Start a brand-new conversation. Creates a thread with a user message and
   * a placeholder agent message that will be filled in by playback.
   */
  const startConversation = useCallback((userText: string, blueprint: { reasoning: ReasoningStep[]; answer: AgentAnswer }) => {
    const tid = `t_${Date.now().toString(36)}`
    const userMsgId = `${tid}_u`
    const agentMsgId = `${tid}_a`
    const now = new Date().toISOString()
    set((s) => ({
      ...s,
      activeThreadId: tid,
      threads: [
        {
          id: tid,
          title: userText.length > 32 ? userText.slice(0, 32) + "…" : userText,
          snippet: "正在分析…",
          createdAt: now,
          status: "running",
          messages: [
            { id: userMsgId, role: "user", text: userText, createdAt: now },
            {
              id: agentMsgId,
              role: "agent",
              createdAt: now,
              reasoning: blueprint.reasoning.map((r) => ({ ...r, status: "pending" })),
              answer: null,
            },
          ],
        },
        ...s.threads,
      ],
    }))
    return { threadId: tid, agentMsgId, blueprint }
  }, [])

  const advanceReasoning = useCallback((threadId: string, agentMsgId: string, stepIdx: number, status: ReasoningStepStatus) => {
    set((s) => ({
      ...s,
      threads: s.threads.map((t) => {
        if (t.id !== threadId) return t
        return {
          ...t,
          messages: t.messages.map((m) => {
            if (m.id !== agentMsgId || m.role !== "agent") return m
            return {
              ...m,
              reasoning: m.reasoning.map((r, i) => i === stepIdx ? { ...r, status } : r),
            }
          }),
        }
      }),
    }))
  }, [])

  const finalizeAnswer = useCallback((threadId: string, agentMsgId: string, answer: AgentAnswer) => {
    set((s) => ({
      ...s,
      threads: s.threads.map((t) => {
        if (t.id !== threadId) return t
        return {
          ...t,
          status: "done" as const,
          snippet: answer.intro.length > 36 ? answer.intro.slice(0, 36) + "…" : answer.intro,
          messages: t.messages.map((m) =>
            m.id === agentMsgId && m.role === "agent"
              ? { ...m, answer }
              : m
          ),
        }
      }),
    }))
  }, [])

  return { state, selectThread, newThread, startConversation, advanceReasoning, finalizeAnswer }
}

// ─── DEV helpers ─────────────────────────────────────────────────────────────

if (typeof window !== "undefined") {
  ;(window as unknown as Record<string, unknown>).__cs_resetAgent = () => {
    cached = defaultState()
    listeners.forEach((l) => l())
    // eslint-disable-next-line no-console
    console.info("[CS] agent reset")
  }
}

// ─── Blueprints for "new chat" simulated runs ────────────────────────────────

export const BLUEPRINTS: Record<string, { reasoning: ReasoningStep[]; answer: AgentAnswer }> = {
  research: {
    reasoning: [
      { id: "r1", label: "任务理解",      detail: "意图：竞品分析 + 横向对比", iconName: "brain",    status: "pending" },
      { id: "r2", label: "搜网",          detail: "拉取近 7 天 TikTok 投放素材", iconName: "globe",    status: "pending" },
      { id: "r3", label: "查库",          detail: "拉取自有 Hotligh 素材",      iconName: "database", status: "pending" },
      { id: "r4", label: "数据分析",      detail: "聚类素材结构 / 提取共性",    iconName: "filter",   status: "pending" },
      { id: "r5", label: "生成可视化",    detail: "3 张分析图 + 对比表",         iconName: "image",    status: "pending" },
    ],
    answer: MOCK_THREADS[0].messages[1].role === "agent" ? MOCK_THREADS[0].messages[1].answer! : { intro: "" },
  },
  report: {
    reasoning: [
      { id: "r1", label: "查库",     detail: "拉取本周 US 32 条素材",    iconName: "database", status: "pending" },
      { id: "r2", label: "数据过滤", detail: "筛选 ROI < 1.5 → 8 条",   iconName: "filter",   status: "pending" },
      { id: "r3", label: "建议生成", detail: "结合 hook / scene 模板",   iconName: "wand",     status: "pending" },
    ],
    answer: MOCK_THREADS[1].messages[1].role === "agent" ? MOCK_THREADS[1].messages[1].answer! : { intro: "" },
  },
  rewrite: {
    reasoning: [
      { id: "r1", label: "查库", detail: "拉取 ZF7899 卖点", iconName: "database", status: "pending" },
      { id: "r2", label: "改写", detail: "生成 5 个 hook",   iconName: "wand",     status: "pending" },
    ],
    answer: MOCK_THREADS[2].messages[1].role === "agent" ? MOCK_THREADS[2].messages[1].answer! : { intro: "" },
  },
}
