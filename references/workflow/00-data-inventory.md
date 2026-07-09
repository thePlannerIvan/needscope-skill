# Step 0: 数据盘点与对象类型判定（v3）

## 使用时机

SKILL.md 触发后，任何分析之前。这是所有后续步骤的前提条件，**不可跳过**。

## 输入

- 用户任务描述
- 用户提供的所有数据文件路径
- 用户提及或暗示的品牌/品类/竞品背景

## 操作步骤

1. **扫描所有数据文件**
   - 列出文件名、格式、行数/记录数
   - 如为 CSV/JSON，检查字段名和前几行样本

2. **根据字段名 + 内容特征判断数据类型**
   - 见 `references/domain/analysis-object-types.md`
   - 区分：消费者评论、品牌官方号内容、达人笔记、搜索词、竞品数据等

3. **判断分析对象类型**
   - 对象是否是 brand / product / product_line / founder / public_person / content_ip / campaign / platform_community
   - 如果对象边界不清（例如数据既含品牌也含创始人发言），标注混合类型
   - **新增 v3**: 同时填写 `analysis_object_boundary`，明确对象名称、品类归属和数据覆盖范围

4. **判断平台语境**
   - 见 `references/domain/platform-contexts.md`
   - 区分：粉丝场、公众讨论场、官方表达场、达人种草场、搜索行为、真实消费评论

5. **判定可支持的分析层和最大置信度上限**
   - 根据数据源组合，判定最多能跑哪些分析层级
   - 根据数据源质量和语境，判定最大置信度等级

6. **判定上下文风险（v3 新增）**
   - 检查数据中是否存在以下风险标记：
     - `celebrity_or_ambassador` — 名人/代言人相关内容
     - `fan_community` — 粉丝社区内容
     - `platform_activity` — 平台活动/趋势
     - `event_or_tournament` — 赛事/活动相关内容
     - `campaign_mechanic` — 活动机制/互动内容
     - `meme_or_comment_culture` — 玩梗/评论区文化
     - `category_discussion_dominant` — 品类讨论主导
     - `competitor_hijack` — 竞品话题劫持
   - 综合判定 `context_risk_level`（low / medium / high）
   - 根据风险等级调整 `max_confidence_ceiling`
     - 高风险语境：即使数据量大，上限也只能到 `directional`
     - 中风险语境：需在报告中注明风险项
   - **核心原则**：社交数据不能仅因为是"消费者评论"就被描述为高质量。高语境风险降低置信度上限。

7. **记录警告**
   - 如果仅有官方内容 → 标注最高"方向级"，截断消费者感知结论
   - 如果仅有一两个数据源且量少 → 标注"数据不足"警告
   - 如果含粉丝场 → 标注不得等同大众心智
   - 如果含高风险上下文 → 标注 `max_confidence_ceiling` 已下调

## 输出文件

- `work/00_data_inventory.md`：数据盘点说明（人可读）
- `work/contracts/00_data_inventory.json`：合约（机器可读）

## Contract 字段

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `analysis_object_type` | string | ✅ | brand/product/product_line/founder/public_person/content_ip/campaign/platform_community |
| `analysis_object_boundary` | string | ✅ | **v3**: 分析对象边界说明：对象名称、品类归属、数据覆盖范围 |
| `data_sources` | array | ✅ | 每个数据源的 { path, type, record_count, fields, sample } |
| `platform_contexts` | array | ✅ | 每个数据源的平台语境标签 |
| `supported_layers` | array | ✅ | 可支持的层级列表（A/B/C） |
| `max_confidence_level` | string | ✅ | decision/directional/exploratory_usable/exploratory_thin |
| `context_risk_flags` | array | ✅ | **v3**: 上下文风险标记列表（celebrity/fan/event/campaign 等） |
| `context_risk_level` | string | ✅ | **v3**: low / medium / high |
| `max_confidence_ceiling` | string | ✅ | **v3**: 基于 context_risk 调整后的最高置信度上限 |
| `warnings` | array | 否 | 数据质量相关警告 |
| `human_decision_required` | boolean | ✅ | 是否存在需要用户确认的边界争议 |

## Completion Criterion

- [ ] 已明确分析对象是哪种或哪几种类型
- [ ] 已填写 `analysis_object_boundary` 说明对象边界
- [ ] 已说明每类数据回答的问题（消费者感受 / 品牌自我表达 / 需求信号 / 等）
- [ ] 已说明最多能支持哪些分析层级
- [ ] 已标注最高置信度上限
- [ ] 已扫描上下文风险标记（v3）
- [ ] 已根据风险等级调整 `max_confidence_ceiling`（v3）
- [ ] 数据源质量问题已在 warnings 中记录

## 常见失败

| 失败 | 后果 | 防范 |
|------|------|------|
| 把创始人/IP 当普通品牌 | 信号归因全错 | 先读 `analysis-object-types.md` 判断对象类型 |
| 把官方内容当消费者感受 | 置信度虚高 | 标注 `platform_contexts` 为'品牌官方表达' |
| 看到评论就直接进入编码 | 忽略对象类型和平台语境 | 完成此步骤所有字段后再进入 Step 1 |
| 忽略混合平台语境 | 粉丝场与公众场信号合并 | 不同平台语境分开标注，后续不合并评分 |
| **忽略上下文风险（v3）** | 高社交语境被当作品牌资产 | 识别 context_risk_flags 并下调 max_confidence_ceiling |
