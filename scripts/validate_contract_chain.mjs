#!/usr/bin/env node

/**
 * validate_contract_chain.mjs
 *
 * Needscope v3 deterministic contract chain validator.
 *
 * Usage:
 *   node scripts/validate_contract_chain.mjs [work/contracts directory]
 *
 * If no directory is provided, defaults to ./work/contracts/.
 * Exits with code 0 if all checks pass, 1 if any check fails.
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const CONTRACTS_DIR = resolve(process.argv[2] || './work/contracts');
const REQUIRED_CONTRACTS = [
  '00_data_inventory.json',
  '01_scope_decision.json',
  '02_sampling_plan.json',
  '03_object_filter.json',
  '04_archetype_coding.json',
  '05_quality_gate.json',
  '06_positioning.json',
  '07_report.json',
];

const ALIAS_CONTRACT_NAMES = [
  '04_semantic_coding.json',
  '06_scoring_positioning.json',
  '07_report_generation.json',
];

const DISALLOWED_ARRAY = ['four_archetype_bars_location'];
const ALLOWED_OWNERS = ['brand', 'product', 'product_line', 'founder', 'content', 'community', 'platform', 'campaign', 'category', 'competitor'];
const POSITIONING_OWNERS = ['brand', 'product', 'product_line'];
const CONTEXT_ONLY_OWNERS = ['founder', 'content', 'community', 'platform', 'campaign', 'category', 'competitor'];
const ALLOWED_ELIGIBILITY = ['primary_eligible', 'secondary_only', 'context_only', 'exclude_from_positioning'];
const ALLOWED_BAR_LOCATIONS = ['appendix_only', 'evidence_section_not_first', 'not_present'];
const REQUIRED_REVIEW_GROUPS = ['random_review', 'high_like_review', 'context_risk_review', 'primary_evidence_review', 'supporting_evidence_review'];

const errors = [];
const warnings = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

function readJSON(name) {
  const path = resolve(CONTRACTS_DIR, name);
  if (!existsSync(path)) {
    errors.push(`MISSING: Required contract ${name} not found at ${path}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    errors.push(`PARSE ERROR: ${name} — ${e.message}`);
    return null;
  }
}

// ============================================================
// CHECK 1: Required contract files exist with exact names
// ============================================================
console.log('\n=== CHECK 1: Required contract files ===');
for (const name of REQUIRED_CONTRACTS) {
  const found = existsSync(resolve(CONTRACTS_DIR, name));
  check(found, `Required contract ${name} does not exist in ${CONTRACTS_DIR}`);
  console.log(`  ${found ? '✓' : '✗'} ${name}`);
}

// ============================================================
// CHECK 2: No alias contract names for formal report
// ============================================================
console.log('\n=== CHECK 2: Alias name disallowance ===');
for (const alias of ALIAS_CONTRACT_NAMES) {
  const found = existsSync(resolve(CONTRACTS_DIR, alias));
  check(!found, `Alias contract ${alias} found in active contracts directory. Formal runs must use exact names.`);
  console.log(`  ${found ? '✗' : '✓'} ${alias} (${found ? 'present — FAIL' : 'absent — OK'})`);
}

// ============================================================
// CHECK 3: Step 4 coded items include asset_eligibility
// ============================================================
console.log('\n=== CHECK 3: asset_eligibility in Step 4 ===');
const step4 = readJSON('04_archetype_coding.json');
if (step4) {
  const items = step4.coded_items || [];
  const total = items.length;
  check(total > 0, '04_archetype_coding has no coded_items array');

  let missingEligibility = 0;
  let invalidEligibility = 0;
  let invalidOwner = 0;
  let illegalPrimaryOwner = 0;
  let illegalSecondaryOwner = 0;
  let eligibleContextualNoise = 0;
  for (const item of items) {
    if (!item.signal_owner || !ALLOWED_OWNERS.includes(item.signal_owner)) invalidOwner++;
    if (!item.asset_eligibility) missingEligibility++;
    else if (!ALLOWED_ELIGIBILITY.includes(item.asset_eligibility)) invalidEligibility++;

    if (item.asset_eligibility === 'primary_eligible' && !POSITIONING_OWNERS.includes(item.signal_owner)) {
      illegalPrimaryOwner++;
    }
    if (item.asset_eligibility === 'secondary_only' && !POSITIONING_OWNERS.includes(item.signal_owner)) {
      illegalSecondaryOwner++;
    }
    if (
      ['primary_eligible', 'secondary_only'].includes(item.asset_eligibility) &&
      item.signal_role === 'contextual_noise'
    ) {
      eligibleContextualNoise++;
    }
  }

  check(invalidOwner === 0, `${invalidOwner}/${total} coded_items have invalid signal_owner value`);
  check(missingEligibility === 0, `${missingEligibility}/${total} coded_items missing asset_eligibility`);
  check(invalidEligibility === 0, `${invalidEligibility}/${total} coded_items have invalid asset_eligibility value`);
  check(illegalPrimaryOwner === 0, `${illegalPrimaryOwner}/${total} coded_items are primary_eligible but signal_owner is not brand/product/product_line`);
  check(illegalSecondaryOwner === 0, `${illegalSecondaryOwner}/${total} coded_items are secondary_only but signal_owner is not brand/product/product_line`);
  check(eligibleContextualNoise === 0, `${eligibleContextualNoise}/${total} coded_items are primary/secondary eligible but signal_role=contextual_noise`);
  console.log(`  ✓ ${total} items checked`);
  console.log(`  ${invalidOwner > 0 ? '✗' : '✓'} ${invalidOwner} invalid signal_owner`);
  console.log(`  ${missingEligibility > 0 ? '✗' : '✓'} ${missingEligibility} missing asset_eligibility`);
  console.log(`  ${invalidEligibility > 0 ? '✗' : '✓'} ${invalidEligibility} invalid asset_eligibility`);
  console.log(`  ${illegalPrimaryOwner > 0 ? '✗' : '✓'} ${illegalPrimaryOwner} illegal primary_eligible owner`);
  console.log(`  ${illegalSecondaryOwner > 0 ? '✗' : '✓'} ${illegalSecondaryOwner} illegal secondary_only owner`);
  console.log(`  ${eligibleContextualNoise > 0 ? '✗' : '✓'} ${eligibleContextualNoise} eligible contextual_noise`);

  // Also check eligibility_reason
  const missingReason = items.filter(i => !i.eligibility_reason).length;
  warn(missingReason <= total * 0.1, `${missingReason}/${total} items missing eligibility_reason (should be <10%)`);
  console.log(`  ⚠ ${missingReason} missing eligibility_reason`);
}

// ============================================================
// CHECK 4: Step 5 contains all four review groups
// ============================================================
console.log('\n=== CHECK 4: Four review groups in Step 5 ===');
const step5 = readJSON('05_quality_gate.json');
if (step5) {
  for (const group of REQUIRED_REVIEW_GROUPS) {
    const hasGroup = step5[group] !== undefined;
    check(hasGroup, `05_quality_gate missing required review group: ${group}`);
    console.log(`  ${hasGroup ? '✓' : '✗'} ${group}`);
  }

  // Check critical_failures array
  if (step5.critical_failures && step5.critical_failures.length > 0) {
    console.log(`  ⚠ critical_failures present: ${step5.critical_failures.join(', ')}`);
  }
}

// ============================================================
// CHECK 5: Step 6 primary evidence only uses eligible owned signals
// ============================================================
console.log('\n=== CHECK 5: Primary evidence eligibility in Step 6 ===');
const step6 = readJSON('06_positioning.json');
if (step6) {
  const evidenceItems = step6.primary_evidence_items || [];
  const hasPrimaryEvidenceArray = Array.isArray(step6.primary_evidence_items);
  check(hasPrimaryEvidenceArray, '06_positioning missing primary_evidence_items array');
  const totalEvidence = evidenceItems.length;
  if (step6.primary_archetype !== '未判定') {
    check(totalEvidence > 0, `primary_archetype="${step6.primary_archetype}" requires at least 1 primary_evidence_items entry`);
  }

  let invalidOwner = 0;
  let invalidEligibility = 0;
  let missingSignalRole = 0;
  let contextualNoiseInPrimary = 0;
  for (const item of evidenceItems) {
    // Triple constraint 1: signal_owner in brand/product/product_line
    if (!item.signal_owner || !POSITIONING_OWNERS.includes(item.signal_owner)) {
      invalidOwner++;
    }
    // Triple constraint 2: asset_eligibility must be primary_eligible (required, not just !==)
    if (!item.asset_eligibility || item.asset_eligibility !== 'primary_eligible') {
      invalidEligibility++;
    }
    // Triple constraint 3: signal_role must exist and not be contextual_noise
    if (!item.signal_role) {
      missingSignalRole++;
    } else if (item.signal_role === 'contextual_noise') {
      contextualNoiseInPrimary++;
    }
  }

  check(missingSignalRole === 0, `${missingSignalRole}/${totalEvidence} primary_evidence_items missing signal_role`);
  check(contextualNoiseInPrimary === 0, `${contextualNoiseInPrimary}/${totalEvidence} primary_evidence_items have signal_role=contextual_noise — must not be contextual_noise for primary evidence`);
  check(invalidOwner === 0, `${invalidOwner}/${totalEvidence} primary_evidence_items have invalid signal_owner (must be brand/product/product_line)`);
  check(invalidEligibility === 0, `${invalidEligibility}/${totalEvidence} primary_evidence_items missing or invalid asset_eligibility (must be primary_eligible)`);
  console.log(`  ✓ ${totalEvidence} primary evidence items checked`);
  console.log(`  ${missingSignalRole > 0 ? '✗' : '✓'} ${missingSignalRole} missing signal_role`);
  console.log(`  ${contextualNoiseInPrimary > 0 ? '✗' : '✓'} ${contextualNoiseInPrimary} contextual_noise in primary`);
  console.log(`  ${invalidOwner > 0 ? '✗' : '✓'} ${invalidOwner} invalid signal_owner`);
  console.log(`  ${invalidEligibility > 0 ? '✗' : '✓'} ${invalidEligibility} invalid asset_eligibility`);

  // Check insufficient_owned_signal_reason when primary_archetype is 未判定
  if (step6.primary_archetype === '未判定') {
    check(step6.insufficient_owned_signal_reason && step6.insufficient_owned_signal_reason.length > 0,
      'primary_archetype is 未判定 but insufficient_owned_signal_reason is empty or missing');
    console.log(`  ✓ insufficient_owned_signal_reason: ${step6.insufficient_owned_signal_reason ? 'present' : 'missing'}`);
  }

  // Check excluded_high_influence_items
  if (step6.excluded_high_influence_items && step6.excluded_high_influence_items.length > 0) {
    for (const item of step6.excluded_high_influence_items) {
      check(item.exclusion_reason && item.exclusion_reason.length > 0,
        'excluded_high_influence_items entry missing exclusion_reason');
    }
    console.log(`  ✓ ${step6.excluded_high_influence_items.length} excluded items checked`);
  }

  // v3.1: Check supporting evidence is broader but still owned and non-noise.
  const supportingItems = step6.supporting_evidence_items || [];
  const hasSupportingEvidenceArray = Array.isArray(step6.supporting_evidence_items);
  check(hasSupportingEvidenceArray, '06_positioning missing supporting_evidence_items array');
  let invalidSupportingOwner = 0;
  let invalidSupportingEligibility = 0;
  let invalidSupportingRole = 0;
  let missingDiscountReason = 0;
  for (const item of supportingItems) {
    if (!item.signal_owner || !POSITIONING_OWNERS.includes(item.signal_owner)) {
      invalidSupportingOwner++;
    }
    if (!item.asset_eligibility || item.asset_eligibility !== 'secondary_only') {
      invalidSupportingEligibility++;
    }
    if (!item.signal_role || item.signal_role === 'contextual_noise') {
      invalidSupportingRole++;
    }
    if (!item.discount_reason) {
      missingDiscountReason++;
    }
  }

  check(invalidSupportingOwner === 0, `${invalidSupportingOwner}/${supportingItems.length} supporting_evidence_items have invalid signal_owner`);
  check(invalidSupportingEligibility === 0, `${invalidSupportingEligibility}/${supportingItems.length} supporting_evidence_items missing or invalid asset_eligibility (must be secondary_only)`);
  check(invalidSupportingRole === 0, `${invalidSupportingRole}/${supportingItems.length} supporting_evidence_items missing signal_role or have contextual_noise`);
  warn(missingDiscountReason === 0, `${missingDiscountReason}/${supportingItems.length} supporting_evidence_items missing discount_reason`);
  console.log(`  ✓ ${supportingItems.length} supporting evidence items checked`);
  console.log(`  ${invalidSupportingOwner > 0 ? '✗' : '✓'} ${invalidSupportingOwner} invalid supporting signal_owner`);
  console.log(`  ${invalidSupportingEligibility > 0 ? '✗' : '✓'} ${invalidSupportingEligibility} invalid supporting asset_eligibility`);
  console.log(`  ${invalidSupportingRole > 0 ? '✗' : '✓'} ${invalidSupportingRole} invalid supporting signal_role`);

  if (step6.evidence_basis_counts) {
    const counts = step6.evidence_basis_counts;
    const expectedPositioning = (counts.primary_evidence_count || 0) + (counts.supporting_evidence_count || 0);
    check(counts.positioning_evidence_count === expectedPositioning,
      `evidence_basis_counts.positioning_evidence_count (${counts.positioning_evidence_count}) must equal primary + supporting (${expectedPositioning})`);
    check(counts.primary_evidence_count === evidenceItems.length,
      `evidence_basis_counts.primary_evidence_count (${counts.primary_evidence_count}) must equal primary_evidence_items.length (${evidenceItems.length})`);
    check(counts.supporting_evidence_count === supportingItems.length,
      `evidence_basis_counts.supporting_evidence_count (${counts.supporting_evidence_count}) must equal supporting_evidence_items.length (${supportingItems.length})`);
    console.log(`  ✓ evidence_basis_counts present`);
  } else {
    warn(false, '06_positioning missing evidence_basis_counts (v3.1 recommended)');
  }
}

// ============================================================
// CHECK 6: Step 7 declares six-archetype bars location
// ============================================================
console.log('\n=== CHECK 6: Six-archetype bars constraint in Step 7 ===');
const step7 = readJSON('07_report.json');
if (step7) {
  const barLocation = step7.six_archetype_bars_location;
  check(barLocation !== undefined, '07_report missing six_archetype_bars_location');
  if (barLocation) {
    check(ALLOWED_BAR_LOCATIONS.includes(barLocation),
      `six_archetype_bars_location="${barLocation}" not allowed. Must be one of: ${ALLOWED_BAR_LOCATIONS.join(', ')}`);
    check(barLocation !== 'first_visual',
      'six_archetype_bars_location cannot be "first_visual" — must be appendix_only or evidence_section_not_first');
    console.log(`  ✓ six_archetype_bars_location: ${barLocation}`);
  }

  const segmented = step7.six_archetype_bars_segmented_by_owner;
  if (segmented !== undefined) {
    warn(segmented === true, 'six_archetype_bars_segmented_by_owner should be true for v3 compliance');
    console.log(`  ${segmented ? '✓' : '⚠'} segmented_by_owner: ${segmented}`);
  }

  const firstScreen = step7.first_screen_order_compliant;
  check(firstScreen === true, 'first_screen_order_compliant must be true for v3 compliance');
  console.log(`  ${firstScreen ? '✓' : '✗'} first_screen_order_compliant: ${firstScreen}`);
}

// ============================================================
// SUMMARY
// ============================================================
console.log('\n========================================');
console.log(`Validation complete:`);
console.log(`  Errors:   ${errors.length}`);
console.log(`  Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.log('\n--- ERRORS ---');
  for (const err of errors) {
    console.log(`  ✗ ${err}`);
  }
}

if (warnings.length > 0) {
  console.log('\n--- WARNINGS ---');
  for (const warn of warnings) {
    console.log(`  ⚠ ${warn}`);
  }
}

const fail = errors.length > 0;
if (fail) {
  console.log('\n❌ VALIDATION FAILED — contract chain is not v3 compliant.');
  console.log('   Fix errors above before generating formal report.');
} else {
  console.log('\n✅ VALIDATION PASSED — contract chain is v3 compliant.');
}

process.exit(fail ? 1 : 0);
