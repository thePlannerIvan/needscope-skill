# Step 5: 编码质量 Gate（v3.2 — 五组定向审核）

## 使用时机

NeedScope 语义编码完成后，进行量化评分之前。

## 输入

- `work/04_archetype_coding_results.json`（全部编码结果，含 v3 asset_eligibility）
- `work/contracts/04_archetype_coding.json`（编码合约）

## 操作步骤

### v3.2 五组定向审核

v3 去除了仅依赖随机审核的不足，v3.2 进一步加入辅助证据审核和非法 owner-eligibility 组合检查，改为五组并行审核：

### 1. 随机抽样审核（random_review）
- 从编码结果中随机抽取 20-30 条文本
- 优先覆盖低置信编码（low_confidence 样本至少占 1/3）
- 优先覆盖高频信号 archetype 的样本（确保最活跃的原型没有系统性错误）
- 检查维度：极性反转、signal_owner 误归因、空编码合理性、多原型优先级

### 2. 高互动样本定向审核（high_like_review）
- 从高互动（高赞/高回复）文本中抽取 10-15 条
- 重点关注：高互动文本的 signal_owner 和 asset_eligibility 是否有系统误判
- **v3 关键**：高点赞数不改变文本的 signal_owner 或 asset_eligibility。高互动社区文本仍为 community_context。

### 3. 上下文风险样本审核（context_risk_review）
- 从包含 doge/哈哈/偷笑/评论区/弹幕/粉丝/活动/名人关键词的文本中抽取 10-15 条
- 重点关注：这些文本是否被误归为 brand 或 primary_eligible
- **v3 关键**：这些标记文本即使高赞也被归为 community/platform/campaign，asset_eligibility 不得为 primary_eligible

### 4. 主落点证据样本审核（primary_evidence_review）
- **所有** asset_eligibility=primary_eligible 的文本**逐条审查**
- 确认无以下文本被错误标记为 primary_eligible：
  - 明显是 campaign/community/platform/fan 语境
  - founder/content/campaign/category/competitor 语境
  - 仅由 meme/表情/梗驱动的文本
  - signal_role 应为 contextual_noise 的文本
- **如果发现任何误判，gate 直接 fail**

### 5. 辅助证据样本审核（supporting_evidence_review）
- 审核 `asset_eligibility=secondary_only` 的自有信号；如数量不大，建议全量审核
- 确认这些文本是 brand/product/product_line 的直接评价，只是带有轻微赛事、表情、玩笑或内容语境
- 确认无 founder/content/community/platform/category/competitor 或 campaign 文本进入 `supporting_evidence_items`
- 确认每条辅助证据有 `discount_reason` 或等价的降权说明

### 审核维度（四组通用）

**极性反转检查**：负向表达是否被编码为 positive？
- 如"不松弛"→ 归属型 positive → **严重错误**
- 正确应为：归属型 negative

**signal_owner 误归因检查**：社区/平台信号是否被归为品牌？
- 如"评论区好有趣"→ signal_owner=brand → **严重错误**
- 正确应为：signal_owner=community

**asset_eligibility 误判检查（v3 新增）**：
- 社区/平台/campaign 文本是否被标记为 primary_eligible？
- 如果 asset_eligibility 误判，记录为 ineligible_primary 类型

**空编码合理性检查**：某条文本没有被分配任何原型——这个决定是否合理？
- 如果是单纯功能性讨论（"物流很快"）→ 合理
- 如果含有明显情感表达但被漏掉了 → 需修正

**同一条文本多原型时的优先级检查**：如果有多原型，主次是否清晰？

### 汇总错误
- 记录每条错误的类型（polarity_reversal / misattribution / missed_signal / over_assignment / ineligible_primary / other）
- **ineligible_primary** 是 v3 新增：asset_eligibility 误判为 primary_eligible
- 判断是否为系统性错误（同一类错误出现 ≥3 次）
- 估算全局错误率

## Gate 规则

### v3 致命失败条件（触发任一条件则 gate 直接 fail）

