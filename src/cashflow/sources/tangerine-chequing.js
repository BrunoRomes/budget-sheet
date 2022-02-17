class TangerineChequingCashflowSource extends BaseCashflowSource {
  constructor(accountNumber, accountName) {
    super();
    this.searchString = `from:(donotreply@tangerine.ca) subject:(Orange Alert) "Your account balance is now" "Account ending in ${accountNumber}"`;
    this.accountName = accountName;
    this.foundFirst = false;
  }

  fetch() {
    return this.gmailSearch(this.searchString, 0, 4);
  }

  processGmailThread(messageBody) {
    if (this.foundFirst) {
      return null;
    }
    // Your Account balance is now
    const reBalance = /Your [Aa]ccount balance is now \$([0-9,]+\.\d{2})\./g;
    const res = reBalance.exec(messageBody.replaceAll('\n', ''));
    if (res == null) return null;
    const balance = res[1].replaceAll(',', '');
    this.foundFirst = true;
    return new CashflowEntry(new Date(), this.accountName, balance, true, true);
  }
}
