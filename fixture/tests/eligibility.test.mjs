import assert from 'node:assert/strict';
import test from 'node:test';
import { isEligible } from '../src/eligibility.js';

test('requires every release-evidence gate', () => {
  assert.equal(isEligible({ merged: true, checksPassed: true, productionChanged: true, regressionAdded: true }), true);
  assert.equal(isEligible({ merged: true, checksPassed: true, productionChanged: true, regressionAdded: false }), false);
});

