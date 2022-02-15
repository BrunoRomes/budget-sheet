class MonthMigrationV2 extends BaseSheetMigration {
  prepareSchema(sheet) {
    this.numRows = 200;

    // Current schema
    this.originalSummaryTable = new DataTable(sheet, 1, 2, 'Summary', ['Category', 'Total'], 3).withoutHeaders();

    this.originalIncomeTable = new DataTable(
      sheet,
      21,
      2,
      'Income',
      ['Date', 'Amount', 'Description', 'Category', 'Source'],
      this.numRows
    );

    this.originalExpensesTable = new DataTable(
      sheet,
      21,
      8,
      'Expenses',
      ['Date', 'Amount', 'Description', 'Category', 'Source'],
      this.numRows
    );
    this.originalClassificationTable = new DataTable(
      sheet,
      21,
      14,
      'Expenses Classification',
      ['Category', 'Amount'],
      this.numRows
    );

    // New schema
    this.newSummaryTable = new DataTable(sheet, 1, 2, 'Summary', ['Income', 'Expenses', 'Investment'], 1);

    this.newIncomeTable = new DataTable(
      sheet,
      21,
      2,
      'Income',
      ['Date', 'Amount', 'Description', 'Category', 'Source', 'Key'],
      this.numRows
    );

    this.newExpensesTable = new DataTable(
      sheet,
      21,
      9,
      'Expenses',
      ['Date', 'Amount', 'Description', 'Category', 'Source', 'Key'],
      this.numRows
    );

    this.newClassificationTable = new DataTable(
      sheet,
      21,
      16,
      'Expenses Classification',
      ['Category', 'Amount'],
      this.numRows
    );
  }

  loadData() {
    this.originalIncome = this.originalIncomeTable.getDataAsArray();
    this.originalSummary = this.originalSummaryTable.getDataAsArray();
    this.originalExpenses = this.originalExpensesTable.getDataAsArray();
    this.originalClassification = this.originalClassificationTable.getDataAsArray();
  }

  applyMigration(sheet) {
    Formatter.removeTableFormat(this.originalIncomeTable);
    Formatter.removeTableFormat(this.originalExpensesTable);
    Formatter.removeTableFormat(this.originalSummaryTable);
    Formatter.removeTableFormat(this.originalClassificationTable);
    this.originalIncomeTable.clear();
    this.originalExpensesTable.clear();
    this.originalSummaryTable.clear();
    this.originalClassificationTable.clear();

    sheet.insertColumnAfter(6);
    sheet.insertColumnAfter(13);

    Formatter.applyDefaultTableFormat(this.newIncomeTable);
    Formatter.applyDefaultTableFormat(this.newExpensesTable);
    Formatter.applyDefaultTableFormat(this.newSummaryTable);
    Formatter.applyDefaultTableFormat(this.newClassificationTable);

    const transactionsFormat = ['dd/mm/yyyy', '$###,###,##0.00', '', '', '', ''];
    Formatter.applyDataFormat(this.newIncomeTable, transactionsFormat);
    Formatter.applyDataFormat(this.newExpensesTable, transactionsFormat);
    Formatter.applyDataFormat(this.newSummaryTable, ['$###,###,##0.00', '$###,###,##0.00', '$###,###,##0.00']);
    Formatter.applyDataFormat(this.newClassificationTable, ['', '$###,###,##0.00']);

    this.newIncomeTable.initialize([]);
    this.newExpensesTable.initialize([]);
    this.newSummaryTable.initialize([]);

    sheet.hideColumns(7);
    sheet.hideColumns(14);

    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (let i = 0; i < protections.length; i += 1) {
      protections[i].remove();
    }

    sheet
      .protect()
      .setWarningOnly(true)
      .setUnprotectedRanges([this.newIncomeTable.getDataRange(), this.newExpensesTable.getDataRange()]);
  }

  writeDataPostMigration() {
    const updatedIncome = [];
    for (let i = 0; i < this.originalIncome.length; i += 1) {
      const newIncome = { ...this.originalIncome[i] };
      newIncome.key = '';
      updatedIncome.push(newIncome);
    }
    this.newIncomeTable.setData(updatedIncome);

    const updatedExpenses = [];
    for (let i = 0; i < this.originalExpenses.length; i += 1) {
      const newExpense = { ...this.originalExpenses[i] };
      newExpense.key = '';
      updatedExpenses.push(newExpense);
    }
    this.newExpensesTable.setData(updatedExpenses);

    this.newSummaryTable.setData([
      {
        income: '=SUM(C24:C)',
        expenses: '=SUM(J24:J)-D4',
        investment: this.originalSummary[2].total,
      },
    ]);

    const classificationRows = [];
    for (let i = 0; i < this.numRows; i += 1) {
      classificationRows.push(['', `=if(isblank($P${24 + i}), "", sumif($L$24:$L,$P${24 + i},$J$24:$J))`]);
    }
    this.newClassificationTable.initialize(classificationRows);
  }

  static forAllMonths() {
    const migrations = [];
    let skipCloneSheet = false;
    for (let i = 0; i < MONTHS.length; i += 1) {
      migrations.push(new MonthMigrationV2(MONTHS[i], skipCloneSheet));
      skipCloneSheet = true; // All months are the same, so the clone sheet needs to happen only once
    }

    return migrations;
  }
}

// function testMonthMigrationV2() {
//   const m = new MonthMigrationV2('Jun');
//   m.run();
//   Logger.log('ABC');
// }
