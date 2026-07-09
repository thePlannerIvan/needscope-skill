# Needscope Skill v3 Upgrade Execution Plan

## Upgrade Goal

v2 already introduced a contract-based workflow, but the Adidas/Nike eval showed that the controls were not strong enough in high-context social data. v3 must prevent one failure above all others:

> Platform, community, campaign, celebrity, and fan-context signals must not be promoted into brand NeedScope personality.

This is a workflow upgrade, not a wording polish. The implementation should strengthen contracts, gates, validators, and report structure.

## v3.1 Evidence Relaxation

The v3 gate was intentionally strict, but real brand datasets can become too narrow if only `primary_eligible` evidence is allowed to shape the final positioning. v3.1 keeps strict core evidence while adding a second evidence layer:

- `primary_evidence_items`: strict core evidence, used first.
- `supporting_evidence_items`: brand/product/product_line evidence with `asset_eligibility=secondary_only`, used at lower weight to avoid underusing valid brand/product comments with light context markers.

Community, platform, pure fan, founder, celebrity, category, competitor, and pure campaign signals still cannot determine brand primary positioning.

## Why v2 Failed In The Eval

1. The root `work/` folder contained run artifacts with contract names that did not match the Skill contract chain.
2. Step 5 used mostly random review, so high-like and high-risk context errors escaped.
3. Step 4 had `signal_owner`, but did not have a hard `asset_eligibility` field.
4. Step 6 still allowed score-style thinking to dominate the final positioning.
5. Step 7 reports still put six-archetype bars too early, making the output feel like a score dashboard.
6. The stale `data_analysis.log` preserved the old keyword-scoring behavior and misled review.

## Target Control Level

| Step | v3 Control | Reason |
|---|---|---|
| Step 0 Data Inventory | L2 + L5 | Context risk must become a contract field. |
| Step 1 Scope Checkpoint | Human checkpoint + L2 | User must accept analysis object and context risk. |
| Step 2 Sampling | L3 + L5 | Sampling must include high-risk and high-like strata. |
| Step 3 Object Filter | L5 | Object relation must separate owned, campaign, community, platform, category, and non-related. |
| Step 4 Semantic Coding | L5 | Each coded item must declare whether it can support brand positioning. |
| Step 5 Quality Gate | L5 + human checkpoint | Random samples are insufficient; targeted review is mandatory. |
| Step 6 Positioning | L5 | Primary archetype can only use eligible owned signals. |
| Step 7 Report | L5 | Report contract must prove that bars are not the first/main visual. |

## Implementation Tasks

### Task 1: Normalize Contract Names

Use exactly these active contract files:

- `work/contracts/00_data_inventory.json`
- `work/contracts/01_scope_decision.json`
- `work/contracts/02_sampling_plan.json`
- `work/contracts/03_object_filter.json`
- `work/contracts/04_archetype_coding.json`
- `work/contracts/05_quality_gate.json`
- `work/contracts/06_positioning.json`
- `work/contracts/07_report.json`

Disallow these aliases in formal runs:

- `04_semantic_coding.json`
- `06_scoring_positioning.json`
- `07_report_generation.json`

Acceptance:

- `SKILL.md`, workflow refs, schemas, and evals use one naming system.
- If alias files exist, the run must be treated as incomplete or legacy.

### Task 2: Add Context Risk To Step 0

Update `references/contracts/00_data_inventory.schema.json` and `references/workflow/00-data-inventory.md`.

Add required fields:

- `context_risk_flags`
- `context_risk_level`
- `max_confidence_ceiling`
- `analysis_object_boundary`

Recommended `context_risk_flags` values:

- `celebrity_or_ambassador`
- `fan_community`
- `platform_activity`
- `event_or_tournament`
- `campaign_mechanic`
- `meme_or_comment_culture`
- `category_discussion_dominant`
- `competitor_hijack`

Acceptance:

- Social data can no longer be described as high quality only because it is "consumer comments".
- High-risk contexts reduce confidence ceiling unless owned brand evidence is strong.

### Task 3: Upgrade Step 2 Sampling

Update `references/workflow/02-sampling-strategy.md` and `02_sampling_plan.schema.json`.

Sampling must include:

- `random_sample`
- `high_like_sample`
- `context_risk_sample`
- `primary_candidate_sample`

The high-risk sample must include texts containing or semantically matching:

- `doge`
- `哈哈`
- `笑`
- `偷笑`
- `笑哭`
- `评论区`
- `弹幕`
- `粉丝`
- celebrity names
- campaign mechanics
- platform badges or activities

Acceptance:

- A formal run cannot claim quality review if it only used random samples.

### Task 4: Split Object Relation In Step 3

Update `references/workflow/03-object-related-filter.md` and `03_object_filter.schema.json`.

Replace loose related/non-related thinking with:

- `brand_owned_related`
- `product_related`
- `product_line_related`
- `campaign_related`
- `founder_or_celebrity_related`
- `content_related`
- `community_context`
- `platform_context`
- `category_context`
- `competitor_context`
- `non_related`

Acceptance:

- `campaign_related`, `community_context`, and `platform_context` can be analyzed but cannot enter brand primary positioning by default.
- Gate samples must include both included and excluded borderline examples.

### Task 5: Add `asset_eligibility` To Step 4

