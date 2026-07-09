# Needscope Skill Upgrade Development Plan

> Status: v2 baseline plan. For the next implementation pass, read `planning/v3-upgrade-execution-plan.md` first. v3 supersedes this file where Adidas/Nike regression failures are concerned.

## 目标路径

`02 - skills-library/01-data-analysis/NeedscopeSkill`

## 执行原则

执行 Agent 必须先读：

1. `planning/v3-upgrade-execution-plan.md`
2. `planning/workflow-map.md`
3. `planning/development-plan.md`
4. `evals/evals.json`
5. 现有 `SKILL.md`

执行 Agent 不应直接把规划文本原封不动塞进 `SKILL.md`。`SKILL.md` 应保持精简，只作为路由和强门禁入口；细节进入 references、contracts 和 templates。

## 目标文件树

```text
NeedscopeSkill/
  SKILL.md
  planning/
    workflow-map.md
    development-plan.md
  references/
    archive/
      old-skill-v1.md
      report-schema.legacy.md
      generate_report_html.legacy.py
    workflow/
      00-data-inventory.md
      01-scope-checkpoint.md
      02-sampling-strategy.md
      03-object-related-filter.md
      04-needscope-semantic-coding.md
      05-quality-gates.md
      06-positioning-and-scoring.md
      07-report-generation.md
    domain/
      needscope-six-archetypes.md
      analysis-object-types.md
      platform-contexts.md
      signal-owner-rules.md
      confidence-framework.md
      tim-case-lessons.md
    contracts/
      00_data_inventory.schema.json
      01_scope_decision.schema.json
      02_sampling_plan.schema.json
      03_object_filter.schema.json
      04_archetype_coding.schema.json
      05_quality_gate.schema.json
      06_positioning.schema.json
      07_report.schema.json
    templates/
      report.md
      report.html
      review-sample-table.md
  evals/
    evals.json
```

## 实现任务

### Task 1: 归档旧 Skill 主体

- 创建 `references/archive/old-skill-v1.md`。
- 将当前 `SKILL.md` 的正文复制进去。
- 不删除现有信息，但从新活跃路径中移除过时逻辑。

验收：

- 旧内容可追溯。
- 新 `SKILL.md` 不继续保留大段旧流程。
- 关键词法不作为最终评分主路径出现。

### Task 2: 重写 SKILL.md 为路由式主文件

新 `SKILL.md` 必须包含：

- frontmatter `name` 和 `description`。
- 触发条件和 near-miss。
- 七步主流程。
- 强门禁规则：
  - Step 0 数据盘点。
  - Step 1 用户确认。
  - Step 3 对象相关性 Gate。
  - Step 5 编码质量 Gate。
- 资源路由：每一步读取哪个 reference。
- Contract 规则：上一步 contract 是下一步输入。
- 运行后迭代小节。

验收：

- `SKILL.md` 不超过执行 Agent 认为必要的精简长度。
- 不包含长篇 HTML/CSS。
- 不包含完整领域知识正文。
- 不把 Tim 案例写成默认范式。

### Task 3: 创建 workflow references

为每个 step 创建独立 reference：

- `00-data-inventory.md`
- `01-scope-checkpoint.md`
- `02-sampling-strategy.md`
- `03-object-related-filter.md`
- `04-needscope-semantic-coding.md`
- `05-quality-gates.md`
- `06-positioning-and-scoring.md`
- `07-report-generation.md`

每个 workflow reference 必须包含：

- 使用时机。
- 输入。
- 操作步骤。
- 输出文件。
- Contract 字段。
- Completion criterion。
- 常见失败。

验收：

- 每个 step 可以独立读取。
- 没有把后续步骤细节提前暴露太多。
- Gate step 写清楚失败后如何处理。

### Task 4: 创建 domain references

创建：

- `needscope-six-archetypes.md`
- `analysis-object-types.md`
- `platform-contexts.md`
- `signal-owner-rules.md`
- `confidence-framework.md`
- `tim-case-lessons.md`

关键要求：

- `needscope-six-archetypes.md` 说明六原型定义、正负向表达和边界。
- `analysis-object-types.md` 区分 brand、product、product_line、founder、public_person、content_ip、campaign、platform_community。
- `platform-contexts.md` 区分粉丝场、公众讨论场、官方表达场、达人种草场、搜索行为、真实消费评论。
- `signal-owner-rules.md` 说明 `brand/product/product_line/founder/content/community/platform/campaign` 的归因规则。
- `tim-case-lessons.md` 只写防错教训，不写成通用报告模板。

验收：

- Tim 经验变成 guardrail，不是默认 workflow。
- 普通品牌分析不会自动进入人物/IP解释框架。
- 平台文化和社区资产不会直接并入品牌人格。

### Task 5: 创建 contract schemas

创建 8 个 schema-like JSON 文件：

