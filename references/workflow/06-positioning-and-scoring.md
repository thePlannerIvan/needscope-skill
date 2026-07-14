# Step 6: NeedScope 落点判定与评分（v3.2 — 核心证据 + 辅助证据 + 旁路画像）

## 使用时机

编码质量 Gate 通过后。

## 输入

- `work/04_archetype_coding_results.json`（全部编码结果，含 v3 asset_eligibility）
- `work/contracts/05_quality_gate.json`（质量门禁结果）
- `references/domain/confidence-framework.md`

## 前置条件

- 必须确认 `work/contracts/03_object_filter.json`、`work/contracts/04_archetype_coding.json`、`work/contracts/05_quality_gate.json` 均存在且 Gate 结果允许继续。
- 如果缺少任一前置合约，停止。只能输出"流程未完成，无法判定品牌 NeedScope 主落点"。
- 不得用关键词词频、表情符号频次或未归因评论直接计算主落点。

## 操作步骤

### 1. 聚合编码信号
- 按 prototype 聚合信号频次和置信度
- 按 signal_owner 分组统计（brand / product / community 等信号分布）
- 按 platform_context 分组统计（不同平台语境下的信号分布）
- 计算 sentiment（positive / negative）在每个原型中的比例
- 单独拆出 `owned_signals` 与 `context_signals`
  - `owned_signals`: `signal_owner=brand/product/product_line`
  - `context_signals`: `signal_owner=founder/content/community/platform/campaign/category/competitor`

### 2. 计算评分
- 评分是信号密度和强度的相对值（0-100），**不是绝对分数**
- 正向信号和负向信号分开统计、分开展示
- 如果一个原型的数据量 < 5 条，评分自动降低权重并标注置信度

### 3. 判定主落点（v3.2 双层品牌自有证据）

**证据筛选规则**（详见 `domain/signal-owner-rules.md`）：
- `primary_evidence_items`: `signal_owner=brand/product/product_line`（或人物分析时的 founder）+ `asset_eligibility=primary_eligible` + `signal_role≠contextual_noise`
- `supporting_evidence_items`: `brand/product/product_line`（或人物分析时的 founder/content）+ `secondary_only` + 非 contextual_noise，须有 `discount_reason`
- 禁止进入（品牌分析默认）：founder/content/IP/campaign/community/platform/competitor / 纯表情梗 / contextual_noise
- **人物分析例外**（`analysis_object_type=founder/public_person/content_ip`）: `founder + primary_eligible` 合法；`content + secondary_only` 有条件合法。详见 `domain/signal-owner-rules.md`

**判定流程**：
1. 筛选核心主证据 → `primary_evidence_items`
2. 筛选方向性辅助证据 → `supporting_evidence_items`
3. 先看核心主证据判定主落点；核心证据不足时辅助证据低权重纳入
4. 核心 + 辅助 < 5 条或方向分散 → `primary_archetype = 未判定`，填写 `insufficient_owned_signal_reason`
5. 核心与辅助冲突 → 以核心为准，冲突写入 tension/confidence

### 3.1 旁路画像（founder/content-IP shadow analysis）

当 Step 1 的 `analysis_lens` 允许 `founder_shadow` 或 `content_ip_shadow` 时，可以输出旁路画像，但必须满足：
- 标题明确写为"创始人旁路画像"或"内容体验旁路画像"，不得写成品牌主落点。
- 数据来源只进入 `shadow_analysis`，不进入 `primary_evidence_items` / `supporting_evidence_items`。
- 旁路画像只能解释风险、张力或传播语境，不能改变 `primary_archetype`。
- 如果用户目标是人物/IP 而非品牌，必须在 Step 1 和报告标题中改变分析对象，不得仍称为品牌人格主落点。

### 4. 记录 excluded_high_influence_items（v3 新增）
- 列出被排除的高影响信号（如高赞但 signal_owner=community 的文本）
- 每条排除项说明排除理由（asset_eligibility 或 signal_owner 不满足条件）

### 5. 判定次落点与张力
- **次落点**：信号集群明确但密度或一致性低于主落点
- **张力**：两个或多个信号集群同时存在且指向不同方向（如"专业但有趣"）
- **缺席**：品类中预期出现的原型但在数据中完全没有信号
- **噪声**：有信号但经判断为平台/社区噪声，非品牌资产
- **负向缺口**：消费者明确表示品牌缺乏某个原型特质（sentiment=negative）
- 高频但非品牌自有的信号必须进入 `noise_archetypes` 或 `platform_splits`

### 6. 平台分裂分析
- 如果不同平台/语境下的信号分布明显不同，**必须标注平台分裂**
- 例如 B站评论显示愉悦型 strong，小红书写真显示掌控型 strong

