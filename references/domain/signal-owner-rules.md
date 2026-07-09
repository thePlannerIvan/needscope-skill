# Signal Owner 归因规则（v3.2 — 含 asset_eligibility 硬门禁）

## 什么是 signal_owner

每条 NeedScope 原型信号需要明确它"属于谁"。一个消费者说"这双鞋太舒服了"——这个舒适的信号归属到产品（鞋），而不是品牌。signal_owner 归因决定了最终谁获得了这个原型特质。

## 十个 signal_owner 类型

| Owner | 说明 | 典型文本 |
|-------|------|---------|
| `brand` | 品牌整体 | "这个牌子真好用"、"XX 的东西不错" |
| `product` | 产品 | "这双鞋太舒服了"、"这个精华吸收很快" |
| `product_line` | 产品线/系列 | "Racer 系列鞋底都很软"、"Pro 线用料最扎实" |
| `founder` | 创始人 | "Tim 真的很用心在做内容"、"雷军太接地气了" |
| `content` | 内容作品 | "这个视频拍得太有创意了"、"这期播客我听了三遍" |
| `community` | 社区/粉丝群 | "评论区太有才了"、"超话的粉丝都好可爱" |
| `platform` | 平台 | "B站弹幕真的很有意思"、"小红书上都在推这个" |
| `campaign` | 营销活动 | "这次联名太绝了"、"这个 campaign 很有创意" |
| `category` | 品类/赛事/泛话题 | "世界杯太燃了"、"足球文化本来就这样" |
| `competitor` | 竞品 | "Nike 这次更强"、"下次蹲耐克半价" |

## 归因核心原则

### 1. 文本直接提到了谁

最直接的归因方式：
- "这个品牌/XX品牌" → `brand`
- "这个产品/型号/名称" → `product`
- "Tim/创始人名字" → `founder`

### 2. 文本评价的对象是谁

如果文本没有明确提到名字，但从上下文可以推断评价对象：
- "太舒服了"（上下文指某款鞋）→ `product`
- "真的牛"（上下文指某品牌运营策略）→ `brand`

### 3. 严格区分"品牌"和"产品"信号

很多失误来自把产品评价当作品牌评价：
- "这双鞋缓震很好" → product（产品属性评价）
- "XX 家的鞋缓震都做得好" → brand（品牌能力评价）
- 区别：是否在讨论品牌层面的能力，还是单个 SKU 的表现

### 4. 不把社区/平台信号归为品牌

- "评论区太搞笑" → community（不是品牌愉悦的证据）
- "B站弹幕飘过 XX" → platform（不是品牌影响力的证据）
- **除非文本特别建立了品牌与这些信号的直接关联**

### 5. 创始人信号不自动等于品牌信号

- 创始人获得好评 ≠ 品牌拥有该特质
- 创始人争议 ≠ 品牌损伤
- 只有在创始人与品牌深度绑定的情况下（如 Tesla/Musk），才需要品牌 + 创始人双线分析

### 6. 内容信号和品牌信号分开

- "这个视频很有深度" → content（不是品牌掌控型的证据）
- "Tim 频道的内容很专业" → content + founder（不是品牌掌控型的证据）
- 只有在内容 IP 即品牌（如影视飓风作为商业实体）时才需要混合评估

## asset_eligibility 判定规则（v3 新增）

### 概述

`asset_eligibility` 是 Step 4 编码的必填字段，决定每条文本是否可进入品牌主定位的证据链。

### 允许值

| 值 | 含义 | 品牌主定位资格 |
|----|------|----------------|
| `primary_eligible` | 可支持品牌主定位 | ✅ 可进入 |
| `secondary_only` | 方向性辅助证据 | ⚠️ 可低权重辅助落点，不可单独决定 main |
| `context_only` | 仅用于语境说明 | ❌ 不可进入 |
| `exclude_from_positioning` | 排除在定位证据外 | ❌ 不可进入 |

### 默认规则

| signal_owner | 默认 asset_eligibility | 品牌证据资格 |
|-------------|----------------------|-----------|
| brand | primary_eligible (仅当文本直接评价品牌) | — |
| product | primary_eligible (仅当文本直接评价产品) | — |
| product_line | primary_eligible (仅当文本直接评价产品线) | — |
| campaign | context_only / exclude_from_positioning | 不可升级为品牌证据；仅可在 context 或 shadow analysis 说明 |
| founder | context_only | 不可升级为品牌证据；仅可在 founder shadow analysis 说明 |
| content | context_only | 不可升级为品牌证据；仅可在 content-IP shadow analysis 说明 |
| community | exclude_from_positioning | 特殊情况下可至 context_only |
| platform | exclude_from_positioning | 特殊情况下可至 context_only |
| category | exclude_from_positioning | — |
| competitor | exclude_from_positioning | — |

