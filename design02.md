# CreatiSignal Design System

> 这份文档总结 CreatiSignal 当前生产代码里**真实在用**的视觉规范。所有 token、组件样式、间距、字号都是从 `src/app/globals.css` 与现有组件实现中提炼，**不是建议值**，写新组件时直接对照即可保持一致。

---

## 1. 项目概览

- **品牌定位**：AI 驱动的创意广告工作台（B2B SaaS · 中后台 / 操作型工具）
- **风格基调**：Linear / Vercel / Notion 风格的现代极简 · 黑白灰为主 · lime 主题色少量强调
- **平台**：Web 桌面端（暂不做移动响应式）
- **技术栈**：Next.js 16 · React 19 · Tailwind CSS 4 · Radix UI · Lucide React 图标
- **语言**：中文为主，技术词保留英文（Hook / Brief / CTA 等）

---

## 2. 品牌色与主题

主题色围绕 **lime（黄绿）** 展开 —— 不抢戏，仅用于"主推动作、活跃状态、AI 标识"。**全局基调是黑白灰**，lime 是点睛。

| Token | 值 | 用途 |
|---|---|---|
| `--lime` | `#c9ff29` | 主推 CTA / AI 标识 / 当前活动状态 / 选中态强调 |
| `--lime-soft` | `#f0ffc0` | 大面积浅底（提示卡、徽章背景） |
| `--near-black` | `#18181b` | 文字最深值 / 主按钮底色 / 序号徽章 |

**lime 用法规则**：
- ✅ "免费试用 / 推荐 / 主推动作"按钮
- ✅ "当前活动 / 正在播放 / 编辑中"状态
- ✅ 历史版本下拉里的"已编辑"chip
- ❌ 不用作大面积背景
- ❌ 不用作"成功/通过"语义（成功用弱状态绿 `#5a9c70` / `#2f6b46`）
- ❌ 不用作长文阅读区底色（视觉刺眼）

**lime 配色搭档**：
- lime 上的文字永远用 `#1a2010`（深绿黑），不用纯黑
- lime 描边用 `#cdf066`

---

## 3. 颜色 Token 全表

> 来自 `src/app/globals.css`。开发时**禁止硬编码 hex**，必须 `var(--xxx)` 或 Tailwind `bg-[var(--xxx)]`。

### 表面（背景）
| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#ffffff` | 全局背景 |
| `--panel` | `#fbfbfc` | 侧栏 / panel 背景 |
| `--soft` | `#f4f4f5` | 二级面板（不重要区域） |
| `--soft-2` | `#fafafa` | 卡内嵌套区（最浅灰） |

### 边框
| Token | 值 | 用途 |
|---|---|---|
| `--line` | `#e4e4e7` | 默认所有边框 |
| `--line-strong` | `#d4d4d8` | 强调边框 / hover 描边 / 选中态 |

### 文字
| Token | 值 | 用途 |
|---|---|---|
| `--text` | `#09090b` | 主文字 / 标题 |
| `--muted` | `#71717a` | 次文字 / 说明 |
| `--muted-2` | `#a1a1aa` | 弱文字 / placeholder / 时间戳 |

### 语义反馈色（弱色版，未做 token）
| 语义 | 主色 / icon | 浅底 | 边框 | 文字 |
|---|---|---|---|---|
| 成功 / 已采纳 / 保留 | `#5a9c70` | `#f4fbf6` | `#d7eedf` | `#2f6b46` |
| 警告 / 风险 / 需确认 | `#b58a24` | `#fff8e6` | `#f3e2b7` | `#7a5b16` |
| 危险 / 拒绝 / 禁止 | `#b95c5c` | `#fff5f5` | `#eed3d3` | `#8a3a3a` |
| 信息 / 数据来源 / 系统消息 | `#5e85b5` | `#f3f7fc` | `#d9e4f2` | `#365e8c` |
| 处理中 / AI 匹配 / 任务运行 | `#8068a7` | `#f7f5fc` | `#e1daef` | `#5c4a7d` |

> 语义反馈色只表达系统反馈：成功、风险、失败、说明、进行中。不要用它表达套餐等级、素材等级、账户分层等业务分类。

