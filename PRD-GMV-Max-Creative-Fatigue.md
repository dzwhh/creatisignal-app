# PRD: GMV Max 创意疲劳数据产品

## 1. Summary

本 PRD 定义 CreatiSignal 首页「疲劳度监测」菜单下的 **GMV Max 创意疲劳** 功能。该功能面向 TikTok Shop / Product GMV Max 投放场景，按 `product_id × creative_asset_id / video_id / post_id` 识别哪些商品素材组合正在继续消耗预算，但 Gross revenue、Orders、商品点击或转化贡献变弱，并把诊断结果转成下一批 GMV Max 素材生成方向。

该功能不是普通 TikTok Creative Fatigue Monitor，也不以 `ad_id` 或 CTR 为核心判断对象。它应命名为 **GMV Max 创意疲劳 / GMV Max Creative Fatigue Score**。

## 2. Contacts

| Role | Owner | Comment |
|---|---|---|
| Product | CreatiSignal PM | 定义 GMV Max 疲劳口径、页面范围、MVP 优先级 |
| Design | CreatiSignal Design | 复用 `design.md` 的中后台视觉系统 |
| Frontend | CreatiSignal Web | 实现首页「疲劳度监测」页面与交互 |
| Data / Backend | CreatiSignal Data | 接入 GMV Max reporting、计算疲劳分、输出 API |
| Growth / Ops | 投放负责人 | 验证分层是否能指导素材生成与投放动作 |

## 3. Background

### 3.1 Why Now

GMV Max 会自动使用商品可用创意资产并优化 paid + organic 的整体 GMV。对卖家来说，投放瓶颈不再只是「怎么调广告组」，而是「哪些商品素材组合已经衰减，以及下一批素材该做什么」。

普通广告疲劳模型常以 CTR、CPM、CPA、ROAS 为中心，但 GMV Max 的投放方式不同：

- GMV Max 围绕商品和素材池自动分发，不适合只看 `ad_id`
- 同一视频换商品、换达人、换授权状态后，表现可能完全不同
- ROI 和 Cost per order 会包含 organic + paid orders，不能单独用来判断素材质量
- TikTok 官方建议看 Gross revenue 来衡量 Product GMV Max 中产品和视频质量

### 3.2 Official References

