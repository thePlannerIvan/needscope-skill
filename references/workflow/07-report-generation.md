# Step 7: 报告生成（v3 — 新首屏顺序）

## 使用时机

Step 6 落点判定完成后。输出可交付的分析报告。

## 输入

- `work/06_needscope_positioning.md`
- `work/06_scores.json`
- 所有前置 contracts（至少 00-06）
- `references/templates/report.md`
- `references/templates/report.html`

## 前置条件

正式报告必须同时存在并通过检查：

- `work/contracts/03_object_filter.json`
- `work/contracts/04_archetype_coding.json`
- `work/contracts/05_quality_gate.json`
- `work/contracts/06_positioning.json`

如果缺少任一文件，或 Step 3/Step 5 Gate 未通过：

- 不得生成 `report.md` 或 `report.html`
- 只能输出 `pre_analysis.md`
- `pre_analysis.md` 必须列出缺失合约、已完成步骤、不能生成正式报告的原因、下一步动作

## 操作步骤

1. **加载模板**
   - 读取 `references/templates/report.md` 作为 Markdown 报告结构指南
   - 读取 `references/templates/report.html` 作为 HTML 预览结构指南

2. **填充分析结论**
   - 根据实际跑了的分析层（A/B/C）选择性填充章节
   - **不得新建报告中数据中没有支撑的章节**

3. **撰写报告结构（v3 首屏顺序）**

   **第一屏 / 开场部分顺序（v3 强制）：**

   1. **品牌人格能否被判定**：基于当前数据，能否判断品牌 NeedScope 人格？
      - 如果可以：给出主落点
      - 如果不可以（`primary_archetype=未判定`）：说明原因和数据不足
   2. **主落点或"未判定"**：品牌的核心人格落点是什么？
   3. **自有信号 vs 语境信号**：哪些信号属于品牌/产品/产品线，哪些属于语境/平台/社区
   4. **置信度上限和数据限制**：当前数据的置信度上限，以及什么数据可以提升
   5. **然后才是证据细节**：消费者原声引用、信号分布、编码统计等

   **后续章节结构（v3 不变）：**
   ```
   6. 次落点与张力
   7. 品类/竞品地图（如数据支持）
   8. 品牌表达 vs 消费者感知错位（如数据支持）
   9. 产品线人格分工（如数据支持）
   10. 策略建议
   11. 数据缺口与下一步补数
   ```

4. **六原型条形图约束（v3）**
   - **仅限附录或证据章节**，不得作为主视觉或第一视觉
   - 必须按 signal_owner（owned vs context）分段
   - 不得是报告的第一个或主要图表
   - 必须在 contract 中声明 `six_archetype_bars_location`
   - 在报告中标注："以下分数为信号密度参考值，**不是品牌能力评分**"

5. **HTML 报告直接由 Agent 编写**
   - 不要依赖 Python 脚本 (`generate_report_html.py`) 作为主路径
   - Agent 直接根据分析结论写 HTML，HTML 结构由分析结论驱动
   - 旧脚本标注为 legacy helper，不反向决定报告结构

6. **最后生成 contract**

## 报告原则

- **第一结论是品牌 NeedScope 主落点**，不是六原型分数表。
- **第一屏必须展示 owned/context 分层**：先说明哪些信号属于品牌/产品/产品线，哪些只是平台、社区、事件、内容或 campaign 语境。
- **六原型条形图不得作为主视觉**。如需展示，必须放在证据附录或信号分布章节，并按 `signal_owner` 分层。
- **分数只是证据**。报告主体是人格诊断文字，分数作为支撑放在旁边。
- **高频不等于品牌资产**。高赞原声必须标注 `signal_owner`、`asset_eligibility` 和 `signal_role`；没有 asset_eligibility=primary_eligible 的原声不得支撑品牌主落点。
- **不要建议补齐六边形**。NeedScope 不是平衡积分卡。
- **区分**低分、无信号、负向缺口、平台噪声和非战略重点。不要让用户误解。
- **每条策略建议绑定主落点、错位、张力或数据缺口**。不写没根据的建议。
- **如果整体置信度为探索级或方向级，必须包含数据补充建议章节**。
- **人物/IP/创始人案例必须说明解释边界**，普通品牌分析不被 Tim 案例带偏。
- **低置信度数据在报告中视觉淡化或显著标注**。
- **Adidas/Nike 失败模式防线**：如果报告声称某品牌愉悦型最强，但证据来自 `doge/哈哈/笑/赛事梗/评论区`，必须写为"语境/平台愉悦"，不得写为"品牌最强情感资产"。

