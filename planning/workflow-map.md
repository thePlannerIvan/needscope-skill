# Needscope Skill Upgrade Workflow Map

## 目的

将 `needscope` 从单体提示词式分析 Skill 升级为可复用、可验证、可扩展的 NeedScope 工作流系统。升级后的 Skill 必须稳定完成：

- 识别数据源、分析对象和平台语境。
- 根据数据量选择全量编码、分层抽样、聚类抽样或局部复核。
- 在 NeedScope 编码前先做对象相关性过滤。
- 区分品牌、产品、创始人、内容、社区和平台信号。
- 输出品牌 NeedScope 主落点、次落点、张力和错位，而不是六原型优劣势体检。
- 将 Tim 项目经验沉淀为防错机制，而不是默认分析范式。

## Leading Words

- NeedScope
- 品牌人格
- 情感原型

## 触发

- 模式：model-invoked + user-invoked
- 应该触发于：
  - "帮我做 needscope 分析"
  - "看这个品牌落在哪种人格/情感原型"
  - "分析消费者评论里的品牌情感定位"
  - "比较几个竞品的情感占位"
  - "看不同产品线的人格是否打架"
- 不应该触发于：
  - 只要普通词频、主题聚类或情绪正负分析，不涉及品牌人格/情感定位。
  - 只做投放效果、达人矩阵、ROI 或内容策略，不涉及消费者心理/NeedScope。
  - 只让生成品牌文案，不要求从数据中诊断品牌人格。

## 工作流

### Step 0: 数据盘点与对象类型判定

- 目的：先判断本次分析对象和数据语境，防止把人物/IP案例的经验误套到普通品牌。
- 管控级别：L2 文件关隘 + L5 合约
- 输入：用户任务、数据文件、品牌/品类/竞品背景。
- 必需 refs：
  - `references/workflow/00-data-inventory.md`
  - `references/domain/analysis-object-types.md`
  - `references/domain/platform-contexts.md`
  - `references/contracts/00_data_inventory.schema.json`
- 必需 scripts/tools：`rg`/`qsv`/`jq` 检查文件、字段和样本；必要时只做 schema inspect，不进入分析。
- 人机介入点：如果分析对象、品类或品牌边界不清，先停下来问用户。
- 输出：
  - `work/00_data_inventory.md`
  - `work/contracts/00_data_inventory.json`
- Contract：
  - `analysis_object_type`
  - `data_sources`
  - `platform_contexts`
  - `supported_layers`
  - `max_confidence_level`
  - `warnings`
  - `human_decision_required`
- Completion criterion：
  - 已明确分析对象是 `brand/product/product_line/founder/public_person/content_ip/campaign/platform_community` 中哪一种或哪几种。
  - 已说明每类数据回答的问题。
  - 已说明最多能支持哪些分析层级。
  - 已标注最高置信度上限。
- 常见失败：
  - 把创始人/IP当普通品牌。
  - 把官方内容当消费者感受。
  - 看到评论就直接进入 NeedScope 编码。

### Step 1: 分析范围与路径确认

- 目的：让用户确认分析层级、数据解释口径和成本策略。
- 管控级别：Human Checkpoint + L2 文件关隘
- 输入：`work/contracts/00_data_inventory.json`
- 必需 refs：
  - `references/workflow/01-scope-checkpoint.md`
  - `references/contracts/01_scope_decision.schema.json`
- 必需 scripts/tools：无。
- 人机介入点：必须向用户展示不超过 5 行的数据盘点摘要，并请求确认。
- 输出：
  - `work/contracts/01_scope_decision.json`
- Contract：
  - `layers_to_run`
  - `accepted_confidence_limit`
  - `coding_budget_mode`
  - `user_constraints`
  - `approved_to_continue`
- Completion criterion：
  - 用户确认要跑的层级。
  - 用户知道当前数据能支持的结论边界。
  - 如果数据量较大，用户知道不会默认全量逐句 LLM 标注。
- 常见失败：
  - 跳过用户确认直接做全流程。
  - 用户只想要品牌诊断，Agent 却硬跑竞品地图或产品线分级。

### Step 2: 抽样与编码策略设计

