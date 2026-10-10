export function isEligible({ merged, checksPassed, productionChanged, regressionAdded }) {
  for (const value of [merged, checksPassed, productionChanged, regressionAdded]) {
    if (value !== true) return false;
  }
  return true;
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