### 业务状态色（截图色系延展，未做 token）
| 业务状态 | 主色 / dot | 浅底 | 边框 | 文字 | 与 lime 搭配判断 |
|---|---|---|---|---|---|
| All / Mixed / 全部 | `#9eefe6` + `#ffe978` | `#fbfffb` | `#e5f5ee` | `#355f58` | ✅ 可搭配；双色点只做聚合，不承担动作语义 |
| Free / Open / 可用 | `#8debda` | `#f2fffc` | `#d3f8f1` | `#2c6d65` | ✅ 很搭；薄荷青偏冷，可平衡 lime 的黄绿感 |
| Basic / Standard / 标准 | `#c9d4ff` | `#f6f8ff` | `#e1e7ff` | `#43527e` | ✅ 最稳；淡紫蓝与 lime 形成清爽对比 |
| Pro / Premium / 高价值 | `#ffe678` | `#fffbea` | `#f5e7a6` | `#735d12` | ⚠️ 中等；同属偏黄，适合小 dot / chip，不宜贴近 lime CTA |
| Growth / 成长 | `#b8e2ff` | `#f4fbff` | `#d8efff` | `#345f7d` | ✅ 可搭配；浅天蓝能扩展 Basic，不抢品牌色 |
| Team / 团队 | `#d8c8ff` | `#faf7ff` | `#e8ddfb` | `#5b477d` | ✅ 很搭；淡紫提供 AI 感，但弱于 lime |
| Trial / 试验 | `#ffd9b8` | `#fff7f0` | `#f3d8c2` | `#7a4b28` | ⚠️ 中等；暖色靠近 Pro，适合低频实验标签 |
| Enterprise / 企业 | `#d7dee8` | `#f7f8fa` | `#e1e5ea` | `#4f5b6b` | ✅ 最安全；中性灰蓝可作为高级/托管分类 |

**业务状态色使用规则**：
- ✅ 用于 plan/tier、资产分类、账户分层、筛选项、数据 legend、素材等级
- ✅ 优先用小圆点、浅底 chip、表格行标签，不做大面积色块
- ✅ `Free / Basic / Pro` 是主轴；`Growth / Team / Trial / Enterprise` 是延展轴
- ❌ 不用于成功/失败/风险反馈，反馈仍使用上方语义反馈色
- ❌ `Pro` 和 `Trial` 不要紧贴 lime 主按钮，避免黄绿色系互相抢焦点
- ❌ 不用业务状态色替代 `--lime` 的 active / AI / action 语义

**复刻边界三色（项目专属）** —— 在 `breakdown-types.ts` 的 `BOUNDARY_META`：
- `keep`（必须保留）：bg `#f4fbf6` / border `#d7eedf` / text `#2f6b46` / dot `#5a9c70`
- `change`（可以改）：bg `#f3f7fc` / border `#d9e4f2` / text `#365e8c` / dot `#5e85b5`
- `ban`（禁止复制）：bg `#fff5f5` / border `#eed3d3` / text `#8a3a3a` / dot `#b95c5c`

**素材生命周期色（业务）** —— `LIFECYCLE_META`：
- cold_start `#94a3b8` / potential `#0ea5e9` / scaling `#22c55e` / peak `#f97316` / declining `#eab308` / retired `#a1a1aa`

---

## 4. 字体

- **主字体**：`Inter` + 中文 fallback `PingFang SC / Hiragino Sans GB / Microsoft YaHei`
- **数字 / 等宽**：`font-mono`（脚本编辑器、SKU、URL）
- **手写体**（仅限 onboarding 箭头提示）：`Caveat / Marker Felt / Comic Sans MS, cursive`，严禁出现在主流程
- `font-feature-settings`：保持默认（不强制开 tabular-nums）

### 文字渲染
- body 全局 `-webkit-font-smoothing: antialiased`
- 中英混排不调字距（letter-spacing 仅在 uppercase 小字加 `tracking-wide`）

---

## 5. 字号 Scale

> CreatiSignal 字号偏小、信息密度高。**所有字号都用 `text-[Npx]` 直写**（不用 Tailwind 默认 text-xs/sm），统一精度。

