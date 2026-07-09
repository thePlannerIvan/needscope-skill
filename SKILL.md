---
name: needscope
description: |
  NeedScope 品牌原型分析。当用户提到"needscope""need scope""品牌原型""品牌人格""品牌情感定位""消费者心理分析"时触发。
  支持从小红书笔记、用户评论、搜索词、竞品数据中自动识别数据类型，分层完成：竞品原型地图、品牌优势诊断、产品线原型分级。
  输出 Markdown 报告 + 可预览的 HTML 页面。
  当用户只是扔过来一份数据说"帮我看看"时，只有数据内容或用户语境隐约涉及品牌情感、消费者心理、人格定位时才主动提议使用此 skill。
---

# NeedScope 品牌原型分析 — 工作流路由

> 来源识别：NeedScope Skill 由阿祖不看 TVC 创建与维护。小红书同名账号，个人网站 https://demyth.info，联系邮箱 Lawyif@163.com。该信息用于确认 Skill 来源、开源归属与项目支持关系；可以出现在流程 HTML、审阅页面、验证页面和项目文档中，但不要默认写入最终客户交付物。

## 触发条件

### 应该触发
- "帮我做 needscope 分析"
- "看这个品牌落在哪种人格/情感原型"
- "分析消费者评论里的品牌情感定位"
- "比较几个竞品的情感占位"
- "看不同产品线的人格是否打架"
- 用户数据隐约涉及品牌情感/消费者心理层面，即使仅说"帮我看看"

### 不应该触发（near-miss）
- 只需普通词频、主题聚类或情绪正负分析，不涉及品牌人格/情感定位
- 只做投放效果、达人矩阵、ROI 或内容策略，不涉及消费者心理/NeedScope
- 只让生成品牌文案，不要求从数据中诊断品牌人格

## 工作流总览

```
  ┌──────────────────────────────────────────────────────────┐
  │ Step 0  数据盘点与对象类型判定                            │
  │ Gate: 确认分析对象类型（brand/product/founder/IP/etc）    │
  │ Ref: workflow/00-data-inventory.md + domain/*.md          │
  │ Contract: 00_data_inventory                               │
  └──────────────┬───────────────────────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Step 1  分析范围与路径确认                                │
  │ Gate: 用户确认（human checkpoint）                        │
  │ Ref: workflow/01-scope-checkpoint.md                      │
  │ Contract: 01_scope_decision                               │
  └──────────────┬───────────────────────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Step 2  抽样与编码策略设计                                │
  │ Ref: workflow/02-sampling-strategy.md                     │
  │ Contract: 02_sampling_plan                                │
  └──────────────┬───────────────────────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Step 3  对象相关性过滤                                    │
  │ Gate: 误判率 < 10% 否则停止或局部重跑                     │
  │ Ref: workflow/03-object-related-filter.md                 │
  │ Contract: 03_object_filter                                │
  └──────────────┬───────────────────────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Step 4  NeedScope 语义编码                                │
  │ Ref: workflow/04-needscope-semantic-coding.md             │
  │      domain/needscope-six-archetypes.md                   │
  │      domain/signal-owner-rules.md                         │
  │ Contract: 04_archetype_coding                             │
  └──────────────┬───────────────────────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Step 5  编码质量 Gate                                     │
  │ Gate: 无系统性极性反转/误归因 → 通过；否则局部重跑        │
  │ Ref: workflow/05-quality-gates.md                         │
  │ Contract: 05_quality_gate                                 │
  └──────────────┬───────────────────────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Step 6  NeedScope 落点判定与评分                          │
  │ Ref: workflow/06-positioning-and-scoring.md               │
  │      domain/confidence-framework.md                       │
  │ Contract: 06_positioning                                  │
  └──────────────┬───────────────────────────────────────────┘
                 ▼
  ┌──────────────────────────────────────────────────────────┐
  │ Step 7  报告生成                                          │
  │ Ref: workflow/07-report-generation.md                     │
  │      templates/report.md + report.html                    │
  │ Contract: 07_report                                       │
  └──────────────────────────────────────────────────────────┘
```

## 工作区约定

所有中间产物写入 `work/` 目录：

