class Transaction {
  // eslint-disable-next-line camelcase
  constructor(key, date, description, value, category, classificator, is_income, is_investment, source) {
    this.key =
      key === '' ? `${date.toISOString().split('T')[0].replace(/\\-/g, ';')}_${description}${value}${source}` : key;
    this.date = date;
    this.description = description;
    this.value = value;
    this.classificator = classificator;
    // eslint-disable-next-line camelcase
    this.is_income = is_income;
    // eslint-disable-next-line camelcase
    this.is_investment = is_investment;
    this.category = category;
    this.source = source;
    this.amount = value;
  }

  updateKey() {
    // TODO: IS THIS EVEN BEING USED?
    this.key = `${this.date.toISOString().split('T')[0].replace(/\\-/g, ';')}_${this.description}${this.value}${
      this.source
    }`;
  }
}
