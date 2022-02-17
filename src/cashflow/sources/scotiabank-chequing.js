class ScotiabankChequingCashflowSource extends BaseCashflowSource {
  constructor(accountNumber, accountName) {
    super();
    this.searchString = `from:(scotiainfoalerts@scotiabank.com) subject:(Account Balance) ${accountNumber}`;
    this.balanceRegexString = `The balance for account .+${accountNumber.substring(
      accountNumber.length - 4
    )} is \\$(.*)\\.`;
    this.accountName = accountName;
  }

  fetch() {
    return this.gmailSearch(this.searchString, 0, 1);
  }

  processGmailThread(messageBody) {
    const reBalance = new RegExp(this.balanceRegexString, 'g');
    let balance = reBalance.exec(messageBody);
    if (balance == null) {
      return null;
    }
    balance = balance[1].replaceAll(',', '');

    return new CashflowEntry(new Date(), this.accountName, balance, true, true);
  }
}