- 目的：控制 token 成本，同时保证样本代表性。
- 管控级别：L2 文件关隘 + L3 可脚本化检查
- 输入：
  - `work/contracts/00_data_inventory.json`
  - `work/contracts/01_scope_decision.json`
  - 原始数据或清洗后数据
- 必需 refs：
  - `references/workflow/02-sampling-strategy.md`
  - `references/contracts/02_sampling_plan.schema.json`
- 必需 scripts/tools：
  - 可选：CSV/JSON 行数、去重、分层计数、字段统计脚本。
- 人机介入点：仅当抽样会显著影响结论边界时请求用户确认。
- 输出：
  - `work/02_sampling_plan.md`
  - `work/contracts/02_sampling_plan.json`
- Contract：
  - `total_records`
  - `dedupe_strategy`
  - `sampling_mode`
  - `strata`
  - `sample_sizes`
  - `full_coding_subsets`
  - `excluded_records`
  - `rationale`
- Completion criterion：
  - 数据量 < 500 可全量编码。
  - 500-5,000 条默认分层抽样 + 高价值文本全量编码。
  - 5,000-50,000 条默认去重/聚类/主题分桶后抽样编码。
  - > 50,000 条默认统计预处理 + 主动学习式抽样 + 局部 LLM 复核。
  - 不允许只抽热门评论或只抽最容易编码的文本。
- 常见失败：
  - LLM 被当成搬运工，全量逐句标注导致 token 浪费。
  - 抽样策略没有覆盖平台、互动量、主题桶或产品线。

### Step 3: 对象相关性过滤

- 目的：先判断文本是否在评价分析对象，而不是讨论内容、平台、社区、话题或无关对象。
- 管控级别：L4 拆分 Agent + L5 Gate
- 输入：
  - `work/contracts/02_sampling_plan.json`
  - 待编码样本
- 必需 refs：
  - `references/workflow/03-object-related-filter.md`
  - `references/contracts/03_object_filter.schema.json`
- 必需 scripts/tools：
  - 批次切分、结果合并、抽样检查工具可脚本化。
- 人机介入点：Gate 未通过时必须停下，不得进入 Step 4。
- 输出：
  - `work/03_object_filter_results.json`
  - `work/03_object_filter_gate.md`
  - `work/contracts/03_object_filter.json`
- Contract：
  - `total_checked`
  - `object_related_count`
  - `non_object_count`
  - `low_confidence_count`
  - `relation_type_distribution`
  - `gate_result`
  - `gate_samples`
  - `warnings`
- Completion criterion：
  - 抽样检查 `15 related + 15 non_related`。
  - 关键误判率低于 10%。
  - 如误判集中在某类文本，修正规则或 prompt 后局部重跑。
- 常见失败：
  - 把内容评价当品牌人格。
  - 把平台文化当品牌评价。
  - 把提及品牌当评价品牌。

### Step 4: NeedScope 语义编码

- 目的：对已通过相关性过滤的文本编码 NeedScope 原型、极性、信号归属和信号角色。
- 管控级别：L4 拆分 Agent + L5 合约
- 输入：
  - `work/03_object_filter_results.json`
  - `work/contracts/03_object_filter.json`
- 必需 refs：
  - `references/workflow/04-needscope-semantic-coding.md`
  - `references/domain/needscope-six-archetypes.md`
  - `references/domain/signal-owner-rules.md`
  - `references/contracts/04_archetype_coding.schema.json`
- 必需 scripts/tools：
  - 批次切分、结果合并、重复 idx 去重、schema 检查。
- 人机介入点：仅在对象边界或原型定义严重歧义时请求用户输入。
- 输出：
  - `work/04_archetype_coding_results.json`
  - `work/contracts/04_archetype_coding.json`
- Contract：
  - `coded_count`
  - `empty_archetype_count`
  - `archetype_signal_counts`
  - `sentiment_counts`
  - `signal_owner_distribution`
  - `low_confidence_count`
  - `schema_warnings`
- Completion criterion：
  - 每条原型信号有 `name/sentiment/signal_owner/signal_role/evidence/confidence`。
  - `sentiment` 表示对象拥有或缺乏该原型特质，不表示评论情绪正负。
  - `archetypes: []` 是合法输出。
  - 社区、平台、内容话题信号不能直接归为品牌主原型。
