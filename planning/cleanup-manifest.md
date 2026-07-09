# Cleanup Manifest

Cleanup date: 2026-07-08

## What Was Moved Out Of The Active Skill Path

| Original path | New path | Reason |
|---|---|---|
| `work/` | `evals/AdidasNike-eval/work_snapshot_20260708_v2/work/` | Run artifacts should not live in the Skill root. They belong to the eval case that produced them. |
| `references/report-schema.md` | `references/archive/report-schema.legacy.md` | Legacy schema reflected the old score/report structure and should not guide v3 reports. |
| `scripts/generate_report_html.py` | `references/archive/generate_report_html.legacy.py` | Legacy HTML helper can bias reports toward old dashboard-like structure. |
| `scripts/` | removed after empty | No active scripts remain yet. Recreate only for active validators/transforms. |

## Active Folder Shape After Cleanup

```text
NeedscopeSkill/
  SKILL.md
  planning/
  references/
    archive/
    contracts/
    domain/
    templates/
    workflow/
  evals/
```

## Follow-Up Cleanup For The Execution Agent

1. If a new validator is created, recreate `scripts/` and place only active scripts there.
2. Do not write future run artifacts into the Skill root.
3. If an eval produces temporary work files, store them under `evals/<case>/work_snapshot_<date>/`.
4. If a legacy file is consulted, explain why in the final review; otherwise keep archive files out of the active route.
