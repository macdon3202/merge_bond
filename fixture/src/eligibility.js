export function isEligible({ merged, checksPassed, productionChanged, regressionAdded }) {
  return Boolean(merged && checksPassed && productionChanged && regressionAdded);
}

