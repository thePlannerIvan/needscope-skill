# 审核样本表模板（v3 — 四组审核）

用于 Step 3（对象相关性 Gate）和 Step 5（编码质量 Gate）的抽样审核展示。

## Step 3: 对象相关性 Gate 样本表

### 样本抽样说明
- 抽取 **30+ 条文本**，覆盖 11 类关系类型
- 确保包含 included 和 excluded 的边界案例
- 误判率标准：< 10%
- 如有误判，记录误判类型和修正规则

### 审核表

| # | 原文（截取 ≤ 80 字） | 关系类型 | 判断结果 | 是否误判 | 修正 |
|---|-------------------|---------|---------|---------|------|
| 1 | …… | brand_owned_related | related | ✅ 正确 | — |
| 2 | …… | community_context | non_related | ✅ 正确 | — |
| 3 | …… | campaign_related | related | ❌ 误判 | 应为 community_context（活动本质实为社区互动） |
| ... | ... | ... | ... | ... | ... |

### 误判总结
| 误判类型 | 数量 | 集中文本特征 | 修正策略 |
|---------|------|------------|---------|
| campaign → community | 2 | "这次联名评论区好热闹" | 修正：重点看文本是否落脚于品牌/产品评价，而非社区互动描述 |
| 玩梗误判 | 1 | "笑死我了" | 修正：无品牌关联的互动行为归 community_context |

### Gate 结论
- 关键误判率：N/M = X% （<10% → pass）
- 结论：[pass / fail / partial_rerun_required]

---

## Step 5: 编码质量 Gate 样本表（v3 — 四组）

### 1. 随机抽样审核

#### 样本说明
- 随机抽取 20-30 条文本
- 其中 low_confidence 至少占 1/3
- 优先覆盖高频原型

#### 审核表

| # | 原文（截取 ≤ 80 字） | 原型编码 | sentiment | signal_owner | asset_eligibility | 审核意见 | 错误类型 |
|---|-------------------|---------|-----------|-------------|-------------------|---------|---------|
| 1 | …… | 呵护型 | positive | brand | primary_eligible | ✅ 正确 | — |
| 2 | "一点都不松弛" | 归属型 | positive | brand | primary_eligible | ❌ sentiment 应为 negative | polarity_reversal |
| 3 | "评论区好有趣" | 愉悦型 | positive | brand | primary_eligible | ❌ signal_owner 应为 community, asset_eligibility 应为 exclude_from_positioning | misattribution + ineligible_primary |

### 2. 高互动样本定向审核

#### 样本说明
- 从高互动（高赞/高回复）文本中抽取 10-15 条
- 重点检查 signal_owner 和 asset_eligibility

#### 审核表

| # | 原文 | 交互量 | signal_owner | asset_eligibility | 审核意见 |
|---|------|-------|-------------|-------------------|---------|
| 1 | "评论区都炸了哈哈哈" | 👍500 | community | context_only | ❌ 应改为 exclude_from_positioning。纯社区氛围文本。 |
| 2 | "XX 这波操作太秀了" | 👍300 | brand | primary_eligible | ✅ 正确。文本明确评价品牌策略。 |

### 3. 上下文风险样本审核

#### 样本说明
- 从包含风险关键词的文本中抽取 10-15 条
- 覆盖 doge/哈哈/偷笑/评论区/弹幕/粉丝/名人/活动

#### 审核表

| # | 原文 | 风险标记 | signal_owner | asset_eligibility | 审核意见 |
|---|------|---------|-------------|-------------------|---------|
| 1 | "我亲手盖上的[doge]" | doge | brand | primary_eligible | ❌ 严重错误。doge 是非严肃标记，此文本应归 community_context，asset_eligibility 应为 exclude_from_positioning |
| 2 | "李宇春7.4广州场演唱会大屏能看到C罗吗？" | celebrity | brand | primary_eligible | ❌ 严重错误。讨论演唱会/名人，非品牌评价。应归 founder_or_celebrity_related + context_only |
| 3 | "XX yyds" | platform_meme | brand | primary_eligible | ❌ 平台玩梗文本，应归 community_context + exclude_from_positioning |

### 4. 主落点证据样本审核

#### 样本说明
- **所有** asset_eligibility=primary_eligible 的文本逐条审查
- 确认没有误判

#### 审核表

| # | 原文 | signal_owner | archetype | 审核意见 |
|---|------|-------------|-----------|---------|
| 1 | "XX 的质量真的没话说" | brand | 掌控型 | ✅ 正确。品牌整体评价。 |
| 2 | "这个精华太好用了" | product | 呵护型 | ✅ 正确。产品直接评价。 |
| 3 | "这次联名好 cute" | campaign | 愉悦型 | ❌ 误判。campaign 不可为 primary_eligible。应改为 context_only。 |

### 错误汇总

| 错误类型 | 数量 | 是否系统性 |
|---------|------|----------|
| polarity_reversal | 2 | 否（零散）|
| misattribution | 3 | ✅ 是（signal_owner 误归 community → brand） |
| ineligible_primary | 4 | ✅ 是（v3 新增：asset_eligibility 误判为 primary_eligible） |
| missed_signal | 1 | 否 |
| over_assignment | 0 | — |

### 致命失败检查（v3）
- 任何 primary_eligible 误判？ [是 / 否] → 如果是，gate 直接 fail
- 任何 meme-only joy 进入 primary_evidence？ [是 / 否]
- 三处以上相同模式 signal_owner 错误？ [是 / 否]
- 三处以上相同模式 asset_eligibility 错误？ [是 / 否]
- 高互动上下文样本是否仅作为随机样本审核？ [是 / 否]

### 系统性错误处理
- 类型：ineligible_primary — campaign→primary_eligible
- 修正方案：在编码 prompt 中增加说明："campaign 信号的 asset_eligibility 默认为 context_only，不得直接标记为 primary_eligible"
- 需重跑批次：[批次 ID]

### Gate 结论
- 致命失败：[有 / 无]
- 系统性错误：[有 / 无]
- 全局错误率：N/M = X% （<15% → pass / ≥15% → fail）
- 结论：[pass / fail_rerun / fail_prompt_revision]
