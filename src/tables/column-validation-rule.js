class ColumnValidationRule {
  constructor(col, validationRule) {
    this.col = col;
    this.validationRule = validationRule;
  }

  getColumn() {
    return this.col;
  }

  getRule() {
    return this.validationRule;
  }
}
