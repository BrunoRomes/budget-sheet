class RogersCardCashflowSource extends BaseCashflowSource {
  constructor() {
    super();
    this.searchString = 'from:(rogersbank@alerts.rogersbank.com) subject:(Payment Due Alert)';
  }

  fetch() {
    return this.gmailSearch(this.searchString, 0, 1);
  }

  processGmailThread(messageBody) {
    const reBalance = /A minimum payment of \$(.+) for/g;
    const reDate = /is due on ([0-9]{4}-[0-9]{2}-[0-9]{2})/g;

    const balance = reBalance.exec(messageBody)[1].replaceAll(',', '');
    const dueDate = reDate.exec(messageBody)[1];

    return new CashflowEntry(dueDate, 'Rogers Mastercard', -(balance * 50), false, false);
  }
}
