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

## 门禁规则

### Fail-fast
正式报告必须同时具备 `work/contracts/03`-`06` 四个合约。缺失 → 只输出预分析。  
禁用别名：`04_semantic_coding`、`06_scoring_positioning`、`07_report_generation`。  
纯关键词/词频/表情不得作为主落点证据。

### 四大 Gate（任一不通过则停止/重跑，不得进入下游）
1. **Step 0→1**: `analysis_object_type` 必须明确（brand/product/founder/content-IP 等）。
2. **Step 1→2**: 用户确认范围 + `analysis_lens`。涉及 founder/IP 时须指定口径（brand_positioning / founder_shadow / content_ip_shadow）。
3. **Step 3→4**: 误判率 < 10%。campaign/community/platform 信号不得混入品牌证据。
4. **Step 5→6**: 无系统性极性反转 / signal_owner 误归因 / asset_eligibility 误判。

### 品牌证据来源
主落点只来自 `brand/product/product_line + primary_eligible`，详见 `domain/signal-owner-rules.md`。  
founder/content/IP/campaign/community/platform/competitor 信号只用于旁路/语境说明。  
报告第一屏必须先展示自有信号与语境信号的区分。

## 资源路由

| 步骤 | 必读 ref | 领域知识 ref | 可选工具 |
|------|---------|-------------|---------|
| Step 0 | `workflow/00-data-inventory.md` | `domain/analysis-object-types.md` | `head`, `qsv`, `jq` |
| Step 1 | `workflow/01-scope-checkpoint.md` | — | — |
| Step 2 | `workflow/02-sampling-strategy.md` | — | CSV/JSON 统计脚本 |
| Step 3 | `workflow/03-object-related-filter.md` | `domain/signal-owner-rules.md` | 批次脚本 |
| Step 4 | `workflow/04-needscope-semantic-coding.md` | `domain/needscope-six-archetypes.md`, `domain/signal-owner-rules.md` | 批次 + 合并脚本 |
| Step 5 | `workflow/05-quality-gates.md` | `domain/confidence-framework.md` | 随机抽样脚本 |
| Step 6 | `workflow/06-positioning-and-scoring.md` | `domain/confidence-framework.md` | 统计脚本 |
| Step 7 | `workflow/07-report-generation.md` | `templates/report.md`, `templates/report.html` | — |

## Contract 链

`00_data_inventory → 01_scope_decision → 02_sampling_plan → 03_object_filter → 04_archetype_coding → 05_quality_gate → 06_positioning → 07_report`

每个 Step 读取前一步的 contract（确认前置条件），执行后写当前步。全部 field 定义见 `references/contracts/contract-definitions.md`。

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

> 此 Skill 的规划设计文件已归档至 `references/archive/planning/`。当前活跃路径从 workflow/ domain/ contracts/ templates/ 开始。