## HTML 呈现规则

- 首屏模块顺序（v3 强制）：
  1. 品牌人格能否被判定 & 主落点（只基于 owned signals + primary_eligible）
  2. owned signals 摘要
  3. context/platform/community signals 摘要
  4. 被降权或剔除的高频噪声
  5. 置信度上限和数据限制
  6. 然后才是证据细节
- NeedScope 地图应区分实线点位（品牌自有信号）和虚线/灰色云（语境信号）。
- `contextual_noise` 使用灰色、低对比度或虚线，不得使用核心资产卡片样式。
- 消费者原声必须显示 `signal_owner`、`asset_eligibility`、`signal_role` 和是否进入主落点证据。
- 六原型条形图（如有）必须分段（owned vs context），且不得位于第一视觉位置。

## 输出文件

- `report.md`：Markdown 报告
- `report.html`：HTML 预览（单文件，inline CSS，可独立在浏览器打开）
- `work/contracts/07_report.json`：合约

## Contract 字段

字段定义见 `references/contracts/contract-definitions.md#step-7-07_report`。  
关键注意：必须声明 `six_archetype_bars_location` 和 `first_screen_order_compliant`。

## Completion Criterion

- [ ] 第一结论是品牌 NeedScope 主落点
- [ ] 已检查 03/04/05/06 contracts，缺失则只输出预分析
- [ ] **报告首屏遵循 v3 顺序**：品牌人格可判定？→ 主落点/未判定 → owned vs context → 置信度上限 → 证据细节
- [ ] 六原型分数没有作为主视觉或第一结论
- [ ] 六原型条形图在附录中 segmented_by_owner
- [ ] 高赞原声标注了 signal_owner、asset_eligibility、signal_role
- [ ] 每条策略建议绑定主落点、错位、张力或数据缺口
- [ ] 人物/IP/创始人案例有解释边界
- [ ] 普通品牌分析不被 Tim 案例带偏
- [ ] 低置信度数据已视觉淡化或显著标注
- [ ] 如置信度不足，已包含数据补充建议章节
- [ ] HTML 报告可独立打开，无需外部依赖
- [ ] contract 声明了 six_archetype_bars_location 和 first_screen_order_compliant

## 常见失败

| 失败 | 后果 | 防范 |
|------|------|------|
| 报告变成六项体检 | 用户拿到的是打分表而非人格诊断 | 以主落点为第一结论 |
| HTML 模板绑架报告结构 | 报告结构和模板对齐而非和数据对齐 | Agent 直接写 HTML，结构由分析结论决定 |
| 没有 contract 也出报告 | 旧流程绕过 v2 Gate，错误结论被包装成交付物 | 缺少 03/04/05/06 任一合约时只输出预分析 |
| 平台愉悦被视觉强化 | 读者把评论区热闹误读成品牌人格 | 首屏分层展示，contextual_noise 不用核心资产样式 |
| 忽略数据缺口 | 用户把薄数据当决策基础 | 探索级/方向级必须包含数据补充建议 |
| Tim 案例结构被用于普通品牌 | 报告不符合品牌分析需要 | 普通品牌用品牌模板，人物/IP 用特殊模板 |
| **六原型柱状图出现在主视觉位置（v3）** | 报告看起来像评分仪表盘 | 强制 appendx_only |
