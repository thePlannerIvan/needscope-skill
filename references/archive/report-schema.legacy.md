# NeedScope Report JSON Schema

用于 `scripts/generate_report_html.py` 的输入数据结构。

## 顶层字段

```json
{
  "brand_name": "品牌名 + NeedScope 品牌原型分析",
  "analysis_date": "2026-05-30",
  "layers_ran": ["竞品原型地图", "品牌优势诊断", "产品线原型分级"],
  "overall_confidence": "decision | directional | exploratory",

  "archetype_scores": {},
  "brands_map": [],
  "competitors": [],
  "product_lines": [],
  "low_confidence_items": [],
  "consumer_quotes": [],
  "whitespace": {},
  "recommendations": []
}
```

## archetype_scores

两种格式都支持：

**简单格式**（向后兼容）：
```json
{"突破型": 82, "身份型": 10}
```

**详细格式**（推荐，带置信度）：
```json
{
  "突破型": {"score": 22, "confidence": "medium", "data_points": "标题10次+评论20次"},
  "呵护型": {"score": 82, "confidence": "high", "data_points": "评论134次——压倒性"}
}
```
confidence 取值: `"high"` | `"medium"` | `"low"` | `"none"`

## brands_map

品类 NeedScope 地图上的品牌位置：
```json
[
  {"name": "美津浓", "x": -30, "y": -55, "color": "#b8977e", "confidence": "high"},
  {"name": "亚瑟士", "x": 40, "y": -20, "color": "#6e8fb8", "confidence": "medium"}
]
```
- x: -100(极左/融合) 到 +100(极右/独立)
- y: -100(极下/内敛) 到 +100(极上/外向)
- color: 品牌对应的主原型颜色
- confidence: `"high"` | `"medium"` | `"low"`

## competitors

```json
[
  {
    "name": "亚瑟士",
    "primary_archetype": "掌控型",
    "confidence": "high",
    "data_info": "下游50个具体型号查询+达人标签",
    "one_liner": "消费者买的是专业跑步权威认证"
  }
]
```

## product_lines

```json
[
  {
    "name": "Racer S",
    "primary": "愉悦型",
    "secondary": "归属型",
    "confidence": "high",
    "data_info": "评论120+条",
    "quote": "真的超级喜欢，每一双都爱"
  },
  {
    "name": "VELOX",
    "primary": "归属型",
    "secondary": "呵护型",
    "confidence": "low",
    "data_info": "评论仅2条",
    "quote": ""
  }
]
```
低置信度产品线的 quote 留空，HTML 渲染为"数据不足，无法引用"。

## low_confidence_items

字符串数组，汇总所有低置信度条目：
```json
["PI PLUS II（评论仅3条）——原型判定为推测", "身份型整体得分（仅3条评论提及档次）"]
```

## consumer_quotes

```json
[
  {"text": "它那么温柔包容我还给我支撑", "source": "小红书评论", "archetype": "呵护型 🟢"}
]
```

## whitespace

```json
{
  "headline": "呵护型 × 愉悦型 = 「温柔的日系运动美学」",
  "detail": "运动鞋品类无人占据这个复合位置...",
  "confidence": "high"
}
```

## recommendations

```json
[
  {
    "label": "坚守：舒服的绝对统治力",
    "detail": "所有战略扩张都应锚定在「舒服」这个核心...",
    "confidence": "high"
  }
]
```
confidence 取值: `"high"` | `"medium"` | `"low"`。影响 HTML 中建议卡片的背景色。