| Tailwind 写法 | px | 用途 |
|---|---|---|
| `text-[10px]` | 10 | 极小元数据、版本号、tag chip 内字 |
| `text-[10.5px]` | 10.5 | section 顶部 uppercase 标签、表格小标签、计数 |
| `text-[11px]` | 11 | 小提示、help text |
| `text-[11.5px]` | 11.5 | 卡内副文案 / 列表项次内容 |
| `text-[12px]` | 12 | 表格内容、表单 placeholder、按钮文字（小按钮） |
| `text-[12.5px]` | 12.5 | 列表正文 / 表单输入 / 按钮文字（标准） |
| `text-[13px]` | 13 | 大按钮文字 / Nav 主菜单 |
| `text-[13.5px]` | 13.5 | 卡片小标题 |
| `text-[14px]` | 14 | section 文案、副标题 |
| `text-[15px]` | 15 | Hero 副标、主输入框 |
| `text-[15.5px]` | 15.5 | Path 卡标题 |
| `text-[16px]` | 16 | Step 内主标题 |
| `text-[17px]` | 17 | dashboard section h2 |
| `text-[18px]` | 18 | Drawer 主标题 |
| `text-[19px]` | 19 | Step page 主标题 |
| `text-[22px]` | 22 | 顶级页面标题（/replicate hub h1） |
| `text-[26px]` | 26 | 老用户 hero |
| `text-[28px]` | 28 | OnboardingHero 主标题 |

> **避免**：text-xs / sm / base 等 Tailwind 默认 size。需要新字号时优先用现有 scale，不够再加（用 `.5px` 步长）。

---

## 6. 字重

| 写法 | 值 | 用途 |
|---|---|---|
| `font-semibold` | 600 | 默认次文字 / 表单输入 |
| `font-bold` | 700 | 卡片副标 / 链接文字 |
| `font-extrabold` | 800 | **绝大多数标题、按钮、徽章、tab 文字** ✦ 项目主力字重 |
| `font-black` | 900 | 偶用于品牌徽章（如「H」字符） |

> **避免** `font-medium / normal`，会显瘦弱。"宁可 extrabold 也别 medium"是当前项目风格。

---

## 7. 高度 / 行内尺寸

| 高度 Tailwind | px | 典型用法 |
|---|---|---|
| `h-5` | 20 | 小徽章 / chip |
| `h-6` | 24 | 标签 / tab inner / 小按钮 |
| `h-7` | 28 | 紧凑 chip / secondary 按钮 |
| `h-8` | 32 | tab / pill 切换器 |
| `h-9` | 36 | **主表单输入 / 主按钮（小）** |
| `h-10` | 40 | 主 CTA 按钮 |
| `h-11` | 44 | OnboardingHero 大 CTA |
| `h-12` | 48 | Topbar |
| `h-[34px]` | 34 | 老 dashboard 按钮 / filter pill |

> **保持原则**：偶数 px，便于垂直居中。

### 内边距对应
- `h-9` 配 `px-3` ~ `px-3.5`
- `h-10` 配 `px-4` ~ `px-5`
- 圆形 icon 按钮：`w-8 h-8` 或 `w-9 h-9` 用 `rounded-full`

---

## 8. 圆角

| Tailwind | px | 用途 |
|---|---|---|
| `rounded-md` | 6 | 小 chip / tag / 内嵌输入 / **二级 form 按钮（取消 / 保存）** |
| `rounded-lg` | 8 | 表单输入框 / 二级容器 / dropdown 项 |
| `rounded-xl` | 12 | 卡片内嵌区 / 媒体缩略 |
| `rounded-2xl` | 16 | **主卡片 / panel / drawer / modal** ✦ 项目主力 |
| `rounded-full` | 9999 | pill 按钮（tab / filter / icon button）/ 圆形徽章 / 状态点 |

> **绝对禁止** `rounded-sm`、`rounded`、`rounded-3xl+`（视觉不一致）。

---

## 9. 阴影

| 用途 | 类名 |
|---|---|
| 默认浮起（卡片 hover）| `shadow-[0_4px_12px_rgba(9,9,11,0.06)]` |
| 卡片标准浮起 | `shadow-[0_8px_24px_rgba(9,9,11,0.08)]` |
| Drawer / Modal | `shadow-[0_28px_72px_rgba(9,9,11,0.28)]` |
| Popover / Dropdown | `shadow-[0_18px_42px_rgba(9,9,11,0.14)]` |
| lime CTA hover | `shadow-[0_6px_18px_rgba(201,255,41,0.4)]` |
| 内阴影（输入框边）| `shadow-[inset_0_0_0_1px_var(--line)]` |
| chip / 小按钮 | `shadow-sm` 内置 |

