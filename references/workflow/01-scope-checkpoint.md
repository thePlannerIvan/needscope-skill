# Step 1: 分析范围与路径确认

## 使用时机

完成 Step 0 数据盘点后，向用户展示摘要并请求确认。

## 输入

- `work/contracts/00_data_inventory.json`

## 操作步骤

1. **构造数据盘点摘要**（不超过 5 行）
   - 识别到哪些数据源 + 各多少条
   - 分析对象类型
   - 可跑的分析层级（Layer A/B/C）
   - 整体置信度上限
   - 数据质量警告（如有）

2. **向用户展示并请求确认**
   ```
   我识别到：
   • 品牌 [X] 的消费者评论 [N] 条 + 品牌官方笔记 [M] 条
   • 竞品 [Y] 的评论 [N] 条
   • 分析对象类型：品牌
   • 数据能支持的分析层：竞品地图 + 品牌诊断
   • 最高置信度：方向级 🟡（缺少消费者端多源交叉验证）

   你想跑哪几层？(A/B/C/全跑)
   ```
   如果用户之前已明确要求（如"全跑"），可直接确认但**必须告知边界**。

3. **记录用户决策**
   - 用户选择的层级
   - 用户是否接受置信度上限
   - 其他用户约束
   - 如果对象涉及 founder / public_person / content_ip，记录用户确认的分析口径：
     - `brand_positioning`: 只判定品牌人格主落点
     - `founder_shadow`: 创始人/人物画像作为旁路，不进入品牌主证据
     - `content_ip_shadow`: 内容体验作为旁路，不进入品牌主证据
     - `mixed_with_guardrails`: 同时呈现品牌主落点与旁路画像，但品牌主证据仍只允许 brand/product/product_line

## 人机介入点

**必须**。这是用户必须参与的步骤。不要跳过用户确认直接分析。

如果用户说"你看着办"或类似模糊确认，执行 Agent 可自行选择但必须记录选择理由到 contract 的 `user_constraints` 中。

当分析对象是创始人、人物 IP、内容 IP 或"创始人即品牌"的灰区时，必须显式说明：
- 品牌主落点仍只由 `brand/product/product_line` 自有证据决定。
- `founder/content` 信号可以形成旁路画像或风险解释，但不得进入 `primary_evidence_items` / `supporting_evidence_items`。
- 如果用户明确要求"就分析 Tim 这个人"，则报告标题和 contract 必须写成人物/IP NeedScope 画像，不得伪装成品牌主落点。

## 输出文件

- `work/contracts/01_scope_decision.json`

## Contract 字段

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `layers_to_run` | array | ✅ | 用户确认要跑的层级列表，如 ["A", "B"] |
| `accepted_confidence_limit` | string | ✅ | 用户是否接受当前数据能支持的最高置信度 |
| `coding_budget_mode` | string | ✅ | conservative / balanced / exhaustive（用户是否在意 token 成本） |
| `analysis_lens` | string | ✅ | brand_positioning / founder_shadow / content_ip_shadow / mixed_with_guardrails |
| `shadow_analysis_allowed` | boolean | ✅ | 是否允许 founder/content 旁路画像 |
| `user_constraints` | string | 否 | 用户的额外约束或特殊要求 |
| `approved_to_continue` | boolean | ✅ | 用户是否同意继续分析 |

## Completion Criterion

- [ ] 用户确认要跑的层级
- [ ] 用户知道当前数据能支持的结论边界
- [ ] 如果数据量较大，用户知道编码策略（不会默认全量 LLM 标注）
- [ ] `coding_budget_mode` 已根据用户反馈设定
- [ ] 涉及 founder/content_ip 时，已确认 `analysis_lens`
- [ ] 用户知道 founder/content 只能作为旁路画像，不进入品牌主证据

## 常见失败

| 失败 | 后果 | 防范 |
|------|------|------|
| 跳过用户确认直接做全流程 | 用户跑不需要的层级浪费 | 只有在用户明确说了"全跑"时才可跳过直接确认 |
| 用户只想要品牌诊断，Agent 硬跑竞品地图 | 结论无数据支撑且用户不满 | 读取 `layers_to_run`，只需跑指定层级 |
| 未告知置信度边界 | 用户期望决策级但实际为探索级 | 必须在确认时明确展示 `max_confidence_level` |
| 未确认 founder/content-IP 分析口径 | 人物舆情被包装成品牌人格 | Step 1 必须记录 `analysis_lens`，未确认时默认 brand_positioning + shadow guardrails |
