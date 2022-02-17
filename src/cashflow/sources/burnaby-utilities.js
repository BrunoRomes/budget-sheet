class BurnabyUtilitiesCashflowSource extends BaseCashflowSource {
  constructor() {
    super();
    this.searchString = 'from:(tax.noreply@burnaby.ca) subject:(Your Utility eBill for is now available.)';
  }

  fetch() {
    return this.gmailSearch(this.searchString, 0, 1);
  }

  processGmailThread(messageBody) {
    const reDate = /Due Date: \* ([A-Za-z]{3} \d{2}, \d{4})/g;
    const dueDate = reDate.exec(messageBody)[1];

    const reBalance = new RegExp(`Amount Due \\* \\(if Paid Before ${dueDate}\\): \\$(.+)`, 'g');
    const balance = reBalance.exec(messageBody)[1].replaceAll(',', '').trim();
    return new CashflowEntry(dueDate, 'Burnaby Utilities', -balance, false, true);
  }
}
