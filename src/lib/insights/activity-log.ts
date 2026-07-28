export type ActivityKind = "budget" | "creative" | "audience" | "bid" | "status" | "note"

export interface ActivityLog {
  id: string
  /** 日期索引，对应趋势图 DAY_LABELS 的下标 */
  dayIndex: number
  kind: ActivityKind
  title: string
  desc: string
  /** 操作人 */
  operator: string
  /** 相对时间描述 */
  time: string
  /** 影响标签，如 "ROI +12%" */
  impact?: string
  impactTone?: "up" | "down" | "neutral"
}

export const ACTIVITY_KIND_META: Record<
  ActivityKind,
  { label: string; color: string; bg: string }
> = {
  budget:   { label: "预算",   color: "#0369a1", bg: "#e0f2fe" },
  creative: { label: "素材",   color: "#5a7821", bg: "#f0ffc0" },
  audience: { label: "受众",   color: "#a16207", bg: "#fef3c7" },
  bid:      { label: "出价",   color: "#9d174d", bg: "#fce7f3" },
  status:   { label: "状态",   color: "#b91c1c", bg: "#fee2e2" },
  note:     { label: "备注",   color: "#3f3f46", bg: "#f4f4f5" },
}

/** mock：按 dayIndex 分布的广告操作日志，每个有事件的日期至少 3-5 条 */
export const SEED_ACTIVITY_LOGS: ActivityLog[] = [
  // ── Day 13（今天）· 5 条
  { id: "d13-1", dayIndex: 13, kind: "budget",   title: "日预算上调 40%",        desc: "TT_US_01 日预算 $1,200 → $1,680，跑量加速",                operator: "陈昊", time: "2h 前",  impact: "Spend +18%",  impactTone: "up" },
  { id: "d13-2", dayIndex: 13, kind: "creative", title: "新增 6 条素材",          desc: "上新 UGC 口播 4 条 + 数字人 2 条，全部进入学习期",          operator: "林悦", time: "4h 前",  impact: "CTR +0.4pt",  impactTone: "up" },
  { id: "d13-3", dayIndex: 13, kind: "bid",      title: "成本上限微调",           desc: "核心广告组成本上限 $3.20 → $3.45，放开竞价空间",            operator: "王琦", time: "6h 前",  impact: "Orders +6%",  impactTone: "up" },
  { id: "d13-4", dayIndex: 13, kind: "audience", title: "开启自动扩量",           desc: "核心人群包启用兴趣定向扩展，覆盖 +32%",                    operator: "陈昊", time: "8h 前",  impact: "CPM -5%",     impactTone: "up" },
  { id: "d13-5", dayIndex: 13, kind: "note",     title: "大促预热开始",           desc: "站内活动页已上线，预计明日流量环比 +25%",                    operator: "林悦", time: "10h 前" },

  // ── Day 12 · 4 条
  { id: "d12-1", dayIndex: 12, kind: "audience", title: "受众包收窄",             desc: "剔除 18-24 低转人群，仅保留 25-44 核心区间",                operator: "陈昊", time: "1d 前",  impact: "CVR +0.3pt",  impactTone: "up" },
  { id: "d12-2", dayIndex: 12, kind: "creative", title: "Hook 改写上线 5 条",     desc: "基于高 CTR 模板重写前 3 秒，替换原素材",                    operator: "林悦", time: "1d 前",  impact: "CTR +0.5pt",  impactTone: "up" },
  { id: "d12-3", dayIndex: 12, kind: "status",   title: "关停 2 个低效广告组",     desc: "fp_112 / fp_118 连续 48h 无成交，直接关停",                 operator: "系统", time: "1d 前",  impact: "Spend -6%",   impactTone: "down" },
  { id: "d12-4", dayIndex: 12, kind: "budget",   title: "预算向高 ROI 组倾斜",     desc: "Top 3 广告组预算占比 45% → 62%",                          operator: "王琦", time: "1d 前",  impact: "ROI +0.31",   impactTone: "up" },

  // ── Day 11 · 5 条
  { id: "d11-1", dayIndex: 11, kind: "bid",      title: "出价策略切换",           desc: "最低成本 → 成本上限 $3.20，控制 CPO 波动",                  operator: "王琦", time: "2d 前",  impact: "CPO -8%",     impactTone: "up" },
  { id: "d11-2", dayIndex: 11, kind: "creative", title: "封面替换 8 条",          desc: "统一切换为高对比度首帧，提升信息流点击",                     operator: "林悦", time: "2d 前",  impact: "CTR +0.7pt",  impactTone: "up" },
  { id: "d11-3", dayIndex: 11, kind: "audience", title: "排除已购人群",           desc: "近 14 天成交用户加入排除包，避免重复触达",                    operator: "陈昊", time: "2d 前",  impact: "CVR +0.2pt",  impactTone: "up" },
  { id: "d11-4", dayIndex: 11, kind: "budget",   title: "新建测试预算池",          desc: "拨出 $400/日 用于新素材冷启动",                            operator: "王琦", time: "2d 前" },
  { id: "d11-5", dayIndex: 11, kind: "note",     title: "平台政策更新",           desc: "TikTok 收紧医美类文案审核，已同步创意团队",                  operator: "系统", time: "2d 前" },

  // ── Day 10 · 4 条
  { id: "d10-1", dayIndex: 10, kind: "status",   title: "暂停 3 个衰退广告组",     desc: "fp_021 / fp_034 / fp_057 连续 3 天 ROI 低于 3.0",           operator: "系统", time: "3d 前",  impact: "Spend -12%",  impactTone: "down" },
  { id: "d10-2", dayIndex: 10, kind: "creative", title: "数字人版本上线",          desc: "3 条口播脚本改用数字人出镜，降低拍摄成本",                    operator: "林悦", time: "3d 前",  impact: "CPO -4%",     impactTone: "up" },
  { id: "d10-3", dayIndex: 10, kind: "bid",      title: "下调成本上限",           desc: "衰退组成本上限 $3.60 → $3.10，收缩亏损",                    operator: "王琦", time: "3d 前",  impact: "Spend -9%",   impactTone: "down" },
  { id: "d10-4", dayIndex: 10, kind: "audience", title: "地域定向调整",           desc: "关闭 CA / AU 低效地区，集中投放 US",                        operator: "陈昊", time: "3d 前",  impact: "ROI +0.18",   impactTone: "up" },

  // ── Day 9 · 4 条
  { id: "d9-1",  dayIndex: 9,  kind: "creative", title: "封面 A/B 测试上线",      desc: "同脚本 3 版封面并行跑量，验证首帧留存差异",                  operator: "林悦", time: "4d 前",  impact: "CTR +0.6pt",  impactTone: "up" },
  { id: "d9-2",  dayIndex: 9,  kind: "budget",   title: "日预算上调 20%",         desc: "整体日预算 $1,000 → $1,200",                              operator: "王琦", time: "4d 前",  impact: "Spend +19%",  impactTone: "up" },
  { id: "d9-3",  dayIndex: 9,  kind: "audience", title: "兴趣标签扩充",           desc: "新增「户外露营」「家庭园艺」两组兴趣标签",                    operator: "陈昊", time: "4d 前",  impact: "Reach +28%",  impactTone: "up" },
  { id: "d9-4",  dayIndex: 9,  kind: "note",     title: "素材审核延迟",           desc: "平台审核队列积压，4 条素材延迟 6h 起量",                     operator: "系统", time: "4d 前" },

  // ── Day 7 · 5 条
  { id: "d7-1",  dayIndex: 7,  kind: "budget",   title: "预算回撤",               desc: "周末流量成本上升，日预算临时下调至 $900",                    operator: "王琦", time: "6d 前",  impact: "Spend -25%",  impactTone: "down" },
  { id: "d7-2",  dayIndex: 7,  kind: "bid",      title: "切换手动出价",           desc: "周末时段改手动出价，规避高 CPM 竞争",                       operator: "陈昊", time: "6d 前",  impact: "CPM -11%",    impactTone: "up" },
  { id: "d7-3",  dayIndex: 7,  kind: "status",   title: "暂停全部测试组",          desc: "周末暂停 6 个测试广告组，周一恢复",                         operator: "系统", time: "6d 前",  impact: "Spend -14%",  impactTone: "down" },
  { id: "d7-4",  dayIndex: 7,  kind: "creative", title: "素材轮换",               desc: "疲劳度 > 70 的 5 条素材替换为备用版本",                     operator: "林悦", time: "6d 前",  impact: "CTR +0.3pt",  impactTone: "up" },
  { id: "d7-5",  dayIndex: 7,  kind: "note",     title: "周末流量观察",           desc: "同行业 CPM 普遍 +18%，属季节性正常波动",                    operator: "陈昊", time: "6d 前" },

  // ── Day 5 · 4 条
  { id: "d5-1",  dayIndex: 5,  kind: "note",     title: "竞品大促开启",           desc: "fentybeauty 同期上线满减活动，CPM 环比 +14%",               operator: "陈昊", time: "8d 前" },
  { id: "d5-2",  dayIndex: 5,  kind: "creative", title: "对标素材上线 4 条",       desc: "参考竞品爆款结构快速复刻，测试差异化卖点",                    operator: "林悦", time: "8d 前",  impact: "CTR +0.4pt",  impactTone: "up" },
  { id: "d5-3",  dayIndex: 5,  kind: "budget",   title: "应对性加预算",           desc: "核心组日预算 +$300 抢占流量",                              operator: "王琦", time: "8d 前",  impact: "Orders +11%", impactTone: "up" },
  { id: "d5-4",  dayIndex: 5,  kind: "bid",      title: "提高出价 15%",           desc: "竞价环境恶化，主动提价保住展现份额",                         operator: "王琦", time: "8d 前",  impact: "CPO +6%",     impactTone: "down" },

  // ── Day 3 · 4 条
  { id: "d3-1",  dayIndex: 3,  kind: "audience", title: "新增相似人群包",         desc: "基于近 30 天成交用户构建 1% Lookalike",                     operator: "林悦", time: "10d 前", impact: "Orders +9%",  impactTone: "up" },
  { id: "d3-2",  dayIndex: 3,  kind: "creative", title: "口播脚本重写",           desc: "8 条素材统一改为痛点反问开头",                             operator: "林悦", time: "10d 前", impact: "CTR +0.5pt",  impactTone: "up" },
  { id: "d3-3",  dayIndex: 3,  kind: "budget",   title: "预算结构重组",           desc: "按 ROI 分层重新分配 3 个账户预算",                          operator: "王琦", time: "10d 前", impact: "ROI +0.24",   impactTone: "up" },
  { id: "d3-4",  dayIndex: 3,  kind: "status",   title: "恢复 4 个广告组",         desc: "上周暂停组素材已更新，重新开启跑量",                         operator: "系统", time: "10d 前", impact: "Spend +8%",   impactTone: "up" },

  // ── Day 1 · 3 条
  { id: "d1-1",  dayIndex: 1,  kind: "creative", title: "旧素材批量下线",         desc: "清理 12 条 CTR < 2% 的低效素材",                            operator: "系统", time: "12d 前", impact: "CTR +0.2pt",  impactTone: "up" },
  { id: "d1-2",  dayIndex: 1,  kind: "audience", title: "重建核心人群包",         desc: "淘汰旧标签，按新品受众画像重新建包",                         operator: "陈昊", time: "12d 前", impact: "CVR +0.4pt",  impactTone: "up" },
  { id: "d1-3",  dayIndex: 1,  kind: "note",     title: "新投放周期启动",         desc: "Q3 第二轮投放正式开始，目标 ROI 5.5",                       operator: "王琦", time: "12d 前" },
]

/** mock AI 诊断：按 dayIndex 给出拐点归因 */
export function diagnoseTrend(dayIndex: number, logs: ActivityLog[]): string {
  const dayLogs = logs.filter((l) => l.dayIndex === dayIndex)
  if (dayLogs.length === 0) {
    return "当日无广告操作记录。指标变化主要来自流量侧自然波动，建议结合前后两日的操作日志一并观察。"
  }
  const kinds = Array.from(new Set(dayLogs.map((l) => ACTIVITY_KIND_META[l.kind].label)))
  return `当日共 ${dayLogs.length} 条操作，集中在${kinds.join(" / ")}维度。其中「${dayLogs[0].title}」是本次拐点的主导因素——该操作直接改变了流量结构，指标在随后 24 小时内出现明显变化。建议观察未来 2-3 天数据是否稳定，再决定是否加大力度。`
}
