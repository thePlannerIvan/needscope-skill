# Step 4: NeedScope 语义编码（v3.2 — evidence eligibility guardrails）

## 使用时机

对象相关性过滤通过后进行。对每条通过过滤的文本进行 NeedScope 原型编码。

## 输入

- `work/03_object_filter_results.json`（related 文本列表）
- `work/contracts/03_object_filter.json`
- `references/domain/needscope-six-archetypes.md`
- `references/domain/signal-owner-rules.md`

## 操作步骤

1. **分批次编码**
   - 如文本量超过 50 条，分批编码（每批 ≤ 50 条）
   - 每批完成后合并结果

2. **对每条文本编码以下字段（v3 新增 asset_eligibility）**

   | 字段 | 说明 |
   |------|------|
   | `archetypes` | 匹配的原型列表，可以为空 `[]` |
   | `sentiment` | positive（对象拥有该特质）/ negative（对象缺乏该特质） |
   | `signal_owner` | brand / product / product_line / founder / content / community / platform / campaign |
   | `signal_role` | core_identity / supporting_asset / contextual_noise |
   | `evidence` | 文本中支持编码的关键短语 |
   | `confidence` | high / medium / low |
   | **`asset_eligibility`** | **v3 新增**: primary_eligible / secondary_only / context_only / exclude_from_positioning |
   | **`eligibility_reason`** | **v3 新增**: asset_eligibility 的判断理由 |
   | `notes` | 可选：编码中的歧义说明 |

3. **asset_eligibility 判定规则**

   asset_eligibility 规则详见 `domain/signal-owner-rules.md`。核心约束：
   - `primary_eligible` / `secondary_only` 只能搭配 `signal_owner=brand/product/product_line`
   - 其他 signal_owner 默认 `context_only` 或 `exclude_from_positioning`
   - `signal_role=contextual_noise` → 不得为 primary_eligible 或 secondary_only
   - 表情/梗/平台文化驱动的愉悦型信号不得为 primary_eligible
   - 合并多条规则时取最低的 asset_eligibility

4. **编码原则**
   - `sentiment` 表示对象**拥有或缺乏该原型特质**，不表示评论情绪正负
     - "这个牌子一点都不松弛" → 归属型 negative（不表示评论情绪是负面的，而是品牌缺乏归属型特质）
   - `archetypes: []` 是合法输出。某条文本没有原型信号不应该强行分配。
   - 每条原型信号必须有明确的 `evidence`（从原文提取的关键短语）。
   - 社区、平台、内容话题、创始人信号不能直接归为品牌主原型。
   - `asset_eligibility` 是硬约束字段，每条文本必须填写。
   - 允许为 `founder/content` 编码 archetypes，但它们的 `asset_eligibility` 必须是 `context_only` 或 `exclude_from_positioning`，后续只用于 shadow analysis / tension / platform split。

5. **如果数据量大且分批编码**
   - 每批编码后检查分布一致性
   - 如果某批的分布明显偏离其他批，说明编码 prompt 漂移，需要校准

## signal_owner 归因规则

参考 `references/domain/signal-owner-rules.md`。关键原则：

| signal_owner | 典型文本特征 |
|-------------|-------------|
| brand | "这个品牌很专业"、"XX 家东西不错" |
| product | "这双鞋太舒服了" |
| product_line | "Racer 系列都很好穿" |
| founder | "Tim 真的好用心" |
| content | "这个视频太有创意了" |
| community | "评论区太好笑了" |
| platform | "B站的氛围真好" |
| campaign | "这次联名太绝了" |

## 输出文件

- `work/04_archetype_coding_results.json`：每条文本的编码结果（含 asset_eligibility 和 eligibility_reason）
- `work/contracts/04_archetype_coding.json`：合约

## Contract 字段

字段定义见 `references/contracts/contract-definitions.md#step-4-04_archetype_coding`。  
关键注意：`coded_items` 每条必须完整填写 `asset_eligibility` + `eligibility_reason`，且满足上述硬约束。

## Completion Criterion

- [ ] 每条原型信号有完整的字段（含 v3 asset_eligibility + eligibility_reason）
- [ ] `sentiment` 表示对象拥有/缺乏特质，不表示评论情绪
- [ ] `archetypes: []` 是合法输出
- [ ] 社区、平台、内容话题信号已正确归因，未直接归为品牌主原型
- [ ] `signal_role=contextual_noise` 的文本未标记为 `primary_eligible`
- [ ] `founder/content/campaign/community/platform/category/competitor` 均未标记为 `primary_eligible` 或 `secondary_only`
- [ ] 直接评价品牌/产品但带轻微语境污染的文本已标为 `secondary_only`，而不是过度排除或过度升级
- [ ] 批次数 ≥ 2 时已做分布一致性检查
- [ ] 低置信编码已记录原因

## 常见失败

| 失败 | 后果 | 防范 |
|------|------|------|
| 把"紧绷/不松弛"算成归属型 positive | 负向缺口变为正向资产 | sentiment 须为 negative（缺乏归属型特质） |
| 为了产出强行分配原型 | 信号被噪声污染 | `archetypes: []` 是合法输出 |
| B站玩梗文化算成品牌愉悦型人格 | 平台噪声被当作品牌资产 | signal_owner 标记为 community / platform |
| 同一文本的多个原型未做权重区分 | 信号密度失真 | 在 notes 中标注主次关系 |
| **meme 驱动 joy 进入 primary_eligible（v3）** | 社区热度被误判为品牌人格 | 表情/梗标记驱动的愉悦型不得为 primary_eligible |
| 过窄使用数据，只剩极少核心证据 | 报告方向过于脆弱 | 直接评价品牌/产品但带轻微语境的文本可标为 secondary_only，低权重进入辅助解释 |
| content/founder 被标成 secondary_only | 内容体验或人物舆情污染品牌主落点 | content/founder 只能 context_only；如需呈现，放入 shadow analysis |