Update `references/contracts/04_archetype_coding.schema.json`, `references/workflow/04-needscope-semantic-coding.md`, and `references/domain/signal-owner-rules.md`.

Each coded item must include:

- `asset_eligibility`
- `eligibility_reason`

Allowed values:

- `primary_eligible`
- `secondary_only`
- `context_only`
- `exclude_from_positioning`

Default rules:

- `brand/product/product_line` can be `primary_eligible` only when the text evaluates the brand/product itself.
- `campaign` defaults to `context_only`; it can become `secondary_only` only with explicit transfer rationale.
- `founder_or_celebrity` defaults to `context_only`.
- `community/platform/category/competitor` must be `exclude_from_positioning` or `context_only`.
- Meme markers alone cannot create `primary_eligible` joy.

Acceptance:

- A high-like comment cannot support brand personality unless it is `primary_eligible`.
- `signal_role=contextual_noise` must not be `primary_eligible`.

### Task 6: Redesign Step 5 Quality Gate

Update `references/workflow/05-quality-gates.md`, `05_quality_gate.schema.json`, and `references/templates/review-sample-table.md`.

Gate review must include:

- `random_review`
- `high_like_review`
- `context_risk_review`
- `primary_evidence_review`

Critical fail conditions:

- Any primary evidence item is clearly campaign/community/platform/fan context.
- Any meme-only joy item enters primary evidence.
- Three or more same-pattern `signal_owner` errors.
- Three or more same-pattern `asset_eligibility` errors.
- High-like context samples are reviewed only as random samples.

Acceptance:

- Adidas example `"我亲手盖上的[doge]"` cannot pass as `brand / high / supporting_asset`.
- Nike example `"李宇春7.4广州场演唱会大屏能看到C罗吗？"` cannot pass as `brand / high / core_identity`.

### Task 7: Harden Step 6 Positioning

Update `06_positioning.schema.json` and `references/workflow/06-positioning-and-scoring.md`.

Primary positioning input must be:

```text
signal_owner in brand/product/product_line
AND asset_eligibility = primary_eligible
AND signal_role != contextual_noise
```

Required output fields:

- `primary_evidence_items`
- `excluded_high_influence_items`
- `owned_signal_summary`
- `context_signal_summary`
- `insufficient_owned_signal_reason`

Acceptance:

- If eligible owned evidence is thin, `primary_archetype` must be `未判定`.
- Campaign or community joy can be reported, but not as brand personality.

### Task 8: Rebuild Step 7 Report Structure

Update `references/workflow/07-report-generation.md`, `07_report.schema.json`, `templates/report.md`, and `templates/report.html`.

First screen / opening section order:

1. Whether brand personality can be judged from this data.
2. Primary archetype or `未判定`.
3. Owned signals vs context signals.
4. Confidence ceiling and data limitations.
5. Only then, evidence detail.

Six-archetype bars:

- Appendix only.
- Must be segmented by owned/context.
- Must not be the first or main visual.

Acceptance:

- The report does not read like a six-score dashboard.
- Contextual noise uses muted styling, not asset-card styling.

### Task 9: Add A Deterministic Validator

Create `scripts/validate_contract_chain.mjs` or an equivalent deterministic checker.

It should check:

- Required contract files exist with exact names.
- No alias contract names are used for a formal report.
- Step 4 coded items include `asset_eligibility`.
- Step 5 contains all four review groups.
- Step 6 primary evidence only uses eligible owned signals.
- Step 7 declares that six-archetype bars are appendix-only.

Acceptance:

- Validator can be run before report generation.
- Validator failure blocks `report.md` and `report.html`.

### Task 10: Add Adidas/Nike Regression Evals

Update `evals/evals.json`.

Required assertions:

- Adidas/Nike high-context run must not use the stale keyword `data_analysis.log` as formal evidence.
- `doge/哈哈/偷笑/评论区` cannot directly create brand joy.
- Li Xian / Li Yuchun / C Ronaldo fan or campaign interaction must be `campaign`, `fan_community`, or `context_only` unless the text evaluates the brand/product itself.
- Primary archetype evidence must cite `asset_eligibility=primary_eligible`.
- HTML first screen must show owned vs context split before any six-archetype chart.

Acceptance:

- The eval catches the exact two observed failures:
  - `"我亲手盖上的[doge]"`
  - `"李宇春7.4广州场演唱会大屏能看到C罗吗？"`

## Folder Hygiene Rules

Active Skill root should contain only:

- `SKILL.md`
- `planning/`
- `references/`
- `evals/`
- `scripts/` only if active validators or transforms exist

Generated run artifacts must go under:

- `evals/<case-name>/work_snapshot_<date>/`

Legacy resources must go under:

- `references/archive/`

Do not keep a root-level `work/` folder in the Skill package.

## Final Acceptance Checklist

- [ ] Contract names are exact and consistent.
- [ ] `asset_eligibility` exists and is required.
- [ ] Step 5 has four review groups.
- [ ] Step 6 primary evidence is eligible owned evidence only.
- [ ] Step 7 first screen is NeedScope positioning, not score bars.
- [ ] Validator blocks incomplete or legacy contract chains.
- [ ] Adidas/Nike regression eval is added.
- [ ] Root-level `work/` does not exist.
- [ ] Legacy schema/script are archived.