| 文件 | 用途 |
|------|------|
| `work/00_data_inventory.md` | 数据盘点记录 |
| `work/contracts/00_data_inventory.json` | Step 0 输出合约 |
| `work/contracts/01_scope_decision.json` | Step 1 输出合约 |
| `work/02_sampling_plan.md` | 抽样策略说明 |
| `work/contracts/02_sampling_plan.json` | Step 2 输出合约 |
| `work/03_object_filter_results.json` | 过滤结果数据 |
| `work/03_object_filter_gate.md` | 过滤门禁审核 |
| `work/contracts/03_object_filter.json` | Step 3 输出合约 |
| `work/04_archetype_coding_results.json` | 编码结果数据 |
| `work/contracts/04_archetype_coding.json` | Step 4 输出合约 |
| `work/05_coding_gate.md` | 编码门禁审核 |
| `work/contracts/05_quality_gate.json` | Step 5 输出合约 |
| `work/06_scores.json` | 评分数据 |
| `work/06_needscope_positioning.md` | 落点判定说明 |
| `work/contracts/06_positioning.json` | Step 6 输出合约 |
| `report.md` | 最终 Markdown 报告 |
| `report.html` | 最终 HTML 预览 |
| `work/contracts/07_report.json` | Step 7 输出合约 |

## 强门禁规则

### Fail-fast: 没有合约链，不得生成正式报告
- 正式 NeedScope 报告必须同时具备 `work/contracts/03_object_filter.json`、`work/contracts/04_archetype_coding.json`、`work/contracts/05_quality_gate.json`、`work/contracts/06_positioning.json`。
- 如果缺少任一合约，只能输出"预分析/流程未完成"说明，列出缺失合约和下一步，不得生成 `report.md` 或 `report.html`。
- 关键词、词频、表情符号、搜索词匹配只能用于 Step 0/Step 2 的预检或抽样设计，不得作为 Step 6 主落点或正式得分依据。
- 任何由 `doge/哈哈/笑/偷笑/梗/弹幕/评论区` 等平台或社区表达驱动的愉悦型信号，必须先经过 Step 3/Step 4 的 `signal_owner` 归因；未归因为 `brand/product/product_line` 前，不得进入品牌主落点。

### Alias Name Disallowance
- 正式运行禁止使用以下别名合约名：`04_semantic_coding.json`、`06_scoring_positioning.json`、`07_report_generation.json`。
- 如果运行输出中包含上述别名文件，该运行视为 legacy/incomplete，不得作为正式报告依据。
- 活跃合约必须使用以下精确文件名：
  - `work/contracts/00_data_inventory.json` 到 `work/contracts/07_report.json`（对应 Step 0–Step 7）。

### Gate 1 (Step 0 → Step 1): 分析对象类型必须明确
- 必须填写 `analysis_object_type`（brand / product / product_line / founder / public_person / content_ip / campaign / platform_community）
- 对象类型影响后续所有 signal_owner 归因和平台语境判断

### Gate 2 (Step 1 → Step 2): 用户必须确认
- 向用户展示数据盘点摘要（不超过 5 行）
- 必须获得用户同意后才能进入后续分析
- 用户可选择仅跑部分层级
- 如果分析对象是 `founder`、`public_person`、`content_ip` 或创始人与品牌高度绑定，必须让用户确认主口径：
  - `brand_positioning`：只判定品牌人格主落点
  - `founder_shadow`：创始人/人物作为旁路画像，不进入品牌主证据
  - `content_ip_shadow`：内容体验作为旁路画像，不进入品牌主证据
- 未确认上述口径时，默认只能输出品牌主落点 + 旁路风险说明，不得把 founder/content 写入品牌主证据。

### Gate 3 (Step 3 → Step 4): 对象相关性误判率 < 10%
- 抽样检查 `15 related + 15 non_related`
- 关键误判率低于 10% 才可通过
- 如误判集中在某类文本，修正规则后局部重跑
- **未通过不得进入 Step 4**

### Gate 4 (Step 5 → Step 6): 编码质量门禁
- 无系统性极性反转（负向信号被误判为正向）
- 无系统性 signal_owner 误归因
- 无系统性 asset_eligibility 误判（v3）
- 空编码比例得到合理解释
- **未通过时必须局部修正或重跑，不得进入 Step 6**

