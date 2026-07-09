#!/usr/bin/env python3
"""
[LEGACY HELPER — v2 Boundary]
This script generates HTML from the old v1 report JSON schema.
It is retained as a legacy helper for backward compatibility only.

In the v2 workflow, the Agent writes report.html directly
as the primary path. This script does NOT determine report structure.

If you choose to use this script, ensure the input JSON conforms to
`references/report-schema.md` (v1 schema). For v2 reports, ignore this script
and write report.html directly using `references/templates/report.html`.

Usage: python generate_report_html.py <report.json> <output.html>
Supports confidence indicators for all data points.
"""

import json
import sys
from datetime import datetime

CONFIDENCE_LABELS = {
    "high": "🟢 高置信",
    "medium": "🟡 中置信",
    "low": "🔴 低置信",
    "none": "⚪ 无信号",
}

CONFIDENCE_CSS_CLASS = {
    "high": "conf-high",
    "medium": "conf-medium",
    "low": "conf-low",
    "none": "conf-none",
}

COLOR_MAP = {
    "突破型": "#d4786e",
    "身份型": "#9b7eb8",
    "掌控型": "#6e8fb8",
    "呵护型": "#b8977e",
    "归属型": "#d4a856",
    "愉悦型": "#c4b84e",
}

DEF_MAP = {
    "突破型": "消费者买的是「赢」",
    "身份型": "消费者买的是「我比你高一档」",
    "掌控型": "消费者买的是「最聪明的选择」",
    "呵护型": "消费者买的是「对自己好一点」",
    "归属型": "消费者买的是「不出错就好」",
    "愉悦型": "消费者买的是「当下的快乐」",
}

OVERALL_LABELS = {
    "decision": "决策级 — 数据充分，结论可直接用于策略制定",
    "directional": "方向级 — 方向明确，但部分结论建议补充数据验证",
    "exploratory_usable": "探索级（有参考价值） — 可分析品牌表达策略，但缺少消费者端验证",
    "exploratory_thin": "探索级（数据不足） — 数据基础过薄，请先补充数据后再分析",
}

OVERALL_BANNER_CLASS = {
    "decision": "overall-decision",
    "directional": "overall-directional",
    "exploratory_usable": "overall-exploratory-usable",
    "exploratory_thin": "overall-exploratory-thin",
}


def parse_archetype_value(val):
    if isinstance(val, (int, float)):
        return val, None, ""
    if isinstance(val, dict):
        return val.get("score", 0), val.get("confidence"), val.get("data_points", "")
    return 0, None, ""


def render_score_bar(label, val, color_hex):
    score, confidence, data_points = parse_archetype_value(val)
    conf_html = ""
    if confidence:
        conf_class = CONFIDENCE_CSS_CLASS.get(confidence, "")
        conf_label = CONFIDENCE_LABELS.get(confidence, confidence)
        data_str = f" ({data_points})" if data_points else ""
        conf_html = f'<span class="conf-badge {conf_class}">{conf_label}{data_str}</span>'

    bar_style = f"width:{score}%; background:{color_hex};"
    if confidence == "low":
        bar_style += " opacity:0.6;"

    return f"""
    <div class="archetype-row">
        <div class="archetype-label">
            <span class="archetype-name">{label}</span>
            <span class="archetype-def">{DEF_MAP.get(label, '')}</span>
        </div>
        <div class="archetype-bar-wrap">
            <div class="archetype-bar" style="{bar_style}"></div>
        </div>
        <span class="archetype-score">{score}</span>
        {conf_html}
    </div>"""


