class BCHydroCashflowSource extends BaseCashflowSource {
  constructor() {
    super();
    this.searchString = 'from:(notifications@bchydro.com) subject:(Your BC Hydro bill is ready)';
  }

  fetch() {
    return this.gmailSearch(this.searchString, 0, 4);
  }

  processGmailThread(messageBody) {
    const regex = /Your pre-authorized payment of \$(.+) will be withdrawn on or after ([A-Za-z]{3} \d+, \d{4})/g;

    const res = regex.exec(messageBody);
    if (res == null) {
      return null;
    }
    const dueDate = res[2];
    const balance = res[1].replaceAll(',', '').trim();
    return new CashflowEntry(dueDate, 'BC Hydro', -balance, false, false);
  }
}