### 7. 输出落点说明
- 用自然语言描述品牌 NeedScope 人格落点，而不是仅展示六边形图表
- 每个结论附带置信度和数据基础

## 关键原则

- **分数只是证据，不是最终结论**。报告的第一结论是主落点，不是分数表。
- **品牌主落点由核心证据优先、辅助证据降权补充**。`primary_evidence_items` 必须满足三重约束；`supporting_evidence_items` 可放宽到 `secondary_only`，但必须单独列出、降权解释，且不得单独决定主落点。
- **必须区分**：低分（有信号但量少）、无信号（完全无数据）、负向缺口（消费者明确说缺乏）、平台噪声（非品牌资产）
- **不可以建议品牌"补齐六边形"**。NeedScope 不是平衡积分卡。
- **必须回到 NeedScope 地图和人格落点**——品牌在品类中占据的情感区域，不是排名。
- **如果主落点有多个候选且证据接近**：向用户展示候选和差异，让用户选择解释口径。
- **Adidas/Nike 失败模式防线**：如果愉悦型主要由 `doge/哈哈/笑/偷笑/梗/评论区/弹幕` 等平台表达驱动，必须降为 `contextual_noise` 或语境信号，不得作为品牌核心资产。

## 输出文件

- `work/06_scores.json`：评分数据（结构化）
- `work/06_needscope_positioning.md`：落点判定说明（人可读）
- `work/contracts/06_positioning.json`：合约

## Contract 字段

字段定义见 `references/contracts/contract-definitions.md#step-6-06_positioning`。  
关键注意：`primary_evidence_items` 必须满足三重约束；`primary_archetype=未判定` 时须填写 `insufficient_owned_signal_reason`。

## Completion Criterion

- [ ] `primary_evidence_items` 仅包含满足三重约束的文本（v3）
- [ ] `supporting_evidence_items` 仅包含 brand/product/product_line + secondary_only + 非 contextual_noise 文本
- [ ] `primary_evidence_items` 与 `supporting_evidence_items` 数量和 `evidence_basis_counts` 完全一致
- [ ] `founder/content/campaign/community/platform/category/competitor` 未出现在品牌证据数组中
- [ ] 如呈现 founder/content，已写入 `shadow_analysis` 或平台分裂说明，而不是品牌主证据
- [ ] 辅助证据已经降权并单独解释，没有被混入核心主证据
- [ ] 分数只是证据，不是最终结论
- [ ] 主落点只由 `signal_owner in brand/product/product_line + asset_eligibility=primary_eligible + signal_role!=contextual_noise` 支撑
- [ ] 自有信号不足时已写 `未判定`，并填写了 `insufficient_owned_signal_reason`
- [ ] 记录了 `excluded_high_influence_items`（高影响但排除的信号）
- [ ] 平台/社区/事件/内容高频信号没有进入品牌主落点
- [ ] 区分了低分、无信号、负向缺口、平台噪声
- [ ] 不允许输出"品牌应该补齐六边形"
- [ ] 必须回到 NeedScope 地图和人格落点
- [ ] 主落点判定有明确的数据依据
- [ ] 张力/缺席/负向缺口已被识别或确认不存在

## 常见失败

| 失败 | 后果 | 防范 |
|------|------|------|
| 把六原型表格当报告主结论 | 报告变成能力体检而非人格诊断 | 主结论必须是落点文字说明 |
| 只写优劣势不判断人格落点 | 用户不知道品牌是谁 | 回到 NeedScope 四象限地图 |
| 混淆正负向信号 | 负向缺口被当作资产 | 分别展示 positive 和 negative density |
| 忽略平台分裂 | 不同语境信号稀释为单一结论 | 有平台分裂时必须标注并解释 |
| 把平台愉悦当品牌资产 | 报告把热门事件/评论区氛围误写成品牌人格 | 只允许 owned signals 决定主落点，平台/社区信号进入噪声层 |
| 自有信号不足仍硬判主落点 | 把语境热度包装成品牌人格 | `primary_archetype=未判定`，输出补数建议 |
| **未通过三重约束筛选 primary_evidence (v3)** | 社区/活动信号进入品牌主定位 | 必须检查 signal_owner + asset_eligibility + signal_role |
| 只用 primary_eligible 导致落点过窄 | 方向判断过于脆弱，真实品牌评价被排除 | 用 supporting_evidence_items 承接 secondary_only 自有信号，并降权解释 |
| content/founder 通过 secondary_only 混入品牌证据 | 内容体验/人物舆情抬高或拉低品牌人格 | content/founder 只能进入 shadow_analysis，不得进入品牌证据数组 |
