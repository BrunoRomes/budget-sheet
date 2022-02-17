class CapitalOneCashflowSource extends BaseCashflowSource {
  constructor(accountLastFourDigits, accountName) {
    super();
    this.searchString = `from:(capitalone@notification.capitalone.com) subject:(Your statement is ready) (Account ending in ${accountLastFourDigits})`;
    this.accountName = accountName;
  }

  fetch() {
    return this.gmailSearch(this.searchString, 0, 4);
  }

  processGmailThread(messageBody) {
    const reBalance = /Statement balance: \$(.+)+/g;
    const reDate = /Payment due date: ([A-Z][a-z]+ [0-9]{1,2}, ?[0-9]{4})/g;

    const balance = reBalance.exec(messageBody)[1].replaceAll(',', '');
    const dueDate = reDate.exec(messageBody)[1];
    return new CashflowEntry(dueDate, this.accountName, `-${balance}`, false, false);
  }
}