- 常见失败：
  - 把"紧绷/不松弛"算成归属型 positive。
  - 为了产出而强行给每条文本分配原型。
  - 把 B站玩梗文化直接算成品牌愉悦型人格。

### Step 5: 编码质量 Gate

- 目的：在量化前拦住系统性编码错误。
- 管控级别：Human Checkpoint + L5 Gate
- 输入：
  - `work/04_archetype_coding_results.json`
  - `work/contracts/04_archetype_coding.json`
- 必需 refs：
  - `references/workflow/05-quality-gates.md`
  - `references/contracts/05_quality_gate.schema.json`
- 必需 scripts/tools：
  - 随机抽样、按低置信/高影响样本抽样。
- 人机介入点：展示抽样样本表和主要风险，请用户或执行 Agent 审核。
- 输出：
  - `work/05_coding_gate.md`
  - `work/contracts/05_quality_gate.json`
- Contract：
  - `sample_size`
  - `critical_errors`
  - `systematic_error_types`
  - `gate_result`
  - `rerun_required`
  - `patch_instructions`
- Completion criterion：
  - 无系统性极性反转。
  - 无系统性 signal_owner 误归因。
  - 空编码比例得到解释。
  - Gate 未通过时必须局部修正或重跑。
- 常见失败：
  - 抽样只看结果不看原文。
  - 发现错误后仍继续写报告。

### Step 6: NeedScope 落点判定与评分

- 目的：将编码结果转化为 NeedScope 主落点、次落点、张力、缺席和错位。
- 管控级别：L2 文件关隘 + L5 合约
- 输入：
  - `work/04_archetype_coding_results.json`
  - `work/contracts/05_quality_gate.json`
- 必需 refs：
  - `references/workflow/06-positioning-and-scoring.md`
  - `references/domain/confidence-framework.md`
  - `references/contracts/06_positioning.schema.json`
- 必需 scripts/tools：
  - 可选：密度、信号量、signal_owner 分布、平台差异统计。
- 人机介入点：如果主落点有多个候选且证据接近，向用户展示解释口径。
- 输出：
  - `work/06_scores.json`
  - `work/06_needscope_positioning.md`
  - `work/contracts/06_positioning.json`
- Contract：
  - `evidence_metrics`
  - `primary_archetype`
  - `secondary_archetypes`
  - `tension_archetypes`
  - `absent_archetypes`
  - `noise_archetypes`
  - `platform_splits`
  - `confidence`
- Completion criterion：
  - 分数只是证据，不是最终结论。
  - 必须区分低分、无信号、负向缺口、平台噪声和非战略重点。
  - 不允许输出"品牌应该补齐六边形"。
  - 必须回到 NeedScope 地图和人格落点。
- 常见失败：
  - 把六原型表格当报告主结论。
  - 只写优劣势，不判断品牌落在哪个情感人格区域。

### Step 7: 报告生成

- 目的：输出可交付的 Markdown 报告和 HTML 预览。
- 管控级别：L2 文件关隘
- 输入：
  - `work/06_needscope_positioning.md`
  - `work/06_scores.json`
  - 所有前置 contracts
- 必需 refs：
  - `references/workflow/07-report-generation.md`
  - `templates/report.md`
  - `templates/report.html`
- 必需 scripts/tools：
  - 可选：HTML 生成脚本，但报告结构由分析结论决定，HTML 不反向决定分析。
- 人机介入点：高风险策略建议或低置信报告应提示用户复核。
- 输出：
  - `report.md`
  - `report.html`
  - `work/contracts/07_report.json`
- Contract：
  - `report_files`
  - `sections_included`
  - `confidence_disclosure`
  - `data_gap_section_required`
  - `warnings`
- Completion criterion：
  - 第一结论是品牌 NeedScope 主落点。
  - 每条策略建议绑定主落点、错位、张力或数据缺口。
  - 人物/IP/创始人案例有解释边界。
  - 普通品牌分析不被 Tim 案例带偏。
- 常见失败：
  - 报告变成六项体检。
  - HTML 模板绑架报告结构。

## 分支

