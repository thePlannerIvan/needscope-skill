# NeedScope Skill

NeedScope brand archetype analysis for Codex/Claude-style agent workflows.

By **阿祖不看 TVC**  
Xiaohongshu: 阿祖不看 TVC  
Website: https://demyth.info  
Email: Lawyif@163.com

Languages: [English](#what-it-does) | [中文](#中文说明)

## What It Does

This Skill helps an agent analyze consumer text data and infer where a brand sits in a NeedScope-style emotional archetype map. It is designed for messy social data, especially cases where platform culture, campaigns, celebrities, fandom, category chatter, or comment memes can pollute brand personality diagnosis.

The core principle:

> A hot context signal is not automatically a brand personality signal.

## Core Workflow

1. Data inventory and context-risk assessment.
2. Scope checkpoint with user confirmation.
3. Sampling strategy with random, high-like, context-risk, and primary-candidate samples.
4. Object-relevance filtering.
5. NeedScope semantic coding with `signal_owner` and `asset_eligibility`.
6. Quality gate with targeted review groups.
7. Positioning with v3.2 two-tier owned evidence and shadow-analysis guardrails.
8. Markdown and HTML report generation.

## v3.2 Evidence Model

The Skill uses two tiers of owned evidence:

- `primary_evidence_items`: strict core evidence. Must satisfy `signal_owner in brand/product/product_line`, `asset_eligibility=primary_eligible`, and `signal_role!=contextual_noise`.
- `supporting_evidence_items`: lower-weight supporting evidence. Must satisfy `signal_owner in brand/product/product_line`, `asset_eligibility=secondary_only`, and `signal_role!=contextual_noise`.

Community, platform, pure fan, founder/celebrity, content, category, competitor, and pure campaign signals may be analyzed, but they do not directly determine the brand primary archetype.

Founder and content-IP signals can be shown as `shadow_analysis` when relevant. They explain personality risk, content experience, or platform splits, but they must not enter `primary_evidence_items` or `supporting_evidence_items`.

## Suitable For

- Xiaohongshu, Weibo, Reddit, TikTok-style comments or notes.
- Competitive brand perception analysis.
- Brand personality and emotional positioning diagnosis.
- Separating brand-owned signals from campaign/community/platform noise.

## Not For

- Plain word frequency or sentiment-only analysis.
- ROI, media buying, influencer matrix, or sales attribution.
- Generating brand copy without evidence-based diagnosis.

## Installation

```bash
npx skills add https://github.com/thePlannerIvan/needscope-skill --skill needscope
```

Or clone manually:

```bash
git clone https://github.com/thePlannerIvan/needscope-skill.git ~/.codex/skills/needscope
```

## Typical Prompts

```text
帮我用 NeedScope 分析这批小红书评论，看品牌落在哪个人格原型上。
```

```text
比较 Adidas 和 Nike 在世界杯语境下的 NeedScope 情感占位，注意不要把平台玩梗算成品牌人格。
```

```text
这批评论里有很多代言人粉丝和活动互动，请区分品牌自有信号和语境信号。
```

## Directory Structure

```text
SKILL.md
references/
  workflow/
  domain/
  contracts/
  templates/
  archive/
scripts/
  validate_contract_chain.mjs
evals/
```

## Validation

Run the deterministic contract validator against a work directory:

```bash
node scripts/validate_contract_chain.mjs path/to/work/contracts
```

The validator checks contract names, required v3.2 fields, illegal owner-eligibility combinations, `asset_eligibility`, review groups, positioning evidence constraints, evidence count consistency, and report structure.
The validator checks contract file names, alias contract names, owner-eligibility combinations, review groups, primary/supporting evidence constraints, and report structure. The field reference lives in `references/contracts/contract-definitions.md`.

## Attribution Boundary

Attribution may appear in repository documents, process HTML pages, review pages, validation pages, and developer workflow surfaces. The Skill should not add project branding to final client deliverables by default unless the user explicitly requests it.

## License

Code and documentation are released under the GNU Affero General Public License v3.0. See [LICENSE](LICENSE).

For private deployment, closed-source extensions, enterprise customization, training, or commercial licensing, see [COMMERCIAL.md](COMMERCIAL.md).

---

# 中文说明

NeedScope Skill 是一个面向 Codex / Claude 风格 Agent 工作流的品牌原型分析 Skill。它帮助 Agent 从消费者评论、社媒讨论、笔记标题、竞品数据等文本中，判断品牌在公众认知中的情感人格落点。

作者：**阿祖不看 TVC**  
小红书：阿祖不看 TVC  
网站：https://demyth.info  
邮箱：Lawyif@163.com

## 它解决什么问题

普通的社媒分析很容易把“评论区很热闹”“粉丝很兴奋”“活动很会玩”误判成品牌人格。这个 Skill 的核心目标，是把品牌自有信号和语境信号分开：

> 热门语境信号，不等于品牌人格资产。

它尤其适合处理高噪声社媒数据，例如：

- 平台玩梗很多。
- 代言人和粉丝讨论很多。
- 活动、联名、campaign 语境很强。
- 赛事、热点、品类讨论混在品牌评论里。
- 品牌和产品、创始人、内容 IP、社区氛围容易混淆。

## 核心工作流

1. 数据盘点与上下文风险判断。
2. 分析范围确认。
3. 抽样策略设计，覆盖随机样本、高互动样本、上下文风险样本和主落点候选样本。
4. 对象相关性过滤，先判断文本到底在评价品牌、产品、活动、社区、平台还是品类。
5. NeedScope 语义编码，逐条标注 `signal_owner` 和 `asset_eligibility`。
6. 编码质量门禁，重点复核高赞、高风险、主证据和辅助证据。
7. 用 v3.2 双层品牌自有证据模型和旁路画像门禁判断品牌人格落点。
8. 输出 Markdown 报告和 HTML 预览。

## v3.2 双层证据模型

这个 Skill 不再只看最严格的一层证据，而是分成两层：

- `primary_evidence_items`：核心证据。必须满足 `signal_owner in brand/product/product_line`、`asset_eligibility=primary_eligible`、`signal_role!=contextual_noise`。
- `supporting_evidence_items`：辅助证据。必须满足 `signal_owner in brand/product/product_line`、`asset_eligibility=secondary_only`、`signal_role!=contextual_noise`，并且需要降权解释。

这样既不会因为门禁太严导致最后只剩很少数据，也不会放任平台、社区、粉丝、纯活动语境污染品牌人格判断。

以下信号可以被分析，但不能直接决定品牌主落点：

- 社区氛围。
- 平台文化。
- 纯粉丝表达。
- 创始人或名人个人评价。
- 品类/赛事讨论。
- 竞品讨论。
- 纯 campaign slogan 或活动机制互动。
- 内容体验或单期作品反馈。

创始人和内容 IP 信号可以作为 `shadow_analysis` 单独呈现，用来解释人物风险、内容体验或平台分裂，但不能进入 `primary_evidence_items` 或 `supporting_evidence_items`。

## 适合使用

- 小红书、微博、Reddit、TikTok 等平台评论分析。
- 品牌人格和情感定位诊断。
- 竞品品牌心智对比。
- 区分品牌自有信号与 campaign / community / platform 噪声。
- 判断品牌在 NeedScope 地图上的情感占位。

## 不适合使用

- 只做词频统计。
- 只做正负情绪分析。
- 只做 ROI、投放效果、达人矩阵或销售归因。
- 没有数据依据地直接生成品牌文案。

## 安装

```bash
npx skills add https://github.com/thePlannerIvan/needscope-skill --skill needscope
```

也可以手动克隆：

```bash
git clone https://github.com/thePlannerIvan/needscope-skill.git ~/.codex/skills/needscope
```

如果最终 GitHub 仓库名不是 `thePlannerIvan/needscope-skill`，请在发布前替换上面的地址。

## 典型 Prompt

```text
帮我用 NeedScope 分析这批小红书评论，看品牌落在哪个人格原型上。
```

```text
比较 Adidas 和 Nike 在世界杯语境下的 NeedScope 情感占位，注意不要把平台玩梗算成品牌人格。
```

```text
这批评论里有很多代言人粉丝和活动互动，请区分品牌自有信号和语境信号。
```

## 目录结构

```text
SKILL.md
references/
  workflow/
  domain/
  contracts/
  templates/
  archive/
scripts/
  validate_contract_chain.mjs
evals/
```

## 验证方式

对某次运行的 `work/contracts` 目录执行：

```bash
node scripts/validate_contract_chain.mjs path/to/work/contracts
```

validator 会检查：

- contract 文件名是否正确。
- 是否出现禁用的 legacy alias contract 名。
- 是否存在非法 owner-eligibility 组合。
- 五组质量复核是否齐全。
- 主证据和辅助证据是否符合约束。
- 报告结构是否把六原型条形图放在附录或非首屏位置。
- 字段定义详见 `references/contracts/contract-definitions.md`。

## 开源协议与商业合作

代码和文档使用 GNU Affero General Public License v3.0。详见 [LICENSE](LICENSE)。

私有部署、企业工作流适配、闭源扩展、培训或商业授权，请查看 [COMMERCIAL.md](COMMERCIAL.md)。

## 署名边界

作者和项目来源信息可以出现在仓库文档、过程 HTML、审阅页面、验证页面和开发工作流界面中。默认不应写入最终客户交付物，除非用户明确要求。
