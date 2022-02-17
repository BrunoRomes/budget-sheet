class ScotiabankCardCashflowSource extends BaseCashflowSource {
  constructor() {
    super();
    this.searchString =
      'from:(scotiainfoalerts@scotiabank.com) subject:(e-Statement issued for credit card or line of credit)';
  }

  fetch() {
    return this.gmailSearch(this.searchString, 0, 5);
  }

  processGmailThread(messageBody) {
    const reBalance = /Statement balance: \$(.+)+/g;
    const reDate = /Payment due date: ([A-Z][a-z][a-z] [0-9]{1,2}, [0-9]{4})/g;

    const balance = reBalance.exec(messageBody)[1].replaceAll(',', '');
    const dueDate = reDate.exec(messageBody)[1];

    return new CashflowEntry(dueDate, 'Scotiabank - Credit Card', -balance, false, false);
  }
}