- `00_data_inventory.schema.json`
- `01_scope_decision.schema.json`
- `02_sampling_plan.schema.json`
- `03_object_filter.schema.json`
- `04_archetype_coding.schema.json`
- `05_quality_gate.schema.json`
- `06_positioning.schema.json`
- `07_report.schema.json`

验收：

- 每个 schema 至少有必需字段、字段含义和允许值。
- Step N 的 schema 能支撑 Step N+1 开始前检查前置条件。
- `04_archetype_coding` 必须包含 `signal_owner` 和 `signal_role`。
- `06_positioning` 必须包含 `primary_archetype`，不能只有 scores。

### Task 6: 更新报告模板

创建：

- `references/templates/report.md`
- `references/templates/report.html`
- `references/templates/review-sample-table.md`

报告模板主结构：

1. 数据语境与置信度
2. 分析对象类型
3. NeedScope 主落点
4. 次落点与张力
5. 品类/竞品地图，若数据支持
6. 品牌表达 vs 消费者感知错位
7. 产品线人格分工，若数据支持
8. 策略建议
9. 数据缺口与下一步补数

验收：

- 第一结论不是最高分原型，而是 NeedScope 主落点。
- 低分、无信号、负向缺口、平台噪声被区分。
- 不建议补齐六边形。
- HTML 不强制所有项目都有同一套模块。

### Task 7: 调整现有 HTML 生成路径或标注兼容边界

旧 `scripts/generate_report_html.py` 和 `references/report-schema.md` 已归档至 `references/archive/`，不得作为新报告结构来源。执行 Agent 需要二选一：

1. 新建 v3 HTML 生成脚本，使其支持主落点、`signal_owner`、`asset_eligibility`、张力、平台断裂。
2. 不使用脚本，直接按 `references/templates/report.html` 生成报告，并由 contract/validator 检查。

验收：

- 不允许旧 HTML schema 反向绑架新报告。
- 如重新启用脚本，必须写入 `scripts/` 并列入 active route。

### Task 8: 创建 evals

使用 `evals/evals.json` 中的测试 prompt。

执行 Agent 可以补充，但不得删除以下类型：

- 普通品牌。
- 多平台粉丝场 vs 公众场。
- 人物/IP。
- 平台玩梗。
- 负向缺失表达。
- 大数据抽样。

验收：

- 每个 eval 有 expected behavior 和 assertions。
- eval 能检查 workflow，而不只是检查最终文风。

### Task 9: 验证与失败模式扫描

执行 Agent 必须完成：

- frontmatter 检查。
- 文件树检查。
- reference 路由检查。
- contract 覆盖检查。
- eval 静态检查。
- 五种失败模式扫描。

必须输出：

```text
Failure Mode Scan
- Premature Completion:
- Duplication:
- Sediment:
- Sprawl:
- No-op:
```

验收：

- 发现风险时优先修复。
- 暂不修复的风险必须写入最终说明。

## 质量验收 Checklist

### 结构

- [ ] `SKILL.md` 是路由式主文件。
- [ ] 旧 Skill 已归档。
- [ ] workflow/domain/contracts/templates/evals 分层清楚。
- [ ] 每个 reference 都有读取时机。
- [ ] 没有无路由资源。

### 行为

- [ ] 默认先做数据盘点和对象类型判定。
- [ ] 有强门禁。
- [ ] 不默认全量逐句 LLM 编码。
- [ ] 大数据会先抽样、去重、分桶或聚类。
- [ ] 关键词法被降级为预检/辅助。
- [ ] 每条原型信号有 `signal_owner`。
- [ ] 允许无信号。
- [ ] NeedScope 输出是人格落点，不是六项能力表。

### 报告

- [ ] 第一结论是主落点。
- [ ] 分数只是证据。
- [ ] 不建议补齐六边形。
- [ ] 区分低分、无信号、负向缺口、平台噪声。
- [ ] 人物/IP 案例有边界提醒。
- [ ] 普通品牌分析不会被 Tim 带偏。

### Gate

- [ ] Step 1 有用户确认。
- [ ] Step 3 有对象相关性 Gate。
- [ ] Step 5 有编码质量 Gate。
- [ ] Gate 失败会停止或局部重跑。
- [ ] 用户反馈会写入 contract，而不是只留在对话。

## 残余风险

执行 Agent 完成第一版后，以下内容可以暂缓，但必须说明：

- 自动聚类/主动学习脚本是否未实现。
- HTML 脚本是否仍为 legacy。
- eval 是否只是静态检查，尚未做真实 forward testing。
- 是否缺少真实非 Tim 品牌数据验证。

## 最终回复要求

执行 Agent 完成后向用户汇报：

- 目标 Skill 路径。
- 创建或修改了哪些文件。
- 关键设计选择。
- 已完成的验证。
- 五种失败模式扫描结果。
- 已知限制或下一步改进候选。
