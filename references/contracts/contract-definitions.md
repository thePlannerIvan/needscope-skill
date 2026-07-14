# Contract Field Reference

各 Step 的输出合约字段在此统一定义。运行时合约保存为 `work/contracts/0N_<name>.json`。

此文件替代原先 8 个独立的 JSON Schema 文件。各 workflow reference 中的「Contract 字段」表和 SKILL.md 的工作区表已合并至此。

---

## Step 0: 00_data_inventory

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| analysis_object_type | string | ✅ | 分析对象: brand / product / product_line / founder / public_person / content_ip / campaign / platform_community |
| analysis_object_boundary | string | ✅ | 对象边界: 名称、品类归属、数据覆盖范围 |
| data_sources | array | ✅ | [{path, type, record_count, fields, sample}] |
| platform_contexts | array | ✅ | 各数据源的平台语境标签 |
| supported_layers | array | ✅ | 可支持的层级列表 |
| max_confidence_level | enum | ✅ | decision / directional / exploratory_usable / exploratory_thin |
| context_risk_flags | array | ✅ | v3: [celebrity, fan, event, campaign, meme, category_discussion, competitor_hijack, …] |
| context_risk_level | enum | ✅ | v3: low / medium / high |
| max_confidence_ceiling | enum | ✅ | v3: 基于 context_risk 调整后的置信度上限 |
| warnings | array | — | 数据质量警告 |
| human_decision_required | boolean | ✅ | 是否有边界争议需要用户确认 |

---

## Step 1: 01_scope_decision

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| layers_to_run | array | ✅ | 用户确认的层级: ["A"], ["A","B"], 等 |
| accepted_confidence_limit | string | ✅ | 用户是否接受当前置信度上限 |
| coding_budget_mode | enum | ✅ | conservative / balanced / exhaustive |
| analysis_lens | enum | ✅ | brand_positioning / founder_shadow / content_ip_shadow / mixed_with_guardrails / person_profile |
| shadow_analysis_allowed | boolean | ✅ | 是否允许 founder/content 旁路画像 |
| user_constraints | string | — | 用户额外约束 |
| approved_to_continue | boolean | ✅ | 用户是否同意继续 |

---

## Step 2: 02_sampling_plan

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| total_records | integer | ✅ | 原始数据总记录数 |
| dedupe_strategy | enum | ✅ | exact / fuzzy / none |
| sampling_mode | enum | ✅ | full / stratified / clustered / active_learning |
| strata | array | — | 分层维度列表 |
| sample_sizes | object | ✅ | 每层/每桶的抽样数量 |
| random_sample | object | ✅ | v3: {size, selection_method} |
| high_like_sample | object | ✅ | v3: {size, criteria} |
| context_risk_sample | object | ✅ | v3: {size, included_risk_flags} |
| primary_candidate_sample | object | — | v3: {size, criteria}，可选 |
| full_coding_subsets | array | — | 全量编码的子集说明 |
| excluded_records | integer | ✅ | 排除的记录数 |
| rationale | string | ✅ | 策略选择理由及误差影响 |

---

## Step 3: 03_object_filter

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| total_checked | integer | ✅ | 总检查文本数 |
| object_related_count | integer | ✅ | 通过过滤（编码输入） |
| non_object_count | integer | ✅ | 未通过过滤 |
| low_confidence_count | integer | ✅ | 低置信文本数 |
| relation_type_distribution | object | ✅ | v3: 11 类关系分布 |
| gate_result | enum | ✅ | pass / fail / partial_rerun_required |
| gate_samples | array | ✅ | [{text, relation_type, confidence}] |
| warnings | array | — | 误判趋势或边界风险 |

---

## Step 4: 04_archetype_coding

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| coded_count | integer | ✅ | 编码文本总数 |
| empty_archetype_count | integer | ✅ | 未分配原型的文本数 |
| archetype_signal_counts | object | ✅ | 六原型频次计数 |
| sentiment_counts | object | ✅ | {positive: n, negative: n} |
| signal_owner_distribution | object | ✅ | 10 类 owner 频次分布 |
| low_confidence_count | integer | ✅ | 低置信编码数 |
| coded_items | array | ✅ | 每条文本编码明细（见下表） |
| schema_warnings | array | — | 编码异常或歧义记录 |

### coded_items[] 每条子字段

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| text | string | ✅ | 原文 |
| archetypes | string[] | ✅ | 可空 []，值: 突破型/身份型/掌控型/呵护型/归属型/愉悦型 |
| sentiment | enum | ✅ | positive=对象拥有该特质 / negative=对象缺乏该特质 |
| signal_owner | enum | ✅ | brand / product / product_line / founder / content / community / platform / campaign / category / competitor |
| signal_role | enum | ✅ | core_identity / supporting_asset / contextual_noise |
| evidence | string | ✅ | 关键短语 |
| confidence | enum | ✅ | high / medium / low |
| asset_eligibility | enum | ✅ | v3: primary_eligible / secondary_only / context_only / exclude_from_positioning |
| eligibility_reason | string | ✅ | v3: 判断理由 |
| notes | string | — | 歧义说明 |