| Source | Relevance |
|---|---|
| [About Product GMV Max](https://ads.tiktok.com/help/article/about-product-gmv-max) | Product GMV Max 会使用所有可用创意资产，并优化 paid + organic delivery |
| [How to view reporting for Product GMV Max](https://ads.tiktok.com/help/article/how-to-see-reporting-for-your-product-gmv-max-campaign) | Seller Center / Ads Manager GMV Max tab 可查看 campaign、product、asset/reporting |
| [Tips to measure product and video quality](https://ads.tiktok.com/help/article/tips-to-measure-product-and-video-quality-in-your-product-gmv-max-campaign) | 官方建议重点看 Gross revenue，ROI/CPO 包含 organic + paid orders |
| [TikTok Business API SDK Reporting](https://github.com/tiktok/tiktok-business-api-sdk/blob/main/js_sdk/docs/ReportingApi.md) | SDK 暴露 GMV Max report 相关能力 |
| [TikTok Business API SDK README](https://github.com/tiktok/tiktok-business-api-sdk/blob/main/python_sdk/README.md) | SDK 端点清单中包含 GMV Max / Smart Plus / Identity / Video 等相关接口 |

## 4. Objective

### 4.1 Product Objective

帮助 TikTok Shop / GMV Max 卖家和投放团队快速识别：

1. 哪些商品 × 素材组合正在进入疲劳
2. 疲劳来自商业结果、商品点击/转化、视频观看，还是投放压力
3. 下一批应该生成哪类 GMV Max 素材
4. 哪些旧素材应加入观察、降权、暂停或替换

### 4.2 Business Objective

提升 CreatiSignal 从「素材洞察工具」到「GMV Max 素材增长决策台」的产品价值，让用户不只看到表现数据，还能得到下一轮素材生产方向。

### 4.3 Key Results

| KR | Target | Measurement |
|---|---:|---|
| KR1: 诊断可理解 | 80% 以上用户能在 3 分钟内说出当前高风险素材组合 | 用户访谈 / 可用性测试 |
| KR2: 生成动作转化 | 30% 以上疲劳素材明细点击「生成 Brief」 | 前端事件埋点 |
| KR3: 投放效率改善 | 使用该功能的 GMV Max 客户，高风险素材花费占比下降 15% | 投放前后对比 |
| KR4: 素材供给提升 | 每周新增可测试 GMV Max 素材数量提升 30% | Brief 生成与投放回流 |
| KR5: 告警误报控制 | 重度/严重疲劳人工驳回率低于 25% | 动作审批日志 |

## 5. Market Segments

### 5.1 Primary Segment

已有 TikTok Shop 和 GMV Max 投放基础的跨境电商卖家，尤其是：

- 已经有订单，但 ROI / CPO / GMV 波动大
- GMV Max 消耗不稳定，不知道该补什么素材
- 商品和素材数量开始增多，人工复盘成本上升
- 创意团队需要把投放数据转成可执行 Brief

### 5.2 Primary Users

| User | Job To Be Done | Pain |
|---|---|---|
| 投放负责人 | 判断哪些素材该继续跑、观察、降权或换掉 | GMV Max 自动分发，单看广告组不清楚素材原因 |
| 创意策划 | 知道下一批素材要测什么角度 | 数据报告很难直接转成 Hook / 场景 / CTA |
| 剪辑/内容团队 | 快速生产可测素材 | 不知道旧素材为什么衰减，容易只做微调 |
| 品牌老板 | 判断素材供给是否影响 GMV Max 放量 | 只看到 ROI 波动，看不到素材池健康度 |

## 6. Value Propositions

### 6.1 Customer Value

| Need | Product Value |
|---|---|
| 看出哪些素材在吃预算但 GMV 变弱 | 用 GMV Max Creative Fatigue Score 识别高风险商品素材组合 |
| 区分观看疲劳和卖货疲劳 | 按商业结果、商品点击/转化、视频观看、投放压力拆解 |
| 把数据转成素材生成方向 | 从诊断信号映射到 Hook、场景、卖点、CTA、达人形式 |
| 避免误停新素材 | 对 In Queue / Learning 和低样本素材做保护 |
| 处理指标不可用问题 | 指标缺失时降级到 product × campaign 或 video × campaign 评分 |

### 6.2 Competitive Difference

普通报表告诉用户「发生了什么」。本功能告诉用户「哪个商品素材组合正在衰减，以及下一批素材具体怎么做」。

## 7. Solution

### 7.1 Information Architecture

功能放在当前导航：

```text
首页 / 洞察
  疲劳度监测
    GMV Max 创意疲劳总览
    疲劳分层分布
    分层联动素材明细表
    数据口径与降级策略
```

### 7.2 Page Layout

页面首屏包含：

1. 页面标题：`GMV Max 创意疲劳`
2. 副标题：`按 product_id × creative_asset_id / video_id / post_id 聚合，识别吃预算但 GMV 贡献变弱的素材组合`
3. 总览 KPI 卡片
4. 横向疲劳分层条
5. 点击分层后联动下方素材明细表
6. 数据口径与降级策略说明

### 7.3 MVP UI Modules

#### 7.3.1 总览 KPI

| KPI | Definition | Purpose |
|---|---|---|
| 平均疲劳分 | 当前筛选范围内商品素材组合的平均疲劳分 | 看整体风险水平 |
| 风险花费 | 重度/严重疲劳组合近 3 或 7 天 Cost | 看预算风险 |
| 疲劳素材 | 轻度及以上商品素材组合数量 / 总组合数量 | 看素材池健康度 |
| 今日建议动作 | 系统建议生成 Brief、观察、降权或暂停的动作数量 | 看运营工作量 |

#### 7.3.2 横向疲劳分层条

分层条按商品 × 素材组合数量占比展示长度，点击任一阶段后，下方明细表联动筛选。

| Stage | Score | GMV Max Meaning | Product Action | Generation Direction |
|---|---:|---|---|---|
| 健康/学习中 | 0-10 | In Queue / Learning，或数据不足 | 不生成疲劳结论 | 继续观察 |
| 轻度疲劳 | 10-20 | 2s/6s、Product click rate 小幅下滑 | 标记观察，生成 1-2 个变体 | 换首帧、前 3 秒 Hook、商品利益点字幕 |
| 中度疲劳 | 20-40 | Product click rate、Ad CVR、Gross revenue 开始同步下滑 | 生成 3-5 条同商品不同角度素材 | 痛点、价格利益、场景证明、CTA |
| 重度疲劳 | 40-60 | Cost 继续消耗，但 Orders / Gross revenue / ROI 明显下滑 | 降低旧素材权重，补新素材组 | 测评、痛点、对比、场景、达人口播 |
| 严重疲劳 | 60+ | Delivering 素材仍有曝光或消耗，但订单/GMV 基本失效 | 暂停/降权该商品素材组合 | 换新达人、新场景、新商品组合 |

#### 7.3.3 分层联动素材明细表

表格字段：

| Field | Description |
|---|---|
| 商品 | product title / product_id / SKU |
| 素材 | creative_asset_id / video_id / post_id / thumbnail |
| 素材状态 | In Queue / Learning / Delivering / Authorization Recommended / Boosting / Boosted |
| 疲劳分 | GMV Max Creative Fatigue Score |
| 阶段 | 健康/轻度/中度/重度/严重 |
| 置信度 | confidence score |
| 主驱动 | commercial / commerce link / video watch / delivery pressure |
| Gross revenue 变化 | current 3d vs baseline 7d |
| Orders 变化 | current 3d vs baseline 7d |
| Product ad click rate 变化 | current 3d vs baseline 7d |
| Ad conversion rate 变化 | current 3d vs baseline 7d |
| 2s/6s/100% view rate 变化 | current 3d vs baseline 7d |
| Cost | current 3d or 7d spend |
| ROI | GMV Max reported ROI |
| 建议动作 | 生成 Brief / 标记观察 / 降权观察 / 暂停换组合 |
| 生成方向 | Hook / 场景 / CTA / 达人 / 对比 / 测评等 |

### 7.4 Data Model

核心粒度：

```text
date × shop_id × campaign_id × product_id × creative_asset_id / video_id / post_id
```

#### 7.4.1 Dimension Tables

| Table | Key Fields | Purpose |
|---|---|---|
| `dim_product` | product_id, sku_id, title, category, price, shop_id | 商品维度聚合 |
| `dim_gmv_max_campaign` | campaign_id, shop_id, roi_target, status, start_time | GMV Max campaign 口径 |
| `dim_creative_asset` | creative_asset_id, video_id, post_id, creator_id, authorization_type, status, first_seen_at | 素材身份与授权 |
| `dim_product_creative` | product_id, creative_asset_id, first_delivered_at, current_tab_status | 商品 × 素材关系 |

#### 7.4.2 Fact Tables

| Table | Key Fields | Purpose |
|---|---|---|
| `fact_gmv_max_product_creative_daily` | cost, orders, gross_revenue, roi, cost_per_order, product_impressions, product_ad_clicks, product_ad_click_rate, ad_conversion_rate | 商品素材商业表现 |
| `fact_gmv_max_video_daily` | 2s_view_rate, 6s_view_rate, 25/50/75/100_view_rate, video_views | 视频观看诊断 |
| `fact_gmv_max_fatigue_score` | fatigue_score, stage, confidence, driver_module, driver_metrics, generation_direction, suppression_reason | 疲劳计算结果 |
| `fact_gmv_max_action_log` | action_type, creative_asset_id, product_id, approval_status, executed_at, rollback_status | 用户动作与审批记录 |

### 7.5 Data Metrics Scheme

#### 7.5.1 MVP Metrics

| Module | Metrics | Role |
|---|---|---|
| 商业结果 | Gross revenue, Orders, ROI, Cost per order | 判断 GMV 贡献是否衰减 |
| 商品点击/转化链路 | Product ad click rate, Ad conversion rate | 判断用户是否还愿意点商品、下单 |
| 视频观看 | 2s view rate, 6s view rate, 100% view rate | 判断首帧、Hook、内容节奏是否失效 |
| 投放压力 | Cost, Product impressions | 判断系统是否仍花钱但边际产出下降 |

#### 7.5.2 Expanded Metrics

| Module | Metrics |
|---|---|
| 视频观看 | 25%、50%、75% ad video view rate |
| 素材状态 | In Queue, Learning, Delivering, Authorization Recommended, Boosting, Boosted |
| 商品关系 | product category, price band, creator type, authorization type |
| 风险预算 | cost share, inefficient spend, budget at risk |

#### 7.5.3 Metric Definitions

| Metric | Definition | Direction | Notes |
|---|---|---|---|
| Gross revenue | GMV Max attributed gross revenue | Higher is better | 核心商业质量指标，权重高于 ROI / CPO |
| Orders | GMV Max attributed orders | Higher is better | 低样本时不触发强动作 |
| ROI | Gross revenue / cost | Higher is better | 包含 organic + paid orders，不能单独判素材质量 |
| Cost per order | Cost / orders | Lower is better | 包含 organic + paid orders，作为辅助指标 |
| Product impressions | 商品曝光量 | Context | 与 Cost / GMV / Orders 一起看边际产出 |
| Product ad clicks | 商品广告点击量 | Higher is better | 用于 product ad click rate |
| Product ad click rate | Product ad clicks / product impressions | Higher is better | 判断看完是否愿意点商品 |
| Ad conversion rate | Orders / product ad clicks | Higher is better | 判断点后是否愿意买 |
| 2s view rate | 2s views / video views 或 impressions | Higher is better | 判断首帧吸引力 |
| 6s view rate | 6s views / video views 或 impressions | Higher is better | 判断前 3-6 秒 Hook |
| 100% view rate | 100% views / video views | Higher is better | 判断完整内容承接 |
| Cost share | 该组合 cost / campaign total cost | Lower is better when output drops | 判断预算压力 |

### 7.6 Score Formula

#### 7.6.1 Window

```text
current = 最近 3 天
baseline = 前 7 天稳定窗
seasonal_ref = 前 14 天同周期校准，可选
learning_guard = In Queue / Learning 或首投 3-5 天不下强结论
```

#### 7.6.2 Single Metric Decay

越高越好的指标：

```text
drop = clip(1 - current / baseline, 0, 1)
```

越低越好的指标：

```text
rise = clip(current / baseline - 1, 0, 1)
```

#### 7.6.3 Total Score

```text
GMV Max Creative Fatigue Score =
45% 商业结果衰减
+ 30% 商品点击/转化链路衰减
+ 20% 视频观看衰减
+ 5% 投放压力衰减
```

#### 7.6.4 Internal Weights

| Module | Weight | Internal Weight |
|---|---:|---|
| 商业结果衰减 | 45% | Gross revenue 18, Orders 12, ROI 8, Cost per order 7 |
| 商品点击/转化链路衰减 | 30% | Product ad click rate 15, Ad conversion rate 15 |
| 视频观看衰减 | 20% | 2s 5, 6s 5, 25/50/75/100% 10 |
| 投放压力衰减 | 5% | Cost share 上升 2, Product impressions 上升但 GMV/Orders 下滑 3 |

关键规则：Gross revenue 权重必须高于 ROI / Cost per order，因为 GMV Max 的 ROI 和 CPO 包含 organic + paid orders，不能单独用来判断视频质量。

### 7.7 Confidence And Guardrails

#### 7.7.1 Confidence Formula

```text
confidence =
0.35 * impression_sample_score
+ 0.25 * click_sample_score
+ 0.25 * order_sample_score
+ 0.15 * trend_consistency_score
```

#### 7.7.2 Guardrails

| Condition | Handling |
|---|---|
| 新素材 In Queue / Learning | 不触发中重度结论，只展示观察 |
| Orders 太少 | 只展示观察，不触发自动动作 |
| Gross revenue 上升但 ROI 下降 | 不判严重疲劳，提示「高消耗高产出素材」 |
| Cost 上升，Orders / Gross revenue 同步下降 | 可判重度或严重 |
| 全 campaign 素材同时下滑 | 优先判平台、大盘或商品问题，不归因单素材 |
| 素材层指标缺失 | 降级评分，并在 UI 显示「部分 GMV Max 指标不可用」 |
| ROI / CPO 异常 | 仅作为辅助判断，不覆盖 Gross revenue 结论 |

### 7.8 Diagnostic To Generation Mapping

| Diagnostic Signal | Meaning | Generation Direction |
|---|---|---|
| 2s/6s view rate 下滑 | 首帧和前 3 秒失效 | 新首帧、强冲突开头、价格/痛点/结果先出 |
| 25/50/75/100 view rate 下滑 | 中段内容撑不住 | 缩短视频、加快节奏、减少铺垫、增加对比镜头 |
| Product ad click rate 下滑 | 用户看了但不点商品 | 强化商品展示、价格利益点、使用场景、CTA |
| Ad conversion rate 下滑 | 点了但不买 | 强化评价、信任背书、前后对比、优惠、物流/保障 |
| Gross revenue / Orders 下滑但观看还好 | 内容吸引人但卖货弱 | 从娱乐型改成成交型：痛点 → 证明 → 商品 → 购买理由 |
| Cost 上升但 GMV 不涨 | 系统仍推，边际产出变差 | 减少旧素材权重，补充新创意组 |

### 7.9 API And Ingestion

#### 7.9.1 Priority Sources

```text
/gmv_max/report/get/
/gmv_max/video/get/
/gmv_max/identity/get/
/smart_plus/material_report/overview/
/smart_plus/material_report/breakdown/
```

#### 7.9.2 Supporting Sources

```text
/campaign/gmv_max/info/
/campaign/gmv_max/update/
/gmv_max/store/list/
/gmv_max/exclusive_authorization/get/
```

#### 7.9.3 Availability Constraint

部分 GMV Max product / asset / video 指标可能不是所有账号都可用。如果无法拿到完整素材层指标，系统应降级到以下口径：

1. `product_id × campaign_id`
2. `video_id × campaign_id`
3. 手动导入 Seller Center / Ads Manager 报表

### 7.10 Output Schema

#### 7.10.1 Score Result

```json
{
  "score_date": "2026-06-21",
  "shop_id": "shop_001",
  "campaign_id": "gmv_123",
  "product_id": "prod_789",
  "creative_asset_id": "asset_456",
  "video_id": "vid_9af2",
  "post_id": "post_77be",
  "fatigue_score": 47.6,
  "stage": "HEAVY",
  "confidence": 0.82,
  "driver_module": "COMMERCIAL_DECAY",
  "driver_metrics": [
    "gross_revenue_down",
    "orders_down",
    "product_click_rate_down"
  ],
  "generation_direction": [
    "pain_point_demo",
    "comparison_video",
    "creator_review"
  ],
  "recommended_action": "GENERATE_3_5_VARIANTS",
  "suppression_reason": null
}
```

#### 7.10.2 Table Row Shape

```json
{
  "product": {
    "product_id": "prod_zf7899",
    "sku": "ZF7899",
    "title": "ZF7899 磁吸工作灯"
  },
  "creative": {
    "creative_asset_id": "asset_9af2_main",
    "video_id": "vid_9af2",
    "post_id": "post_77be",
    "thumbnail_url": "https://..."
  },
  "status": "Delivering",
  "fatigue_score": 54,
  "stage": "HEAVY",
  "confidence": 0.86,
  "driver_module": "COMMERCIAL_DECAY",
  "deltas": {
    "gross_revenue": -0.32,
    "orders": -0.28,
    "product_ad_click_rate": -0.18,
    "ad_conversion_rate": -0.13,
    "view_rate_2s_6s_100": -0.08
  },
  "cost": 3420,
  "roi": 1.21,
  "recommended_action": "GENERATE_BRIEF",
  "generation_direction": "creator_review + comparison_video"
}
```

## 8. Release

### 8.1 MVP Scope

MVP 包含：

- 首页「疲劳度监测」菜单
- GMV Max 创意疲劳总览 KPI
- 横向疲劳分层条
- 分层点击联动素材明细表
- 6+3 指标体系
- 评分分层和置信度展示
- 主驱动模块展示
- 生成方向字段
- 数据口径与降级策略说明

MVP 不包含：

- 自动暂停 GMV Max 素材
- 自动调整 GMV Max campaign ROI target
- 完整审批工作流
- 真正调用 TikTok API 写操作
- LIVE GMV Max
- 跨平台疲劳模型

### 8.2 Phase 2

- 接入真实 GMV Max API
- 增加商品 / 素材 / 达人多维筛选
- 加入 Brief drawer
- 将诊断信号自动写入视频生成模块
- 支持 Seller Center 报表导入
- 增加素材层指标缺失时的 UI 降级标识

### 8.3 Phase 3

- 动作审批流
- 自动生成新素材批次
- 实验追踪回流
- 商品 × 素材 × 达人组合推荐
- 疲劳阈值按品类和店铺历史表现自校准

## 9. Analytics Events

| Event | Trigger | Properties |
|---|---|---|
| `gmv_fatigue_page_viewed` | 打开页面 | shop_id, date_range |
| `gmv_fatigue_stage_selected` | 点击分层条 | stage, count, score_range |
| `gmv_fatigue_row_clicked` | 点击素材行 | product_id, creative_asset_id, stage, score |
| `gmv_fatigue_brief_generate_clicked` | 点击生成 Brief | product_id, creative_asset_id, driver_module |
| `gmv_fatigue_export_clicked` | 导出表格 | selected_stage, row_count |
| `gmv_fatigue_high_risk_marked` | 标记高风险 | product_id, creative_asset_id, confidence |

## 10. Acceptance Criteria

### 10.1 UX Acceptance

- 用户能在「疲劳度监测」页面看到 GMV Max 创意疲劳标题
- 用户能看到分层条，并且每段长度与素材数量有关
- 用户点击任一分层后，下方表格只显示该阶段素材
- 表格展示商品、素材、状态、疲劳分、置信度、主驱动、核心 GMV Max 指标和建议动作
- 页面文案不再以 CTR 疲劳作为主口径
- 页面符合 `design.md` 的黑白灰 + 少量 lime 风格

### 10.2 Data Acceptance

- 评分粒度是 `product_id × creative_asset_id / video_id / post_id`
- Gross revenue 权重高于 ROI / Cost per order
- In Queue / Learning 不触发中重度结论
- 低样本数据只展示观察，不触发强动作
- 指标缺失时必须显示降级说明
- 所有严重疲劳结果必须有 confidence 和 driver_module

### 10.3 Engineering Acceptance

- `/insights/fatigue` 页面可访问
- 单页面 lint 通过
- Next build 通过
- 不新增独立视觉系统
- 不引入新依赖
- 不修改无关导航结构

## 11. Assumptions

- 当前版本只覆盖 Product GMV Max，不覆盖 LIVE GMV Max
- MVP 先使用 mock 数据完成产品交互，后续再接真实 API
- 自动暂停 / 降权先作为建议动作，不在 MVP 中直接执行
- 若 API 无法拿到完整 asset / video 指标，产品降级为 Seller Center / Ads Manager 导入报表 + 手动同步
- 本 PRD 的官方资料核对时间为 2026-06-21

## 12. Open Questions

1. GMV Max asset / video 层指标在目标客户账号里的可用率是多少
2. Seller Center 导出字段是否能稳定补齐 Product ad click rate 和 Ad conversion rate
3. 用户更希望动作叫「暂停素材」还是「降低旧素材权重」
4. Brief 生成是否直接进入「视频创作」，还是先进入「素材洞察报告」
5. 是否需要按商品类目维护不同疲劳阈值

## 13. Implementation Notes

当前前端 MVP 已落在：

```text
src/app/insights/fatigue/page.tsx
```

该页面已实现：

- GMV Max 创意疲劳页面标题
- 分层条联动表格
- GMV Max 指标表格
- 数据口径与降级策略
- mock product × creative rows

后续接真实数据时，建议新增：

```text
src/lib/gmv-max/fatigue-types.ts
src/lib/gmv-max/fatigue-score.ts
src/lib/gmv-max/mock.ts
src/app/api/gmv-max/fatigue/route.ts
```

前端页面只消费 `fact_gmv_max_fatigue_score` 的聚合结果，不在组件内实现评分计算
