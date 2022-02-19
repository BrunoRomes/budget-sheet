class MonthSheet {
  constructor(month) {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(month);
    this.month = month;
    const numRows = 200;

    this.summaryTable = new DataTable(this.sheet, 1, 2, 'Summary', ['Income', 'Expenses', 'Investment'], 1);

    this.incomeTable = new DataTable(
      this.sheet,
      21,
      2,
      'Income',
      ['Date', 'Amount', 'Description', 'Category', 'Source', 'Key'],
      numRows
    );

    this.expensesTable = new DataTable(
      this.sheet,
      21,
      9,
      'Expenses',
      ['Date', 'Amount', 'Description', 'Category', 'Source', 'Key'],
      numRows
    );

    this.classificationTable = new DataTable(
      this.sheet,
      21,
      16,
      'Expenses Classification',
      ['Category', 'Amount'],
      numRows
    );
  }

  applyFormat() {
    Formatter.removeTableFormat(this.summaryTable);
    Formatter.removeTableFormat(this.expensesTable);
    Formatter.removeTableFormat(this.incomeTable);
    Formatter.removeTableFormat(this.classificationTable);

    Formatter.applyDefaultTableFormat(this.incomeTable);
    Formatter.applyDefaultTableFormat(this.expensesTable);
    Formatter.applyDefaultTableFormat(this.summaryTable);
    Formatter.applyDefaultTableFormat(this.classificationTable);

    if (this.expensesTable.getHeadersAndDataRange().getFilter() === null) {
      this.expensesTable.getHeadersAndDataRange().createFilter();
    }

    const transactionsFormat = ['dd/mm/yyyy', '$###,###,##0.00', '', '', '', ''];
    Formatter.applyDataFormat(this.incomeTable, transactionsFormat);
    Formatter.applyDataFormat(this.expensesTable, transactionsFormat);
    Formatter.applyDataFormat(this.summaryTable, ['$###,###,##0.00', '$###,###,##0.00', '$###,###,##0.00']);
    Formatter.applyDataFormat(this.classificationTable, ['', '$###,###,##0.00']);

    this.sheet.hideColumns(7);
    this.sheet.hideColumns(14);

    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (let i = 0; i < protections.length; i += 1) {
      protections[i].remove();
    }

    this.sheet
      .protect()
      .setWarningOnly(true)
      .setUnprotectedRanges([this.incomeTable.getDataRange(), this.expensesTable.getHeadersAndDataRange()]);

    const conditionalFormatRules = [
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('Other')
        .setFontColor('#F46524')
        .setBold(true)
        .setRanges([this.incomeTable.getDataRange(), this.expensesTable.getDataRange()])
        .build(),
    ];
    this.sheet.setConditionalFormatRules(conditionalFormatRules);
  }

  getExpensesAsMap() {
    Logger.log(`Getting expenses for ${this.month}`);
    const data = this.expensesTable.getDataAsArray();
    const transactions = {};
    data.forEach((entry) => {
      // (key, date, description, value, category, source)
      const transaction = new Transaction(
        entry.key,
        entry.date,
        entry.description,
        entry.amount,
        entry.category,
        entry.source
      );
      transactions[transaction.key] = transaction;
    });
    return transactions;
  }

  getExpenses() {
    Logger.log(`Getting expenses for ${this.month}`);
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
        entry.source
      );
      transactions.push(transaction);
    });
    return transactions;
  }

  setExpenses(transactions) {
    Logger.log(`Writing ${transactions.length} expenses for ${this.month}`);
    const formattedTransactions = transactions.sort((a, b) => a.date - b.date);
    this.expensesTable.setData(formattedTransactions);
  }

  getIncomesAsMap() {
    Logger.log(`Getting income for ${this.month}`);
    const data = this.incomeTable.getDataAsArray();
    const transactions = {};
    data.forEach((entry) => {
      // (key, date, description, value, category, source)
      const transaction = new Transaction(
        entry.key,
        entry.date,
        entry.description,
        entry.amount,
        entry.category,
        entry.source
      );
      transactions[transaction.key] = transaction;
    });
    return transactions;
  }

  getIncomes() {
    Logger.log(`Getting income for ${this.month}`);
    const data = this.incomeTable.getDataAsArray();
    const transactions = [];
    data.forEach((entry) => {
      // (key, date, description, value, category, source)
      const transaction = new Transaction(
        entry.key,
        entry.date,
        entry.description,
        entry.amount,
        entry.category,
        entry.source
      );
      transactions.push(transaction);
    });
    return transactions;
  }

  setIncomes(transactions) {
    Logger.log(`Writing ${transactions.length} incomes for ${this.month}`);
    const formattedTransactions = transactions.sort((a, b) => a.date - b.date);
    this.incomeTable.setData(formattedTransactions);
  }

  setCategories(categories) {
    const formattedCategories = categories.sort((a, b) => (a.category > b.category ? 1 : -1));
    this.classificationTable.setDataColumn(formattedCategories, 0);
  }

  setTotalInvested(total) {
    this.summaryTable.setDataColumn([{ investment: total }], 2);
  }

  refresh() {
    const monthIndex = MONTHS.indexOf(this.month);
    const handler = new CsvHandler();
    handler.importTransactionsForMonth(monthIndex);
    const classifier = new TransactionClassifier();
    classifier.classify(this.getExpensesAsMap(), this.getIncomesAsMap());

    this.setExpenses(classifier.getExpensesArray());
    this.setIncomes(classifier.getIncomesArray());
    this.setCategories(classifier.getUsedCategoriesArray());
    this.setTotalInvested(classifier.getTotalInvested());
  }
}

// function testMonthSheet() {
//   new UserConfig();
//   const sheet = new MonthSheet('Jan');
//   sheet.refresh();
//   // var a = sheet.getCategories();
//   // var b = sheet.getCategories();
// }