def render_needscope_map(brands):
    brand_dots = ""
    for b in brands:
        x = 400 + b.get("x", 0) * 2.5
        y = 300 - b.get("y", 0) * 2.5
        label_offset = 18 if b.get("y", 0) > 0 else -8
        opacity = 0.85
        conf = b.get("confidence", "high")
        if conf == "low":
            opacity = 0.45
        elif conf == "medium":
            opacity = 0.65

        brand_dots += f"""
        <circle cx="{x}" cy="{y}" r="8" fill="{b.get('color','#333')}" opacity="{opacity}"/>
        <text x="{x}" y="{y + label_offset}" text-anchor="middle" font-size="11" fill="#333" font-weight="600">{b['name']}</text>"""

    return f"""<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="#fafafa" rx="8"/>
    <text x="400" y="28" text-anchor="middle" font-size="14" fill="#999" font-weight="500">活跃 · 释放能量</text>
    <text x="400" y="585" text-anchor="middle" font-size="14" fill="#999" font-weight="500">内敛 · 保存能量</text>
    <text x="20" y="308" text-anchor="middle" font-size="14" fill="#999" font-weight="500" transform="rotate(-90,20,308)">融合 · 归属</text>
    <text x="780" y="308" text-anchor="middle" font-size="14" fill="#999" font-weight="500" transform="rotate(-90,780,308)">独立 · 差异</text>
    <line x1="400" y1="50" x2="400" y2="550" stroke="#e0e0e0" stroke-width="1.5"/>
    <line x1="50" y1="300" x2="750" y2="300" stroke="#e0e0e0" stroke-width="1.5"/>
    <circle cx="400" cy="300" r="3" fill="#ccc"/>
    <text x="600" y="150" text-anchor="middle" font-size="11" fill="#d4a0a0">突破型</text>
    <text x="650" y="440" text-anchor="middle" font-size="11" fill="#a0a0d4">掌控型</text>
    <text x="150" y="440" text-anchor="middle" font-size="11" fill="#c4a882">呵护型</text>
    <text x="150" y="150" text-anchor="middle" font-size="11" fill="#d4c8a0">愉悦型</text>
    <text x="200" y="460" text-anchor="middle" font-size="11" fill="#d4b896">归属型</text>
    <text x="650" y="200" text-anchor="middle" font-size="11" fill="#c0a0d0">身份型</text>
    {brand_dots}
    </svg>"""


def confidence_badge(conf, data_info=""):
    if not conf:
        return ""
    cls = CONFIDENCE_CSS_CLASS.get(conf, "")
    label = CONFIDENCE_LABELS.get(conf, conf)
    info = f" ({data_info})" if data_info else ""
    return f'<span class="conf-badge {cls}">{label}{info}</span>'