**约束（品牌分析默认）：**
- `asset_eligibility=primary_eligible` → `signal_owner` ∈ {brand, product, product_line}
- `asset_eligibility=secondary_only` → `signal_owner` ∈ {brand, product, product_line}
- `signal_role=contextual_noise` → `asset_eligibility` ∈ {context_only, exclude_from_positioning}

**人物分析覆盖**（`analysis_object_type=founder/public_person/content_ip`）：
- `asset_eligibility=primary_eligible` → `signal_owner` ∈ {founder, brand, product, product_line}
- `asset_eligibility=secondary_only` → `signal_owner` ∈ {founder, content, brand, product, product_line}
- 详见 `domain/signal-owner-rules.md`

---

## Step 5: 05_quality_gate

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| sample_size | integer | ✅ | 审核抽样总数量 |
| random_review | object | ✅ | v3: 随机抽样审核结果 |
| high_like_review | object | ✅ | v3: 高互动定向审核结果 |
| context_risk_review | object | ✅ | v3: 上下文风险审核结果 |
| primary_evidence_review | object | ✅ | v3: 主落点证据逐条审核结果 |
| supporting_evidence_review | object | ✅ | v3.2: 辅助证据审核结果 |
| critical_errors | array | ✅ | 严重错误列表（含 ineligible_primary 类型） |
| systematic_error_types | array | — | 系统性错误类型（同类型 ≥3 次） |
| critical_failures | array | — | v3: 致命失败条件列表 |
| gate_result | enum | ✅ | pass / fail_rerun / fail_prompt_revision |
| rerun_required | boolean | ✅ | 是否需要重跑 |
| patch_instructions | string | — | 重跑修正说明 |

---

## Step 6: 06_positioning

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| evidence_metrics | object | ✅ | 信号密度、置信度分布、数据量统计 |
| owned_signal_summary | object | ✅ | brand/product/product_line 信号摘要 |
| context_signal_summary | object | ✅ | founder/content/community/platform/campaign 等信号摘要 |
| primary_archetype | enum | ✅ | 突破型/身份型/掌控型/呵护型/归属型/愉悦型/未判定 |
| primary_evidence_items | array | ✅ | 核心证据（见约束） |
| supporting_evidence_items | array | ✅ | v3.2: 辅助证据（见约束） |
| evidence_basis_counts | object | ✅ | v3.2: {primary_count, supporting_count, positioning_count, context_excluded_count, notes} |
| excluded_high_influence_items | array | — | v3: 被排除的高影响信号 |
| insufficient_owned_signal_reason | string | — | v3: primary_archetype=未判定时必填 |
| shadow_analysis | object | — | v3.2: founder/content-IP/campaign 旁路画像 |
| secondary_archetypes | string[] | — | 次落点（可空） |
| tension_archetypes | array | — | [{archetypes[], description}] |
| absent_archetypes | string[] | — | 完全无信号的缺席原型 |
| noise_archetypes | array | — | [{archetype, signal_owner, reason}] |
| negative_gaps | array | — | [{archetype, examples[]}] |
| platform_splits | array | — | [{platform, primary_archetype, note}] |
| confidence | enum | ✅ | high / medium / low |

### primary_evidence_items[] 每条子字段

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| text | string | ✅ | 原文 |
| signal_owner | enum | ✅ | 品牌分析: brand/product/product_line；人物分析: 含 founder |
| asset_eligibility | enum | ✅ | 必须为 primary_eligible |
| signal_role | enum | ✅ | core_identity / supporting_asset (非 contextual_noise) |
| archetype | string | ✅ | 指向的原型 |
| confidence | enum | ✅ | high / medium / low |

### supporting_evidence_items[] 每条子字段

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| text | string | ✅ | 原文 |
| signal_owner | enum | ✅ | 品牌分析: brand/product/product_line；人物分析: 含 founder/content |
| asset_eligibility | enum | ✅ | 必须为 secondary_only |
| signal_role | enum | ✅ | core_identity / supporting_asset (非 contextual_noise) |
| archetype | string | ✅ | 指向的原型 |
| confidence | enum | ✅ | high / medium / low |
| discount_reason | string | ✅ | 为什么只能辅助证据 |

**约束：**
- `primary_archetype ≠ 未判定` → `primary_evidence_items` 至少 1 条
- **品牌分析默认**: 仅 `signal_owner=brand/product/product_line` + `primary_eligible` + 非 contextual_noise
- **人物分析**（`analysis_object_type=founder/public_person/content_ip`）: `signal_owner=founder` 可进入 primary_evidence；`content` 可进入 supporting_evidence。详见 `domain/signal-owner-rules.md`
- `community/platform/category/competitor` 永远不得出现在品牌证据数组中

---

## Step 7: 07_report

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| report_files | array | ✅ | 生成的文件路径列表 |
| sections_included | array | ✅ | 报告包含的章节 |
| six_archetype_bars_location | enum | ✅ | v3: appendix_only / evidence_section_not_first / not_present |
| six_archetype_bars_segmented_by_owner | boolean | ✅ | v3 |
| first_screen_order_compliant | boolean | ✅ | v3 |
| confidence_disclosure | string | ✅ | 整体置信度公开说明 |
| data_gap_section_required | boolean | ✅ | 是否需要数据补充章节 |
| warnings | array | — | 报告标注的警告或边界说明 |
