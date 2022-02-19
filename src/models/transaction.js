class Transaction {
  constructor(key, date, description, value, category, source) {
    this.key =
      key === '' ? `${date.toISOString().split('T')[0].replace(/\\-/g, ';')}_${description}${value}${source}` : key;
    this.date = date;
    this.description = description;
    this.value = value;
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