> **不要**用 `shadow-md / lg / xl` 等 Tailwind 默认，统一用上面值。

---

## 10. 间距

| 用途 | Tailwind |
|---|---|
| 卡内段间距 | `space-y-3` (12px) |
| section 间距 | `space-y-4` (16px) / `space-y-5` (20px) |
| Form field 间距 | `space-y-3` |
| 一行内元素 | `gap-1.5` ~ `gap-3` |
| Filter chip 间距 | `gap-2` |
| 网格 | `gap-3` / `gap-4` / `gap-6` |
| Page padding | `px-8 py-6`（主区）/ `px-6 py-8`（hub） |

---

## 11. 边框

- 标准边框：`border border-[var(--line)]`
- 强调：`border border-[var(--line-strong)]`
- 双重描边（lime focus 高亮）：`border-2 border-[#cdf066]`
- ring 强调（不影响 layout）：`shadow-[0_0_0_3px_rgba(201,255,41,0.32)]`
- 虚线（提示性区域）：`border-dashed border-[var(--line)]`

---

## 12. 组件库

### 12.1 按钮

**主 CTA（深色）** — 用在 Step 推进、确认动作
```tsx
className="h-10 px-5 rounded-full bg-[var(--near-black)] text-white text-[13px] font-extrabold flex items-center gap-1.5 cursor-pointer hover:opacity-90"
```

**lime 主推按钮** — 用在 AI 推荐、再生成、试用
```tsx
className="h-10 px-5 rounded-xl bg-[var(--lime)] text-[#1a2010] border border-[#cdf066] text-[13px] font-extrabold cursor-pointer hover:shadow-[0_6px_18px_rgba(201,255,41,0.4)]"
```

**次按钮（白底描边）**
```tsx
className="h-9 px-3.5 rounded-full border border-[var(--line)] text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
```

**form 内取消/保存**（统一 rounded-md，与 inline 编辑场景配套）
- 取消：`h-6 px-2 rounded-md border border-[var(--line)] text-[10.5px] font-bold text-[var(--muted)]`
- 保存：`h-6 px-2 rounded-md bg-[var(--near-black)] text-white text-[10.5px] font-extrabold`

**Pill 按钮（filter / 标签）**
```tsx
"h-8 px-3 rounded-full text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
// active: bg-[var(--near-black)] text-white
// idle:   border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-strong)]
```

**Icon 按钮（圆形）**
```tsx
className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--near-black)] text-white"
// or for ghost: text-[var(--muted)] hover:bg-[var(--soft)]
```

> **禁止**：`bg-blue-500 / red-500 / green-500` 等彩色按钮。需要语义按钮时用 chip + icon。

### 12.2 卡片

**主卡片**
```tsx
className="rounded-2xl border border-[var(--line)] bg-white p-4"
// hover: hover:border-[var(--line-strong)] hover:shadow-[0_4px_12px_rgba(9,9,11,0.06)]
```

**选中态**：`border-[var(--near-black)] shadow-[0_0_0_3px_rgba(24,24,27,0.16)]`

**lime 强调态**：`border-[var(--lime)] shadow-[0_0_0_3px_rgba(201,255,41,0.32)]`

**虚线提示卡**：`border-dashed border-[var(--line)] bg-[var(--soft-2)]`

### 12.3 输入框

**标准 input**
```tsx
className="h-9 px-2.5 rounded-lg border border-[var(--line)] bg-white text-[12.5px] outline-none focus:border-[var(--line-strong)]"
```

**搜索框（带左 icon）**
```tsx
<div className="relative">
  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
  <input className="h-9 pl-7 pr-3 rounded-full border border-[var(--line)] bg-white text-[12.5px]" />
</div>
```

**Textarea（标准）**
```tsx
className="rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-[11.5px] outline-none resize-none focus:border-[var(--line-strong)]"
```

**Textarea 编辑高亮态**（区分进入编辑的视觉强）
```tsx
className="border-2 border-[#cdf066] bg-white focus:border-[var(--lime)] focus:shadow-[0_0_0_3px_rgba(201,255,41,0.28)]"
```

