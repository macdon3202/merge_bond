export function isEligible({ merged, checksPassed, productionChanged, regressionAdded }) {
  return Boolean(merged && checksPassed && productionChanged && regressionAdded);
}

export function missingEligibilityGates(evidence) {
  const gates = [
    ['merged', evidence.merged],
    ['checks_passed', evidence.checksPassed],
    ['production_changed', evidence.productionChanged],
    ['regression_added', evidence.regressionAdded],
  ];
  return gates.filter(([, satisfied]) => satisfied !== true).map(([name]) => name);
}

