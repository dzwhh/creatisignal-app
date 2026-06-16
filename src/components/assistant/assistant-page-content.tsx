"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useOnboardingState, type TaskKind } from "@/lib/onboarding/state"
import { AssistantChat, type ChatPrefill, type ModeId } from "./assistant-chat"
import { OnboardingHero, type PathPick } from "./onboarding-hero"
import { ExamplePrompts, type ExamplePick } from "./example-prompts"
import { SpotlightTour } from "./spotlight-tour"
import { SubmitArrowTip } from "./submit-arrow-tip"
import { TaskResultModal } from "./task-result-modal"
import { TaskResultSection } from "@/components/dashboard/task-result-section"
import { TopCreativesSection } from "@/components/dashboard/top-creatives-section"
import { CompetitorSection } from "@/components/dashboard/competitor-section"

const GENERATION_DELAY_MS = 1500

const KIND_TO_TASK_INDEX: Record<TaskKind, number> = {
  report:   0,
  analysis: 1,
  brief:    2,
  video:    3,
}

// Step 0 文案：指向「高亮的任务结果卡」
const STEP0_COPY: Record<TaskKind, { title: string; desc: string }> = {
  report:   { title: "你的第一份报告已生成！", desc: "我们已把它放进「任务结果」。点这张卡打开看看。" },
  video:    { title: "你的第一条 30s 视频已生成！", desc: "我们已把它放进「任务结果 · 生成结果」。点这张卡打开看看。" },
  brief:    { title: "Brief 已经准备好", desc: "我们已把它放进「任务结果 · Brief 结果」。点这张卡打开看看。" },
  analysis: { title: "分析报告已出", desc: "我们已把它放进「任务结果 · 分析结果」。点这张卡打开看看。" },
}

// Step 1 文案（modal 关闭后）：指向「查看全部」按钮
const STEP1_COPY = {
  title: "去看全部任务结果",
  desc: "所有 AI 任务结果都收录在「我的任务」。点查看全部进入。",
}

// 从 hero 卡 mode 推回 ChatPrefill 的 key
function fillKeyOf(m: ModeId): keyof ChatPrefill {
  return m
}

