import assert from 'node:assert/strict';
import test from 'node:test';
import { isEligible, missingEligibilityGates } from '../src/eligibility.js';

test('rejects truthy non-boolean values independently in every gate', () => {
  const valid = { merged: true, checksPassed: true, productionChanged: true, regressionAdded: true };
  for (const field of Object.keys(valid)) {
    for (const invalid of ['true', 1, {}, [], false, null, undefined]) {
      assert.equal(isEligible({ ...valid, [field]: invalid }), false, field);
    }
  }
  assert.equal(isEligible(valid), true);
});

test('requires every release-evidence gate', () => {
  assert.equal(isEligible({ merged: true, checksPassed: true, productionChanged: true, regressionAdded: true }), true);
  assert.equal(isEligible({ merged: true, checksPassed: true, productionChanged: true, regressionAdded: false }), false);
});

test('reports every missing gate in deterministic policy order', () => {
  assert.deepEqual(
    missingEligibilityGates({ merged: false, checksPassed: true, productionChanged: false, regressionAdded: undefined }),
    ['merged', 'production_changed', 'regression_added'],
  );
  assert.deepEqual(
    missingEligibilityGates({ merged: true, checksPassed: true, productionChanged: true, regressionAdded: true }),
    [],
  );
});