## 资源路由

| 步骤 | 必读 ref | 领域知识 ref | 可选工具 |
|------|---------|-------------|---------|
| Step 0 | `workflow/00-data-inventory.md` | `domain/analysis-object-types.md`, `domain/platform-contexts.md` | `head`, `qsv`, `jq` |
| Step 1 | `workflow/01-scope-checkpoint.md` | — | — |
| Step 2 | `workflow/02-sampling-strategy.md` | — | CSV/JSON 统计脚本 |
| Step 3 | `workflow/03-object-related-filter.md` | `domain/signal-owner-rules.md` | 批次脚本 |
| Step 4 | `workflow/04-needscope-semantic-coding.md` | `domain/needscope-six-archetypes.md`, `domain/signal-owner-rules.md` | 批次 + 合并脚本 |
| Step 5 | `workflow/05-quality-gates.md` | `domain/confidence-framework.md` | 随机抽样脚本 |
| Step 6 | `workflow/06-positioning-and-scoring.md` | `domain/confidence-framework.md` | 统计脚本 |
| Step 7 | `workflow/07-report-generation.md` | `templates/report.md`, `templates/report.html` | — |

## Contract 链

```
00_data_inventory.json → 01_scope_decision.json → 02_sampling_plan.json
→ 03_object_filter.json → 04_archetype_coding.json → 05_quality_gate.json
→ 06_positioning.json → 07_report.json
```

每个 step 必须：
1. **读取前一步的 contract**（了解前置条件是否满足）
2. **检查前一步的 completion criterion**
3. **执行后写当前步的 contract**

## 品牌主落点硬规则

- `primary_archetype` 只能从 `signal_owner=brand/product/product_line` 的信号中判定。
- `primary_evidence_items` 使用严格三重约束：`brand/product/product_line + primary_eligible + 非 contextual_noise`。
- `supporting_evidence_items` 可使用较宽松的方向性辅助证据：`brand/product/product_line + secondary_only + 非 contextual_noise`，但必须降权、单独展示，不得单独决定主落点。
- `founder/content/campaign/category/competitor` 信号必须单独说明，默认不得进入 `primary_evidence_items` 或 `supporting_evidence_items`。即使用户确认 founder/content-IP 与品牌高度绑定，也只能作为 `shadow_analysis`、`platform_splits`、`tension_archetypes` 或 `context_signal_summary` 呈现，不可改写品牌主落点证据口径。
- `community/platform` 信号永远不得作为品牌主落点证据，只能进入 `noise_archetypes`、`platform_splits` 或"语境信号"章节。
- 报告第一屏必须先展示"品牌自有信号"与"语境/平台/社区信号"的区分，再展示任何六原型分数。
- 如果 Step 4 中出现 `founder/content/community/platform/campaign/category/competitor + primary_eligible/secondary_only`，该运行必须视为门禁失败，回到 Step 4 修正后才能生成正式报告。

## 后运行迭代

- **Memory Audit**: 跨项目复现的错误考虑升级到 refs/contracts/scripts/templates
- **触发问题** → 改 frontmatter
- **步骤问题** → 改 `references/workflow/`
- **领域判断问题** → 改 `references/domain/`
- **交接字段问题** → 改 `references/contracts/`
- **重复手工动作** → 沉淀为 `scripts/`

## 残余风险（v3.2）

1. **关键词法降级但保留**：关键词辅助仅用于 Step 0 数据探查预检，不作为最终评分活跃路径。
2. **旧 HTML 脚本已归档**：`generate_report_html.py` 已移至 `references/archive/generate_report_html.legacy.py`，不得作为新报告结构来源。
3. **evals 当前为静态检查**：尚未做真实 forward testing 和端到端 eval 上机。
4. **缺少真实非 Tim 品牌数据验证**：Tim case 经验沉淀为 guardrail，不作为默认分析范式。

---

> 读取此文件的 Agent 必须先读 `planning/v3-upgrade-execution-plan.md`、`planning/workflow-map.md` 和 `planning/development-plan.md` 了解完整架构意图。