### 12.4 Chip / Badge / Tag

**通用 chip**（5 高度）
```tsx
className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10.5px] font-extrabold border"
// 配 bg/border/text 三色：反馈看"语义反馈色"，分类看"业务状态色"
```

**带 dot 的 chip**
```tsx
<span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ... }} />
{label}
```

**状态徽章**（图片左上角，缩略图覆盖）
```tsx
"absolute top-2 left-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10.5px] font-extrabold border"
// 成功：bg-[#f4fbf6] border-[#d7eedf] text-[#2f6b46]
// 失败：bg-[#fff5f5] border-[#eed3d3] text-[#8a3a3a]
// 中性：bg-white/95 border-[var(--line)] text-[#365e8c] shadow-sm
```

### 12.5 Tab / Segment

**主 tab**（带下划线，无背景）—— 顶部导航
```tsx
"relative h-10 px-3 text-[13px] font-bold cursor-pointer"
// active: text-[var(--text)] + 底部 2px 圆角条
// idle: text-[var(--muted)] hover:text-[var(--text)]
```

**Pill tab**（白底切换器）—— 表单内、模式切换
```tsx
// container
"flex items-center gap-1 p-0.5 bg-[var(--soft)] rounded-lg"
// inside
"h-7 px-3 rounded-md text-[12px] font-bold cursor-pointer transition-colors"
// active: bg-white text-[var(--text)] shadow-sm
// idle: text-[var(--muted)]
```

### 12.6 Popover（基于 Radix）

```tsx
<Popover.Content
  align="end"
  sideOffset={6}
  className="z-[60] w-[200px] p-1 bg-white border border-[var(--line)] rounded-xl shadow-[0_18px_42px_rgba(9,9,11,0.14)]"
>
```

**z-index 层级**：
- 卡内 popover：`z-[60]`
- 普通 dialog overlay：`z-50`，content `z-[55]`
- Drawer：overlay `z-[80]`，content `z-[85]`
- Spotlight / 浮卡：`z-[90]+`
- Toast：`z-[100]`

### 12.7 Dialog

**居中 modal**
```tsx
<Dialog.Overlay className="fixed inset-0 bg-black/45 z-[70] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
<Dialog.Content
  className={cn(
    "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[75]",
    "w-[min(560px,calc(100vw-32px))] max-h-[88vh] rounded-2xl bg-white shadow-[0_28px_72px_rgba(9,9,11,0.28)] flex flex-col overflow-hidden",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
  )}
>
```

**右侧 drawer**
```tsx
"fixed right-3 top-3 bottom-3 z-[85] w-[min(620px,calc(100vw-24px))] rounded-2xl bg-white shadow-[0_28px_72px_rgba(9,9,11,0.28)] flex flex-col overflow-hidden"
"data-[state=open]:animate-in data-[state=open]:slide-in-from-right-1/2"
```

> **关闭按钮永远在右上**：`w-8 h-8 rounded-full hover:bg-[var(--soft)]` + `<X size={16} />`

### 12.8 Stepper / 进度

**5 段 Stepper**（顶部）—— `/replicate` 工作台 5 步
```tsx
// pill 风格，全可点
"h-8 px-3 rounded-full text-[12px] font-extrabold flex items-center gap-1.5"
// active: bg-[var(--near-black)] text-white
// done:   bg-[#f4fbf6] border border-[#d7eedf] text-[#2f6b46]
// future: bg-[var(--soft)] text-[var(--muted)]
// 中间 2.5px 横线连接
```

**Progress Ring**（圆形进度环）
- size 50-56px，stroke 5-6px
- 完成 `#5a9c70`，进行中 `var(--near-black)`，未启动 `rgba(0,0,0,0.08)`

### 12.9 Spotlight / 浮卡引导

- 半透明 mask `bg-black/45 backdrop-blur-[1px]`
- 目标周围 padding 8px
- 高亮 ring 用双层 lime：`0 0 0 2px rgba(201,255,41,0.95), 0 0 0 6px rgba(201,255,41,0.32)`
- 1.8s 缓动 pulse animation

### 12.10 Toast

- 右下角 `fixed bottom-6 right-6 w-[360px]`
- `rounded-2xl bg-white border shadow-[0_24px_60px_rgba(9,9,11,0.18)]`
- 9s 自动消失，slide-in / fade-out 220ms

