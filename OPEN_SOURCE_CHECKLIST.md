# Open Source Release Checklist

## Package Files

- [x] `README.md`
- [x] `LICENSE`
- [x] `NOTICE`
- [x] `TRADEMARK.md`
- [x] `COMMERCIAL.md`
- [x] `SECURITY.md`
- [x] `.gitignore`

## Skill Files

- [x] `SKILL.md` has valid frontmatter.
- [x] `SKILL.md` includes provenance / source identification.
- [x] Active workflow files live under `references/workflow/`.
- [x] Domain rules live under `references/domain/`.
- [x] Contract schemas live under `references/contracts/`.
- [x] Active validator lives under `scripts/`.

## Data Hygiene

- [x] Root-level `work/` is ignored.
- [x] CSV/XLSX/TSV files are ignored.
- [x] Logs are ignored.
- [x] Legacy report schema and old HTML script are archived.

## Before Publishing

1. Replace the GitHub repo URL in `README.md` if the final repository is not `thePlannerIvan/needscope-skill`.
2. Run:

```bash
find . -path "*/__pycache__/*" -type f -print
find . -name "*.pyc" -print
rg -n "TODO|YOUR_GITHUB|password|token|secret|PRIVATE" .
```

3. Run contract schema syntax check:

```bash
find references/contracts -name "*.json" -print0 | xargs -0 -n1 jq empty
```
