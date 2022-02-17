class BiweeklyExpenseCashflowSource extends BaseCashflowSource {
  constructor(value, startDate, accountName) {
    super();
    this.value = value;
    this.startDate = startDate;
    this.accountName = accountName;
  }

  fetch() {
    const entries = [];
    let date = this.startDate;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);
    for (let i = 0; i < 26 && date < endDate; i += 1) {
      date = new Date(this.startDate);
      date.setDate(date.getDate() + i * 14);
      entries.push(new CashflowEntry(date, this.accountName, this.value, true, false));
    }

    return entries;
  }
}