---

## 13. 图标系统

- **唯一来源**：`lucide-react`，size 9-22px
- **禁止使用** emoji 表达 UI 含义（emoji 仅出现在用户输入内容里）
- 常用尺寸：`size={11}` 行内 / `size={13}` 按钮 / `size={16}` 标题 / `size={20}` 大图标
- `strokeWidth`：默认 2 / 强调 2.4-2.6
- 状态色：跟随父容器 text color（用 `text-[var(--xxx)]`）

### 图标语义映射（项目约定）
| 概念 | 图标 |
|---|---|
| AI / 推荐 / 创意 | `Sparkles` |
| 编辑 | `Edit3` / `PenLine` |
| 关闭 | `X` |
| 删除 | `X` 或 `Trash2` |
| 完成 / 采纳 | `Check` / `CheckCircle2` |
| 警告 | `AlertTriangle` |
| 时间 | `Clock3` |
| 历史 | `History` |
| 锁定 / 必须保留 | `Lock` / `ShieldCheck` |
| 上传 | `Upload` |
| 设置 | `Settings2` |
| 切换 / 同步 | `RefreshCw` / `ArrowRight` |
| 视频 | `Video` / `Play` |
| 文字内容 | `FileText` |

---

## 14. 动效

| 场景 | duration | easing |
|---|---|---|
| Hover 颜色 / 描边 | 150ms | ease |
| Hover transform (translateY) | 200ms | ease |
| Dialog / Drawer 出入 | 220ms | ease-out / ease-in |
| Popover 出现 | data-[state=open]:fade-in + zoom-in-95 内置 |
| 同步 / 生成中 spinner | `animate-spin`（默认）|
| Pulse / 跳动 | 1500-1800ms ease-in-out infinite |
| Toast slide-in | 220ms |

**通用规则**：
- 转场用 `transition-all` 慎用（性能差），优先 `transition-colors / transition-opacity / transition-shadow`
- `hover:-translate-y-0.5` 用于卡片浮起，必须配 transition-all 200ms
- 严禁 `transition-all duration-500` 这种慢动画

---

## 15. 布局规范

### 全局 Shell
- `<IconRail />` 左侧 48px 图标栏（一级导航）
- `<Sidebar />` 240px 二级菜单栏（按 section 切换）
- 主区 `flex-1 flex flex-col`
- 顶部 `<Topbar />` 48px 高

### 内容区
- 最大宽度 `max-w-[1240px]` 或 `max-w-[1280px]`
- 主 padding `px-8 py-6`
- Section 间距 `space-y-4` ~ `space-y-6`

### 工作台双栏
- `grid grid-cols-[1fr_260px]`（结果统计右侧）
- `grid grid-cols-[1fr_1.4fr]` 或 `[1fr_1.6fr]`（视频左 + 主区右）
- `grid grid-cols-[1.4fr_1fr]`（视频左大 + 摘要右小）

### Sticky 规则
- 顶部 stat 条：`sticky top-3 z-10`
- 左侧视频：`sticky top-3 self-start max-h-[calc(100vh-180px)] overflow-y-auto`
- 右侧 panel：同上

---

## 16. 数据与状态展示

### 数字
- 数字徽章用 `font-extrabold` + `text-[var(--text)]`
- 百分比 / 占比：`<span>{count}<span className="opacity-70">/ {total}（{pct}%）</span></span>`

### 时间
- 相对时间："刚刚 / X 分钟前 / X 小时前 / X 天前 / 周一 (XX/XX)"
- 时间戳前必带 `<Clock3 size={9-11} />`

### 空状态
```tsx
<div className="rounded-2xl border border-dashed border-[var(--line)] bg-white py-16 flex flex-col items-center justify-center text-center">
  <div className="w-12 h-12 rounded-full bg-[var(--soft)] flex items-center justify-center mb-3">
    <Icon size={18} className="text-[var(--muted)]" />
  </div>
  <p className="text-[13px] font-bold text-[var(--text)]">没有结果</p>
  <p className="text-[11.5px] text-[var(--muted)] mt-1">提示文案</p>
</div>
```

---

## 17. 内容文案规范