export function AssistantPageContent() {
  const {
    state,
    isNewUser,
    freeTriesRemaining,
    freeTriesTotal,
    shouldShowFirstWinToast,
    shouldShowRevealHint,
    dismiss,
    markFirstWin,
    markFirstWinSeen,
    markRevealHintSeen,
    useTrial,
    reset,
  } = useOnboardingState()

  const [mode, setMode] = useState<ModeId>("report")
  const [prefill, setPrefill] = useState<ChatPrefill>({})

  // 新用户：默认只看 4 卡，点卡后揭示 chat box
  const [revealed, setRevealed] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [spotlightKind, setSpotlightKind] = useState<TaskKind | null>(null)
  // 0 = 高亮 task-result-card；1 = 高亮 view-all-btn；null = 引导结束
  const [spotlightStep, setSpotlightStep] = useState<0 | 1 | null>(null)
  // 任务结果详情 modal（点高亮卡后弹）
  const [resultModalOpen, setResultModalOpen] = useState(false)

  // 控制 SubmitArrowTip 当前是否激活（首次进入 chat box 后显示）
  const [arrowTipActive, setArrowTipActive] = useState(false)

  // 点 hero 卡：切 mode + 预填 + 揭示 chat box；首次触发箭头
  function handlePickPath(pick: PathPick) {
    setMode(pick.mode)
    setPrefill((prev) => ({ ...prev, [fillKeyOf(pick.mode)]: pick.value }))
    setRevealed(true)
    if (shouldShowRevealHint) setArrowTipActive(true)
  }

  // 示例 chip（老用户视图下方），不展示箭头引导
  function handlePickExample(pick: ExamplePick) {
    if (pick.mode === "report" || pick.mode === "generate" || pick.mode === "analysis" || pick.mode === "brief") {
      setMode(pick.mode)
      setPrefill((prev) => ({ ...prev, [pick.mode]: pick.value }))
    }
  }

  // send 触发：扣配额 → 1.5s 模拟生成 → markFirstWin → spotlight 进入 step 0
  function handleFirstWin(kind: TaskKind) {
    if (submitting) return
    if (arrowTipActive) {
      setArrowTipActive(false)
      markRevealHintSeen()
    }
    setSubmitting(true)
    useTrial()
    window.setTimeout(() => {
      markFirstWin(kind)
      setSubmitting(false)
      setSpotlightKind(kind)
      setSpotlightStep(0)
    }, GENERATION_DELAY_MS)
  }

  // 刷新或重进 /assistant：若 firstWinDone && !seen 也补一次 step 0 spotlight
  useEffect(() => {
    if (shouldShowFirstWinToast && state.firstWinKind && spotlightKind === null) {
      setSpotlightKind(state.firstWinKind)
      setSpotlightStep(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowFirstWinToast, state.firstWinKind])

  // Step 0：用户点了高亮卡 → 打开 modal（spotlight 临时让位给 modal）
  function handleHighlightedCardClick() {
    setResultModalOpen(true)
  }

  // Modal 关闭 → 进入 Step 1：高亮「查看全部」
  function handleResultModalClose() {
    setResultModalOpen(false)
    setSpotlightStep(1)
  }

  // Step 1：用户点了「查看全部」→ 结束引导（Link 自动跳 /reports?tab=...）
  function handleViewAllClick() {
    setSpotlightStep(null)
    setSpotlightKind(null)
    markFirstWinSeen()
  }

  // 用户点 spotlight 的"稍后" / X → 也算引导完成
  function handleSpotlightClose() {
    setSpotlightStep(null)
    setSpotlightKind(null)
    markFirstWinSeen()
  }

  function handleResetOnboarding() {
    setMode("report")
    setPrefill({})
    setSubmitting(false)
    setSpotlightKind(null)
    setSpotlightStep(null)
    setResultModalOpen(false)
    setRevealed(false)
    setArrowTipActive(false)
    reset()
  }

  function handleBackToCards() {
    setRevealed(false)
    setArrowTipActive(false)
  }

  // generating 期间 isNewUser 仍为 true（未 markFirstWin），所以 hero 自然保留
  const showOnboarding = isNewUser
  const highlightTaskIndex = spotlightKind ? KIND_TO_TASK_INDEX[spotlightKind] : undefined

  return (
    <>
      {showOnboarding ? (
        // ─── New-user view ─────────────────────────────────────────────────
        <>
          {!revealed ? (
            // 第一屏：只 4 张场景卡
            <OnboardingHero
              freeTriesRemaining={freeTriesRemaining}
              freeTriesTotal={freeTriesTotal}
              onPickPath={handlePickPath}
              onDismiss={dismiss}
            />
          ) : (
            // 第二屏：揭示 chat box（含 ring + halo）+ 返回按钮
            <div className="flex flex-col items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleBackToCards}
                className="self-start h-8 px-3 rounded-full border border-[var(--line)] bg-white text-[12px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft size={11} strokeWidth={2.4} />
                返回选择场景
              </button>
              <AssistantChat
                mode={mode}
                onModeChange={setMode}
                prefill={prefill}
                onFirstWin={handleFirstWin}
                submitting={submitting}
              />
            </div>
          )}
        </>
      ) : (
        // ─── Returning-user view ───────────────────────────────────────────
        <>
          <div className="text-center mb-6 relative">
            <h1 className="text-[26px] font-extrabold leading-snug">创意助手</h1>
            <p className="mt-3 text-[14px] text-[#9a9da6]">
              选择任务类型，开始 AI 驱动的创意工作流
            </p>
            <button
              type="button"
              onClick={handleResetOnboarding}
              title="重置新用户引导（清除 First-Win 状态、配额、跳过引导标记）"
              className="absolute top-0 right-0 h-7 px-2.5 rounded-full text-[11px] font-bold text-[var(--muted)] border border-[var(--line)] bg-white hover:bg-[var(--soft-2)] hover:text-[var(--text)] cursor-pointer flex items-center gap-1"
            >
              ↺ 重新走引导
            </button>
          </div>

          <AssistantChat
            mode={mode}
            onModeChange={setMode}
            prefill={prefill}
            onFirstWin={handleFirstWin}
            submitting={submitting}
          />

          <div className="mt-6">
            <ExamplePrompts onPick={handlePickExample} />
          </div>

          <div className="my-10 border-t border-[var(--line)]" />

          <TaskResultSection
            highlightTaskIndex={highlightTaskIndex}
            onHighlightedClick={handleHighlightedCardClick}
            highlightViewAll={spotlightStep === 1}
            onViewAllClick={handleViewAllClick}
          />

          <div className="mt-10">
            <TopCreativesSection />
          </div>

          <div className="mt-10">
            <CompetitorSection />
          </div>
        </>
      )}

      {/* 引导浮件：箭头 + 两阶段 spotlight + 结果 modal */}
      {arrowTipActive && showOnboarding && revealed && (
        <SubmitArrowTip onClose={() => { setArrowTipActive(false); markRevealHintSeen() }} />
      )}

      {/* Step 0: 高亮任务结果卡 — modal 打开时让位 */}
      {spotlightStep === 0 && spotlightKind && !showOnboarding && !resultModalOpen && (
        <SpotlightTour
          targetSelector='[data-spotlight-target="task-result-card"]'
          title={STEP0_COPY[spotlightKind].title}
          description={STEP0_COPY[spotlightKind].desc}
          primaryAction={{ label: "点这张卡打开", onClick: handleHighlightedCardClick }}
          secondaryAction={{ label: "稍后再说", onClick: handleSpotlightClose }}
          onClose={handleSpotlightClose}
          preferredPlacement="top"
        />
      )}

      {/* 结果详情 modal */}
      <TaskResultModal kind={spotlightKind} open={resultModalOpen} onClose={handleResultModalClose} />

      {/* Step 1: 高亮「查看全部」按钮 */}
      {spotlightStep === 1 && spotlightKind && !showOnboarding && (
        <SpotlightTour
          targetSelector='[data-spotlight-target="view-all-btn"]'
          title={STEP1_COPY.title}
          description={STEP1_COPY.desc}
          primaryAction={{
            label: "查看全部",
            href: `/reports?tab=${spotlightKind === "video" ? "generate" : spotlightKind}&item=first`,
          }}
          secondaryAction={{ label: "稍后再说", onClick: handleSpotlightClose }}
          onClose={handleSpotlightClose}
          preferredPlacement="bottom"
        />
      )}
    </>
  )
}