def generate_html(report):
    title = report.get("brand_name", "品牌 NeedScope 分析")
    date_str = report.get("analysis_date", datetime.now().strftime("%Y-%m-%d"))
    layers = report.get("layers_ran", [])
    overall = report.get("overall_confidence", "directional")
    overall_label = OVERALL_LABELS.get(overall, overall)
    overall_class = OVERALL_BANNER_CLASS.get(overall, "overall-directional")

    overall_banner = f"""<div class="overall-banner {overall_class}">
    <strong>整体置信度：{overall_label}</strong>
    </div>"""

    # Archetype Scores
    scores_html = ""
    archetypes = report.get("archetype_scores", {})
    if archetypes:
        scores_html = '<div class="section"><h2>六原型得分</h2>'
        for name in ["突破型", "身份型", "掌控型", "呵护型", "归属型", "愉悦型"]:
            if name in archetypes:
                scores_html += render_score_bar(name, archetypes[name], COLOR_MAP.get(name, "#888"))
        scores_html += "</div>"

    # Map
    map_html = ""
    if report.get("brands_map"):
        map_html = f"""<div class="section"><h2>品类 NeedScope 地图</h2>
        <p class="section-note">圈越淡 = 置信度越低</p>
        <div class="map-container">{render_needscope_map(report["brands_map"])}</div>
        </div>"""

    # Competitors
    competitive_html = ""
    if report.get("competitors"):
        competitive_html = '<div class="section"><h2>竞品原型占位</h2><table><thead><tr><th>品牌</th><th>主原型</th><th>置信度</th><th>一句话判定</th></tr></thead><tbody>'
        for c in report["competitors"]:
            conf = c.get("confidence", "")
            data_info = c.get("data_info", "")
            competitive_html += f"""<tr>
                <td class="prod-name">{c.get('name','')}</td>
                <td>{c.get('primary_archetype','')}</td>
                <td>{confidence_badge(conf, data_info)}</td>
                <td>{c.get('one_liner','')}</td>
            </tr>"""
        competitive_html += "</tbody></table></div>"

    # Product Lines
    products_html = ""
    if report.get("product_lines"):
        products_html = '<div class="section"><h2>产品线原型分级</h2><table><thead><tr><th>产品线</th><th>主原型</th><th>次原型</th><th>数据量</th><th>置信度</th><th>代表性评论</th></tr></thead><tbody>'
        for p in report["product_lines"]:
            conf = p.get("confidence", "")
            data_info = p.get("data_info", "")
            quote = p.get("quote", "")
            quote_cell = f'<td class="quote-cell">"{quote}"</td>' if conf != "low" else '<td class="quote-cell low-conf-cell">数据不足，无法引用</td>'
            products_html += f"""<tr class="conf-row-{conf}">
                <td class="prod-name">{p.get('name','')}</td>
                <td>{p.get('primary','')}</td>
                <td>{p.get('secondary','')}</td>
                <td>{data_info}</td>
                <td>{confidence_badge(conf)}</td>
                {quote_cell}
            </tr>"""
        products_html += "</tbody></table>"

        low_conf_products = [p for p in report["product_lines"] if p.get("confidence") == "low"]
        if low_conf_products:
            names = "、".join(p.get("name", "") for p in low_conf_products)
            products_html += f"""<div class="low-conf-warning">
            <strong>⚠️ 低置信度产品线：{names}</strong><br>
            以上产品线数据量不足（评论 <5 条），原型判定为推测。建议补充数据后再做产品线策略决策。
            </div>"""
        products_html += "</div>"

    # Low confidence summary
    low_conf_summary = ""
    low_conf_items = report.get("low_confidence_items", [])
    if low_conf_items:
        items_html = "".join(f"<li>{item}</li>" for item in low_conf_items)
        low_conf_summary = f"""<div class="section low-conf-warning">
        <h2>⚠️ 低置信度条目汇总</h2>
        <p>以下结论数据基础不足，仅供参考，不宜直接用于决策：</p>
        <ul>{items_html}</ul>
        </div>"""

    # Data collection checklist (Fix 3)
    checklist_html = ""
    data_checklist = report.get("data_checklist", [])
    if data_checklist:
        items = "".join(f"<li>{item}</li>" for item in data_checklist)
        checklist_html = f"""<div class="section checklist-box">
        <h2>📋 如需决策级报告，建议收集以下数据</h2>
        <ol>{items}</ol>
        </div>"""

    # Consumer Quotes
    quotes_html = ""
    if report.get("consumer_quotes"):
        quotes_html = '<div class="section"><h2>消费者原声</h2>'
        for q in report["consumer_quotes"]:
            quotes_html += f"""<blockquote>
            <p>"{q['text']}"</p>
            <cite>— {q.get('source','消费者')} | 指向原型：{q.get('archetype','')}</cite>
            </blockquote>"""
        quotes_html += "</div>"

    # Recommendations
    recs_html = ""
    if report.get("recommendations"):
        recs_html = '<div class="section"><h2>战略建议</h2>'
        for rec in report["recommendations"]:
            conf = rec.get("confidence", "high")
            conf_emoji = {"high": "🟢", "medium": "🟡", "low": "🔴"}.get(conf, "")
            recs_html += f"""<div class="rec-item rec-{conf}">
            <span class="rec-label">{conf_emoji} {rec.get('label','')}</span>
            <p>{rec.get('detail','')}</p>
            </div>"""
        recs_html += "</div>"

    # White Space
    whitespace_html = ""
    if report.get("whitespace"):
        ws = report["whitespace"]
        conf = ws.get("confidence", "medium")
        conf_emoji = {"high": "🟢", "medium": "🟡", "low": "🔴"}.get(conf, "")
        whitespace_html = f"""<div class="section highlight-box">
        <h2>{conf_emoji} 蓝海机会</h2>
        <p class="big-idea">{ws.get('headline','')}</p>
        <p>{ws.get('detail','')}</p>
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — NeedScope</title>
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; background:#f5f5f5; color:#333; line-height:1.6; }}
.container {{ max-width: 900px; margin:40px auto; padding:0 24px; }}
.header {{ background:#fff; border-radius:12px; padding:32px 40px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }}
.header h1 {{ font-size:32px; font-weight:700; margin-bottom:4px; }}
.header .meta {{ color:#999; font-size:13px; }}
.header .layers {{ margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; }}
.header .layer-tag {{ background:#f0f0f0; padding:3px 12px; border-radius:20px; font-size:12px; color:#666; }}

/* Overall confidence banners — 4 levels */
.overall-banner {{ padding:14px 20px; border-radius:8px; margin-bottom:20px; font-size:14px; text-align:center; }}
.overall-decision {{ background:#e8f5e9; border:1px solid #a5d6a7; color:#2e7d32; }}
.overall-directional {{ background:#fff8e1; border:1px solid #ffe082; color:#e65100; }}
.overall-exploratory-usable {{ background:#fef3e1; border:1px solid #ffcc80; color:#bf6d00; }}
.overall-exploratory-thin {{ background:#fbe9e7; border:1px solid #ef9a9a; color:#c62828; }}

.section {{ background:#fff; border-radius:12px; padding:28px 40px; margin-bottom:16px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }}
.section h2 {{ font-size:18px; font-weight:600; margin-bottom:20px; color:#222; }}
.section-note {{ font-size:12px; color:#999; margin-bottom:12px; }}
.archetype-row {{ display:flex; align-items:center; margin-bottom:14px; gap:12px; flex-wrap:wrap; }}
.archetype-label {{ width:200px; flex-shrink:0; }}
.archetype-name {{ font-weight:600; font-size:14px; display:block; }}
.archetype-def {{ font-size:12px; color:#999; }}
.archetype-bar-wrap {{ flex:1; min-width:120px; height:22px; background:#f0f0f0; border-radius:4px; overflow:hidden; }}
.archetype-bar {{ height:100%; border-radius:4px; transition: width 0.6s ease; min-width:4px; }}
.archetype-score {{ width:36px; text-align:right; font-weight:600; font-size:14px; color:#555; }}

.conf-badge {{ display:inline-block; font-size:11px; padding:1px 8px; border-radius:10px; white-space:nowrap; }}
.conf-high {{ background:#e8f5e9; color:#2e7d32; }}
.conf-medium {{ background:#fff8e1; color:#e65100; }}
.conf-low {{ background:#fbe9e7; color:#c62828; }}
.conf-none {{ background:#f5f5f5; color:#999; }}

.map-container {{ text-align:center; }}
.map-container svg {{ max-width:100%; height:auto; }}
table {{ width:100%; border-collapse:collapse; font-size:14px; }}
th {{ text-align:left; padding:10px 12px; border-bottom:2px solid #e0e0e0; color:#666; font-weight:600; }}
td {{ padding:10px 12px; border-bottom:1px solid #f0f0f0; }}
.prod-name {{ font-weight:600; }}
.quote-cell {{ color:#666; font-style:italic; max-width:220px; font-size:13px; }}
.low-conf-cell {{ color:#bbb; font-style:italic; }}
.conf-row-low {{ opacity:0.55; }}
.conf-row-low:hover {{ opacity:1; }}

/* Checklist box (Fix 3) */
.checklist-box {{ background:#f0f7ff; border:1px solid #b3d4ff; border-radius:8px; }}
.checklist-box ol {{ margin:8px 0 0 20px; line-height:1.8; font-size:14px; }}

.low-conf-warning {{ background:#fff5f5; border:1px solid #ffcdd2; border-radius:8px; padding:14px 18px; margin-top:16px; font-size:13px; color:#c62828; line-height:1.7; }}
.low-conf-warning ul {{ margin:8px 0 0 20px; }}
.low-conf-warning li {{ margin-bottom:4px; }}
blockquote {{ border-left:3px solid #e0d0b0; margin:12px 0; padding:10px 16px; background:#faf8f5; border-radius:0 6px 6px 0; }}
blockquote p {{ font-size:15px; color:#555; }}
blockquote cite {{ font-size:12px; color:#aaa; display:block; margin-top:4px; }}
.rec-item {{ margin-bottom:14px; padding:12px 16px; border-radius:8px; }}
.rec-high {{ background:#f9fafb; }}
.rec-medium {{ background:#fffdf5; }}
.rec-low {{ background:#fff5f5; }}
.rec-label {{ display:inline-block; font-size:13px; font-weight:600; margin-bottom:6px; }}
.rec-item p {{ font-size:14px; color:#555; margin-top:4px; }}
.highlight-box {{ border:2px solid #e8d5a0; background:linear-gradient(135deg,#fffdf5,#fff9e6); }}
.big-idea {{ font-size:18px; font-weight:700; color:#8b6914; margin:12px 0; }}
.footer {{ text-align:center; padding:24px; color:#bbb; font-size:12px; }}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>{title}</h1>
<p class="meta">分析日期：{date_str}</p>
<div class="layers">{"".join(f'<span class="layer-tag">{l}</span>' for l in layers)}</div>
</div>
{overall_banner}
{whitespace_html}
{scores_html}
{map_html}
{competitive_html}
{products_html}
{low_conf_summary}
{checklist_html}
{quotes_html}
{recs_html}
<div class="footer">NeedScope 品牌原型分析 · 基于消费者数据自动生成 · 🟢高置信 🟡中置信 🔴低置信</div>
</div>
</body>
</html>"""
    return html


def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_report_html.py <report.json> <output.html>")
        sys.exit(1)
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        report = json.load(f)
    html = generate_html(report)
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        f.write(html)
    print(f"HTML report saved to {sys.argv[2]}")


if __name__ == "__main__":
    main()
