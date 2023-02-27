class TransactionsSheet {
  constructor() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('All-Transactions');
    const numRows = 2000;
    this.mainTable = new DataTable(this.sheet, 1, 2, 'All-Transactions', TransactionsSheet.headers, numRows);
  }

  applyFormat() {
    Formatter.removeTableFormat(this.mainTable);
    Formatter.applyDefaultTableFormat(this.mainTable);

    if (this.mainTable.getHeadersAndDataRange().getFilter() === null) {
      this.mainTable.getHeadersAndDataRange().createFilter();
    }
    this.sheet.setFrozenRows(3);

    Formatter.applyDataFormat(this.mainTable, TransactionsSheet.transactionsFormat);

    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (let i = 0; i < protections.length; i += 1) {
      protections[i].remove();
    }

    this.sheet
      .protect()
      .setWarningOnly(true)
      .setUnprotectedRanges([this.mainTable.getHeadersAndDataRange(), this.mainTable.getTitleRange()]);
  }

  getExpensesAsMap() {
    log.info(`Getting expenses as a map`);
    const data = this.mainTable.getDataAsArray();
    const transactions = {};
    data.forEach((entry) => {
      log.debug(JSON.stringify(entry));
      // constructor(key, date, description, value, category, classificator, is_income, is_investment, source) {
      const transaction = new Transaction(
        entry.key,
        entry.date,
        entry.description,
        entry.amount,
        entry.category,
        entry.classificator,
        entry.is_income,
        entry.is_investment,
        entry.source
      );
      transactions[transaction.key] = transaction;
    });
    return transactions;
  }

  getExpenses() {
    log.info(`Getting expenses`);
    const data = this.expensesTable.getDataAsArray();
    const transactions = [];
    data.forEach((entry) => {
      // (key, date, description, value, category, source)
      const transaction = new Transaction(
        entry.key,
        entry.date,
        entry.description,
        entry.amount,
        entry.category,
        entry.classificator,
        entry.source
      );
      transactions.push(transaction);
    });
    return transactions;
  }

  setExpenses(transactions) {
    log.info(`Writing ${transactions.length} expenses`);
    const formattedTransactions = transactions.sort((a, b) => a.date - b.date);
    this.mainTable.setData(formattedTransactions);
  }

  refresh() {
    // TODO: alex working on this.
    const classifier = new TransactionClassifier();
    classifier.classifyExpensesFromMap(this.getExpensesAsMap());
    this.setExpenses(classifier.getExpensesArray());
  }
}
TransactionsSheet.columnDate = 2;
TransactionsSheet.columnAmmount = 3;
TransactionsSheet.columnDescription = 4;
TransactionsSheet.columnCategory = 5;
TransactionsSheet.columnClassificator = 6;
TransactionsSheet.columnSource = 7;
TransactionsSheet.columnIsIncome = 8;
TransactionsSheet.columnIsInvestment = 9;
TransactionsSheet.columnKey = 10;
TransactionsSheet.headers = [
  'Date',
  'Amount',
  'Description',
  'Category',
  'Classificator',
  'Source',
  'Is Income',
  'Is Investment',
  'Key',
];
TransactionsSheet.transactionsFormat = ['dd/mm/yyyy', '$###,###,##0.00', '', '', '', '', '', '', ''];
