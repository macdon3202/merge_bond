import assert from 'node:assert/strict';
import test from 'node:test';
import { isEligible, missingEligibilityGates } from '../src/eligibility.js';

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