- 如果数据只有官方内容：只能分析品牌自我表达，所有消费者感知结论降级。
- 如果数据是粉丝社区：必须标注粉丝场，不得等同大众心智。
- 如果数据是公众讨论平台：必须区分公众评价、人身评价、平台风气和真实消费体验。
- 如果对象是创始人/公众人物/content IP：读取 `references/domain/analysis-object-types.md` 和 `references/domain/tim-case-lessons.md`，报告中必须说明边界。
- 如果数据量大于 5,000：必须先执行 `references/workflow/02-sampling-strategy.md`，不得默认全量 LLM 编码。
- 如果 Gate 未通过：停止并修复，不得进入下游步骤。

## 人机介入点

| 介入点 | 时机 | 用户看到什么 | 用户选择/提供什么 | 保存到哪里 |
|---|---|---|---|---|
| Scope Checkpoint | Step 0 后 | 数据源、对象类型、可跑层级、置信度上限 | 跑哪些层、是否接受抽样、是否继续 | `work/contracts/01_scope_decision.json` |
| Object Filter Gate | Step 3 后 | 过滤统计、抽样样本、误判风险 | 是否通过、是否修正规则 | `work/contracts/03_object_filter.json` |
| Coding Gate | Step 5 后 | 原型编码抽样、signal_owner 分布、系统性错误 | 是否通过、是否局部重跑 | `work/contracts/05_quality_gate.json` |
| Positioning Review | Step 6 后，主落点不稳时 | 主落点候选和证据差异 | 选择解释口径或补充业务判断 | `work/contracts/06_positioning.json` |

## 资源

### references/workflow/

- `00-data-inventory.md`：Step 0 读取。
- `01-scope-checkpoint.md`：Step 1 读取。
- `02-sampling-strategy.md`：Step 2 读取。
- `03-object-related-filter.md`：Step 3 读取。
- `04-needscope-semantic-coding.md`：Step 4 读取。
- `05-quality-gates.md`：Step 5 读取。
- `06-positioning-and-scoring.md`：Step 6 读取。
- `07-report-generation.md`：Step 7 读取。

### references/domain/

- `needscope-six-archetypes.md`：原型定义和边界。
- `analysis-object-types.md`：品牌、产品、产品线、人物/IP 分流。
- `platform-contexts.md`：平台语境和信号质量。
- `signal-owner-rules.md`：品牌/产品/创始人/内容/社区/平台归因规则。
- `confidence-framework.md`：整体与局部置信度。
- `tim-case-lessons.md`：Tim 项目作为防错案例，不作为默认范式。

### references/contracts/

- `00_data_inventory.schema.json`
- `01_scope_decision.schema.json`
- `02_sampling_plan.schema.json`
- `03_object_filter.schema.json`
- `04_archetype_coding.schema.json`
- `05_quality_gate.schema.json`
- `06_positioning.schema.json`
- `07_report.schema.json`

### templates/

- `report.md`：Markdown 报告模板。
- `report.html`：HTML 预览模板。
- `review-sample-table.md`：Gate 审核样本表模板。

## 验证计划

- 步骤级检查：
  - 每一步是否有 contract。
  - Gate 未通过是否停止。
  - 大数据是否先抽样或分桶。
  - 报告是否以主落点为第一结论。
- 端到端 eval prompts：
  - 见 `evals/evals.json`。
- 人类 review 形式：
  - Scope Checkpoint 使用聊天短摘要。
  - Gate 使用 Markdown 样本表。
  - 报告验收使用结构 checklist。
- 五种失败模式扫描：
  - Premature Completion：防止无 Gate 直接报告。
  - Duplication：防止 SKILL.md 和 references 重复同一规则。
  - Sediment：防止旧关键词评分逻辑留在活跃路径。
  - Sprawl：防止主文件继续膨胀。
  - No-op：防止只写"严谨"而没有合约。

## 持续迭代机制

- Memory Audit：
  - 当前项目限制不写入 Skill。
  - 跨项目复现的错误写入 Skill 改进候选。
  - 连续出现的流程缺陷升级到 references/contracts/scripts/templates。
- Skill 升级路径：
  - 触发问题改 frontmatter。
  - 步骤问题改 `references/workflow/`。
  - 领域判断问题改 `references/domain/`。
  - 交接字段问题改 `references/contracts/`。
  - 重复手工动作沉淀为 `scripts/`。
- 旧内容删除/失效规则：
  - 关键词法只能保留为预检/辅助，不得留在最终评分活跃路径。
  - Tim 项目只能保留为 lessons/eval，不得成为默认报告结构。
