#!/usr/bin/env node

/**
 * validate_contract_chain.mjs — 精简版
 *
 * 检查 contract 链完整性 + 关键语义约束。
 * 字段定义见 references/contracts/contract-definitions.md。
 * 自动适配品牌分析 / 人物分析。
 *
 * Usage: node scripts/validate_contract_chain.mjs [work/contracts path]
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const DIR = resolve(process.argv[2] || './work/contracts');
const CONTRACTS = ['00_data_inventory','01_scope_decision','02_sampling_plan','03_object_filter','04_archetype_coding','05_quality_gate','06_positioning','07_report'];
const ALIASES = ['04_semantic_coding','06_scoring_positioning','07_report_generation'];
const ELIGIBLE = ['primary_eligible','secondary_only','context_only','exclude_from_positioning'];
const BARS_LOCATIONS = ['appendix_only','evidence_section_not_first','not_present'];
const REVIEW_GROUPS = ['random_review','high_like_review','context_risk_review','primary_evidence_review','supporting_evidence_review'];
const PERSON_TYPES = ['founder', 'public_person', 'content_ip'];

// Default (brand analysis) owned set — overridden if person analysis detected
let OWNED = ['brand', 'product', 'product_line'];
let IS_PERSON_ANALYSIS = false;

let errors = [], warnings = [];

function fail(condition, msg) { if (!condition) errors.push(msg); }
function warn(condition, msg) { if (!condition) warnings.push(msg); }

function readJSON(name) {
  const path = resolve(DIR, `${name}.json`);
  if (!existsSync(path)) { errors.push(`MISSING: ${name}.json`); return null; }
  try { return JSON.parse(readFileSync(path, 'utf-8')); }
  catch (e) { errors.push(`PARSE ERROR: ${name}.json — ${e.message}`); return null; }
}

// Detect analysis type from Step 0 contract — affects all subsequent checks
const s0 = readJSON('00_data_inventory');
if (s0 && s0.analysis_object_type && PERSON_TYPES.includes(s0.analysis_object_type)) {
  IS_PERSON_ANALYSIS = true;
  OWNED = ['founder', 'brand', 'product', 'product_line'];
}

// CHECK 1: All required contracts exist
console.log(`\n=== Required contract files (${IS_PERSON_ANALYSIS ? 'person' : 'brand'} analysis) ===`);
for (const name of CONTRACTS) {
  const found = existsSync(resolve(DIR, `${name}.json`));
  fail(found, `${name}.json missing`);
  console.log(`  ${found ? '✓' : '✗'} ${name}.json`);
}

// CHECK 2: No alias names
console.log('\n=== Alias name check ===');
for (const a of ALIASES) {
  const found = existsSync(resolve(DIR, `${a}.json`));
  fail(!found, `Alias ${a}.json found — must use exact names`);
  console.log(`  ${found ? '✗' : '✓'} ${a}.json`);
}

// The set of owners allowed for secondary_only in person analysis
function secondaryOwned() {
  return IS_PERSON_ANALYSIS ? [...OWNED, 'content'] : OWNED;
}

// CHECK 3: Step 4 — semantic constraints
console.log('\n=== Step 4: coded_items constraints ===');
const s4 = readJSON('04_archetype_coding');
if (s4) {
  const items = s4.coded_items || [];
  let illegalPE=0, illegalSE=0, noiseEligible=0;
  const secOwned = secondaryOwned();
  for (const item of items) {
    const { signal_owner, asset_eligibility, signal_role } = item;
    if (asset_eligibility === 'primary_eligible' && !OWNED.includes(signal_owner)) illegalPE++;
    if (asset_eligibility === 'secondary_only' && !secOwned.includes(signal_owner)) illegalSE++;
    if (['primary_eligible','secondary_only'].includes(asset_eligibility) && signal_role === 'contextual_noise') noiseEligible++;
  }
  fail(illegalPE === 0, `${illegalPE} coded_items: primary_eligible with non-owned signal_owner (owned: ${OWNED})`);
  fail(illegalSE === 0, `${illegalSE} coded_items: secondary_only with non-owned signal_owner (allowed secondary: ${secOwned})`);
  fail(noiseEligible === 0, `${noiseEligible} coded_items: primary/secondary-eligible but signal_role=contextual_noise`);
  console.log(`  ✓ ${items.length} items checked (${illegalPE}PE, ${illegalSE}SE, ${noiseEligible}noise)`);
}

// CHECK 4: Step 5 — review groups
console.log('\n=== Step 5: review groups ===');
const s5 = readJSON('05_quality_gate');
if (s5) {
  for (const g of REVIEW_GROUPS) {
    const ok = s5[g] !== undefined;
    fail(ok, `05_quality_gate missing: ${g}`);
    console.log(`  ${ok ? '✓' : '✗'} ${g}`);
  }
}

// CHECK 5: Step 6 — primary evidence triple constraint
console.log('\n=== Step 6: primary evidence ===');
const s6 = readJSON('06_positioning');
if (s6) {
  const items = s6.primary_evidence_items || [];
  if (s6.primary_archetype !== '未判定') fail(items.length > 0, `primary_archetype="${s6.primary_archetype}" needs ≥1 evidence item`);
  let badOwner=0, badElig=0, badRole=0;
  for (const item of items) {
    if (!OWNED.includes(item.signal_owner)) badOwner++;
    if (item.asset_eligibility !== 'primary_eligible') badElig++;
    if (!item.signal_role || item.signal_role === 'contextual_noise') badRole++;
  }
  fail(badOwner === 0, `${badOwner} evidence items: signal_owner not in [${OWNED}]`);
  fail(badElig === 0, `${badElig} evidence items: asset_eligibility not primary_eligible`);
  fail(badRole === 0, `${badRole} evidence items: signal_role missing or contextual_noise`);
  console.log(`  ✓ ${items.length} items checked (${badOwner}owner, ${badElig}elig, ${badRole}role)`);

  // Check supporting evidence
  const secOwned = secondaryOwned();
  const supp = s6.supporting_evidence_items || [];
  let badSupp=0;
  for (const item of supp) {
    if (!secOwned.includes(item.signal_owner) || item.asset_eligibility !== 'secondary_only') badSupp++;
  }
  fail(badSupp === 0, `${badSupp} supporting evidence items violate constraints (allowed: ${secOwned})`);
  console.log(`  ✓ ${supp.length} supporting items checked (${badSupp}bad)`);
}

// CHECK 6: Step 7 — report constraints
console.log('\n=== Step 7: report contract ===');
const s7 = readJSON('07_report');
if (s7) {
  const loc = s7.six_archetype_bars_location;
  fail(loc && BARS_LOCATIONS.includes(loc), `six_archetype_bars_location="${loc}" invalid`);
  fail(s7.first_screen_order_compliant === true, 'first_screen_order_compliant must be true');
  console.log(`  ✓ bars_location=${loc}, first_screen=${s7.first_screen_order_compliant}`);
}

const ok = errors.length === 0;
console.log(`\n${ok ? '✓ PASS' : '✗ FAIL'} — ${errors.length} errors, ${warnings.length} warnings`);
errors.forEach(e => console.log(`  ✗ ${e}`));
warnings.forEach(w => console.log(`  ⚠ ${w}`));
process.exit(ok ? 0 : 1);
