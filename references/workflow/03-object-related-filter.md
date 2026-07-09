# Step 3: 对象相关性过滤（v3 — 11 类对象关系）

## 使用时机

抽样完成后，NeedScope 编码之前。**先过滤，再编码**。

## 输入

- `work/contracts/02_sampling_plan.json`
- 待编码的样本数据

## 操作步骤

1. **定义编码对象**
   - 根据 `00_data_inventory.json` 的 `analysis_object_type`，明确本次编码的对象名称
   - 对象可以是品牌名、产品名、创始人名、IP 名等

2. **对每条文本判断对象关系类型（v3 — 11 类）**

   v3 将原来的 loos related/non_related 二元判断拆分为 11 类精细关系：

   ### 品牌自有相关（可进入品牌主定位）
   | 关系类型 | 含义 | 典型文本 |
   |---------|------|---------|
   | `brand_owned_related` | 直接评价品牌整体 | "这个牌子真好用"、"XX 家的东西不错" |
   | `product_related` | 评价具体产品/SKU | "这双鞋太舒服了"、"这个精华吸收很快" |
   | `product_line_related` | 评价某条产品线/系列 | "Racer 系列鞋底都很软" |

   ### 可分析但不得进入品牌证据数组
   | 关系类型 | 含义 | 典型文本 |
   |---------|------|---------|
   | `campaign_related` | 评价限时联名/活动/campaign | "这次联名太绝了" |
   | `founder_or_celebrity_related` | 评价创始人或品牌代言人 | "Tim 太帅了"、"李宇春同款" |
   | `content_related` | 评价内容/视频/作品本身 | "这个视频拍得太有创意了" |

   ### 不可进入品牌主定位
   | 关系类型 | 含义 | 典型文本 |
   |---------|------|---------|
   | `community_context` | 粉丝互动、玩梗、圈内文化 | "评论区太好笑了" |
   | `platform_context` | 平台风气、弹幕文化 | "B站弹幕都是人才" |
   | `category_context` | 泛品类/行业讨论 | "现在跑步鞋都流行厚底" |
   | `competitor_context` | 纯粹讨论竞品，未落脚到分析对象 | "XX 那个更好用" |
   | `non_related` | 完全不相关 | "今天天气真好" |

   ### 关键规则（v3）
   - `campaign_related`、`founder_or_celebrity_related`、`content_related`、`community_context`、`platform_context` 可以被分析，但**不得进入品牌主定位证据数组**。
   - `founder_or_celebrity_related` 和 `content_related` 即使与品牌深度绑定，也只能进入旁路画像、平台分裂或张力解释，不得在 Step 4 标为 `primary_eligible` / `secondary_only`。
   - Gate 样本必须同时包含进入和排除的边界案例。

3. **生成抽样检查样本**
   - 从 11 类关系中**按比例抽取 30 条以上文本**
   - 确保包含：
     - 明确的 included 案例（如 brand_owned_related、product_related）
     - 明确的 excluded 边界案例（如 campaign_related vs community_context 边界）
     - 低置信案例

4. **记录每条文本的 relation_type**
   - 每条检查文本必须标注具体的 `relation_type`
   - 误判分析按 relation_type 分类统计

## Gate 规则

- 关键误判率 =（语义明显错误且严重影响结论的判断数）/ 总检查数
- **关键误判率 < 10%**：通过
- **关键误判率 ≥ 10%**：不通过
  - 检查误判是否集中在某类文本
  - 修正过滤 prompt 或规则后，针对问题类文本局部重跑
  - 重跑后再次检查，直到通过
- Gate 样本必须同时呈现 included 和 excluded 的边界案例

## 输出文件

- `work/03_object_filter_results.json`：每条文本的过滤结果（含 11 类 relation_type）
- `work/03_object_filter_gate.md`：Gate 审核报告（含抽样检查样本表）
- `work/contracts/03_object_filter.json`：合约

## Contract 字段

| 字段 | 类型 | 必须 | 说明 |
|------|------|------|------|
| `total_checked` | integer | ✅ | 总检查文本数 |
| `object_related_count` | integer | ✅ | 通过过滤的文本数（编码输入） |
| `non_object_count` | integer | ✅ | 未通过的文本数 |
| `low_confidence_count` | integer | ✅ | 不确定的文本数 |
| `relation_type_distribution` | object | ✅ | **v3**: 11 类对象关系的详细分布 |
| `gate_result` | string | ✅ | pass / fail / partial_rerun_required |
| `gate_samples` | array | ✅ | 抽样检查样本（含 relation_type 字段） |
| `warnings` | array | 否 | 误判趋势或边界风险提示 |

## Completion Criterion

- [ ] 使用 11 类关系类型替代二元 related/non_related（v3）
- [ ] 抽样检查了 30+ 条文本，覆盖 included 和 excluded 边界案例
- [ ] 关键误判率低于 10%
- [ ] 如误判集中在某类文本，已修正并局部重跑
- [ ] campaign_related / founder_or_celebrity_related / content_related / community_context / platform_context 未进入品牌主定位证据数组
- [ ] Gate 结果为 pass 才能进入 Step 4

## 常见失败

| 失败 | 后果 | 防范 |
|------|------|------|
| 把内容评价当品牌人格 | 品牌原型信号被内容话题污染 | 严格区分"评价内容/视频" vs "评价品牌" |
| 把平台文化当品牌评价 | B站玩梗被算成品牌愉悦型 | 玩梗/社区文化类文本标 community_context |
| 把活动/联名当品牌资产 | 短期活动感知被当成长期人格 | 活动类文本标 campaign_related |
| 把泛品类讨论算成品牌评价 | 信号密度虚高 | 仅当明确提及或指代品牌才算 brand_owned_related |
| 只提了品牌名但无评价性内容 | 品牌原型信号被稀释 | "提到品牌" ≠ "评价品牌"，需带情感/判断 |
| **未区分 campaign 和 community（v3）** | 错误信号进入主定位 | 用 11 类精细关系替代 loose 分类 |
| Gate 样本只有通过案例（v3） | 边界误判未被发现 | 必须同时包含 included 和 excluded 边界案例 |