### 硬约束

- `signal_role=contextual_noise` 的文本**不得**为 `primary_eligible`。
- 单独由表情/梗标记驱动的愉悦型信号（doge/哈哈/笑/偷笑等）不得为 `primary_eligible`。
- 高互动（高赞/高回复）不改变 asset_eligibility。社区高互动文本仍为 exclude_from_positioning。
- 如果一条文本有多个 signal_owner 倾向，以最低的 asset_eligibility 为准。
- `secondary_only` 仅适用于 brand/product/product_line 的直接评价且存在轻微语境污染；纯粉丝、纯平台、纯 campaign、category、competitor 不得用 secondary_only 参与品牌落点。
- `founder/content/campaign/community/platform/category/competitor + primary_eligible/secondary_only` 是非法组合。需要呈现时，必须放入旁路画像、语境摘要、平台分裂或排除项。

## signal_role 判定

除了 signal_owner，每条信号还需要标注 `signal_role`：

| Role | 含义 | 适用场景 |
|------|------|---------|
| `core_identity` | 核心身份信号 | 该原型是对象最核心的感知，频次高、一致性强 |
| `supporting_asset` | 辅助资产信号 | 该原型有信号但不构成核心身份，起到补强作用 |
| `contextual_noise` | 语境噪声 | 判定为平台/社区/内容噪声，不应归为核心资产 |

### 判定规则

- 同一 archetype 累计信号 ≥30% 且一致性 > 70% → `core_identity`
- 有信号但密度或一致性不足，或在支持性语境中出现 → `supporting_asset`
- 信号主要来自社区/平台语境且无品牌直接关联 → `contextual_noise`

asset_eligibility 与 signal_role 的关系：
- `signal_role=core_identity` → 只有当 signal_owner 为 brand/product/product_line 时，才可能是 `primary_eligible`
- `signal_role=supporting_asset` → 只有当 signal_owner 为 brand/product/product_line 时，才可能是 `secondary_only`
- `signal_role=contextual_noise` → 必须 `exclude_from_positioning`
- founder/content/campaign 即使是 core_identity，也只能是对应旁路对象的核心身份，不能成为品牌主落点证据。

## 常见误归因场景

| 原文 | 错误归因 | 正确归因 | 原因 |
|------|---------|---------|------|
| "这双鞋缓震太绝了" | brand | product | 评价产品性能，非品牌能力 |
| "太好笑了在评论区出不去了" | brand | community | 社区氛围非品牌特质 |
| "Tim 太帅了" | brand | founder | 评价创始人是自然人的外貌 |
| "B站都是人才" | brand / founder | platform | 评价平台用户 |
| "这次联名赞爆" | brand | campaign | 评价一次性营销活动 |
| "XXX 都在推这个" | brand | community 或 platform | 平台趋势非品牌信号 |

## v3 误归因优先级

在 v3 中，asset_eligibility 的判定优先于 signal_role 的判定：

1. 先确定 signal_owner（10 类之一）
2. 再根据 signal_owner + 文本内容确定 asset_eligibility（4 类之一）
3. 最后确定 signal_role（3 类之一）

三条信息共同决定一条文本是否进入品牌主定位。v3.2 中，`primary_eligible` 是核心证据，`secondary_only` 是辅助证据，二者必须在报告和 contract 中分开，且都只允许 brand/product/product_line。

## founder / content-IP 旁路口径

当品牌与创始人或内容 IP 高度绑定时，可以做旁路画像，但不能改变品牌证据门槛：

| 旁路类型 | 可使用 owner | 输出位置 | 禁止事项 |
|---------|--------------|----------|----------|
| founder_shadow | founder | `shadow_analysis.founder`、platform_splits、tension | 不得进入 primary/supporting evidence |
| content_ip_shadow | content | `shadow_analysis.content_ip`、platform_splits、tension | 不得进入 primary/supporting evidence |
| campaign_context | campaign | context_signal_summary、excluded_high_influence_items | 不得升级为 secondary_only |

如果项目目标本来就是分析人物或内容 IP，而非品牌，Step 1 必须把分析对象改为 `public_person` 或 `content_ip`，报告标题也必须相应改变，避免把人物舆情误写成品牌人格。