- 中文为主，**不加句号**（短文案）
- 段落型文案保留句号
- 数字 + 中文之间空格：`生成 3 个变体` 不是 `生成3个变体`
- 量词前一律加空格：`已采纳 X 个 / 3`
- 不用「！」叹号（除 First-Win toast 庆祝外）
- 引号用「」中文方括号，URL/代码用 `code` 反引号

### 状态文案模板
- 加载中：`生成中…`（三点是 `…` 不是 `...`）
- 完成：`已完成` / `已生成` / `已采纳`
- 拒绝：`不采纳` / `已拒绝`
- 错误：`提交失败 · 请重试`
- 空：`暂无 X` / `还没有 X`

---

## 18. 可访问性

- 所有交互按钮带 `cursor-pointer`，disabled 用 `cursor-not-allowed`
- icon 单独按钮带 `aria-label="..."`
- 表单 input 用 `placeholder` 而非 `value=""` 当 hint
- Focus 状态用 `outline-none focus:border-[var(--line-strong)]` 或 lime border
- 不依赖颜色单独传达语义（成功/失败必配 icon）

---

## 19. 禁止清单

❌ **绝对不做**：
- Tailwind 默认色板（`bg-blue-500 / red-500 / green-500` 等）—— 用 token 或语义色
- emoji 当 UI 图标（用 lucide）
- `font-medium` / `font-normal` —— 字重起步 `font-semibold`
- `text-xs / sm / base` 等默认字号 —— 用 `text-[Npx]`
- `rounded` / `rounded-sm` / `rounded-3xl+` —— 用 md/lg/xl/2xl/full
- 多种圆角混用在同一个卡（内嵌也要按比例）
- 5 阶段彩色 rainbow（hook 红 / solution 蓝 …）—— 中性灰 + lime active
- 长动画（> 300ms）和华丽的转场
- 大面积 lime 背景 / lime 大段文字
- 句号在短文案末尾
- 硬编码 `#xxxxxx` 替代 token（除业务专属色板如 business status / lifecycle / boundary）

---

## 20. 复用查找表

新组件下笔前对照位置：

| 要做的事 | 看这里 |
|---|---|
| 颜色 token | `src/app/globals.css` |
| 按钮 / 卡片实现 | `src/components/replicate/replicate-hub.tsx` |
| Stepper | `src/components/replicate/replicate-workspace.tsx` |
| Popover | `src/components/replicate/rejection-reason-picker.tsx` / `boundary-chip.tsx` |
| Dialog / Drawer | `src/components/replicate/asset-library-modal.tsx` / `outcome-detail-drawer.tsx` |
| 表单 / 输入 / 下拉 | `src/components/replicate/product-brief-panel.tsx` |
| Pill tab | `src/components/replicate/replicate-hub.tsx` 的 `FilterChip` |
| Toast | `src/components/assistant/first-win-toast.tsx` |
| Empty state | `src/components/replicate/replicate-hub.tsx` 的 `EmptyState` |
| 时间轴 | `src/components/replicate/video-breakdown-player.tsx` |
| 进度环 | `src/components/replicate/replicate-workspace.tsx` 的 `ProgressRing` |
| Spotlight 引导 | `src/components/assistant/spotlight-tour.tsx` |
| 业务色板（边界三色 / 生命周期 / narrative role） | `src/lib/insights/types.ts` + `src/lib/replicate/breakdown-types.ts` |

---

## 21. 写新组件前的自检清单

下笔前问自己：
1. ☐ 颜色全部用 token？没有 `bg-blue-500` 之类？
2. ☐ 圆角是 `md / lg / xl / 2xl / full` 之一？
3. ☐ 字号在 scale 表里？没有 `text-sm`？
4. ☐ 字重 ≥ `font-semibold`？
5. ☐ 间距是 4/8/12/16/20/24 的倍数？
6. ☐ icon 来自 lucide？没有 emoji？
7. ☐ disabled / hover / focus 状态都做了？
8. ☐ 状态色除颜色外还有 icon 辅助？
9. ☐ 文案符合"短文案不加句号 / 中英空格"规范？
10. ☐ 是否复用了现有组件，而不是新写一份？

**所有"是"才可以提交。**

---

_本文档随项目代码演进。每次新增 token / 组件模式时同步更新本文档，避免设计语言碎片化。_