1. **任何 primary_eligible 误判**：主落点证据中存在明确是 founder/content/campaign/community/platform/category/competitor/fan 语境的文本。
2. **meme-only joy 进入 primary_evidence**：任何仅由表情/梗驱动的愉悦型信号被标记为 primary_eligible。
3. **系统性 signal_owner 错误**：同一类 signal_owner 误判出现 ≥3 次。
4. **系统性 asset_eligibility 错误**：同一类 asset_eligibility 误判出现 ≥3 次。
5. **高互动上下文样本未单独审核**：高互动/高风险语境样本仅作为随机样本审核，未经定向审查。
6. **任何非法 owner-eligibility 组合**：`founder/content/campaign/community/platform/category/competitor + primary_eligible/secondary_only`。

### 通过条件（全部满足）
1. 无致命失败条件触发。
2. 无系统性极性反转（同一方向错误 ≥3 次）。
3. 无系统性 signal_owner 误归因（同一类型误归 ≥3 次）。
4. 低置信 / 无信号编码数占总数的比例得到合理解释。
5. 全局抽样错误率 < 15%。

### 未通过
- 有系统性错误 → 局部修补后重跑对应批次
- 全局错误率 ≥ 15% → 需要审查编码 prompt 并重跑
- **致命失败** → 修正 asset_eligibility 规则后重跑，不得绕过
- **Gate 未通过时不得进入 Step 6**

## 输出文件

- `work/05_coding_gate.md`：编码质量审核报告（含四组样本表，使用 `templates/review-sample-table.md`）
- `work/contracts/05_quality_gate.json`：合约

## Contract 字段

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `sample_size` | integer | ✅ | 审核抽样总数量 |
| `random_review` | object | ✅ | **v3**: 随机抽样审核结果 |
| `high_like_review` | object | ✅ | **v3**: 高互动样本审核结果 |
| `context_risk_review` | object | ✅ | **v3**: 上下文风险样本审核结果 |
| `primary_evidence_review` | object | ✅ | **v3**: 主落点证据逐条审核结果 |
| `supporting_evidence_review` | object | ✅ | **v3.2**: 辅助证据审核结果 |
| `critical_errors` | array | ✅ | 严重错误列表（含 v3 ineligible_primary 类型） |
| `systematic_error_types` | array | 否 | 系统性错误类型（同一类型 ≥3 次时记录） |
| `critical_failures` | array | 否 | **v3**: 致命失败条件列表 |
| `gate_result` | string | ✅ | pass / fail_rerun / fail_prompt_revision |
| `rerun_required` | boolean | ✅ | 是否需要重跑 |
| `patch_instructions` | string | 否 | 如果需要重跑，具体的修正说明 |

## Completion Criterion

- [ ] 完成了五组定向审核（random / high_like / context_risk / primary_evidence / supporting_evidence）
- [ ] 所有 primary_eligible 文本已逐条审查
- [ ] supporting evidence 已审查，且仅包含 secondary_only 自有信号
- [ ] 没有非法 owner-eligibility 组合
- [ ] 无致命失败条件触发
- [ ] 无系统性极性反转（同一方向 ≥3 次）
- [ ] 无系统性 signal_owner 误归因（同一类型 ≥3 次）
- [ ] 无系统性 asset_eligibility 误判（同一类型 ≥3 次）
- [ ] 空编码比例得到合理解释
- [ ] 全局抽样错误率 < 15%
- [ ] Gate 未通过时已记录 `patch_instructions`
- [ ] 未通过的 Gate 已修正或重跑，不得直接写入报告
- [ ] 高互动上下文未仅作为随机样本审核

## 常见失败

| 失败 | 后果 | 防范 |
|------|------|------|
| 抽样只看结果不看原文 | 错误实际无法被发现 | 每条抽样必须对照原文审核 |
| 发现错误后仍继续写报告 | Gate 形同虚设 | Gate 未通过则不得进入 Step 6 |
| 只抽结果好看的样本 | 高错误率区域被漏检 | 优先覆盖 low_confidence 和活跃原型样本 |
| **高互动样本未单独审核（v3）** | 高赞误归因被遗漏 | 必须单独做 high_like_review |
| **primary_eligible 未逐条审查（v3）** | 社区/活动文本进入品牌主定位 | 所有 primary_eligible 须逐条审核 |
| **secondary_only 未审查（v3.2）** | 放宽口径变成新的污染入口 | supporting_evidence_review 必须审查辅助证据 |
