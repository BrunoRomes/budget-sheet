class MonthMigrationV4 extends BaseSheetMigration {
  prepareSchema(sheet) {
    log.info(`Prepare schema for ${sheet.getName()}`);
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
      9,
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

    // const categorySheetBoostrapper = new CategorySheetBootstrapper();
    // const categoryValidationRule = categorySheetBoostrapper.getValidationRule();
    this.newIncomeTable = new DataTable(
      sheet,
      21,
      2,
      'Income',
      ['Date', 'Amount', 'Description', 'Category', 'Source', 'Key'],
      this.numRows
    );

    // const dataStartRow = 4;
    // const range = this.sheet.getRange(dataStartRow, 2, 200, 1);
    // sheet.getRange(1,1,274,61).setDataValidation(null)

    this.newExpensesTable = new DataTable(
      sheet,
      21,
      9,
      'Expenses',
      ['Date', 'Amount', 'Description', 'Category', 'Classificator', 'Source', 'Key'],
      this.numRows
    );

    this.newClassificationTable = new DataTable(
      sheet,
      21,
      17,
      'Expenses Classification',
      ['Category', 'Amount'],
      this.numRows
    );
  }

  loadData() {
    log.info(`loadData ${this.sheetName}`);
    this.originalIncome = this.originalIncomeTable.getDataAsArray();
    this.originalSummary = this.originalSummaryTable.getDataAsArray();
    this.originalExpenses = this.originalExpensesTable.getDataAsArray();
    log.debug(`loaded ${this.originalExpenses.length}`);
    this.originalClassification = this.originalClassificationTable.getDataAsArray();
  }

  applyMigration(sheet) {
    log.info(`start applying migration V4 for months sheet`);
    Formatter.removeTableFormat(this.originalIncomeTable);
    Formatter.removeTableFormat(this.originalExpensesTable);
    Formatter.removeTableFormat(this.originalSummaryTable);
    Formatter.removeTableFormat(this.originalClassificationTable);
    this.originalIncomeTable.clear();
    this.originalExpensesTable.clear();
    this.originalSummaryTable.clear();
    this.originalClassificationTable.clear();

    // insert Classificator
    sheet.insertColumnAfter(12);

    sheet.getRange(1, 13, sheet.getMaxRows(), 1).setDataValidation(null);

    Formatter.applyDefaultTableFormat(this.newIncomeTable);
    Formatter.applyDefaultTableFormat(this.newExpensesTable);
    Formatter.applyDefaultTableFormat(this.newSummaryTable);
    Formatter.applyDefaultTableFormat(this.newClassificationTable);

    const transactionsFormatExpenses = ['dd/mm/yyyy', '$###,###,##0.00', '', '', '', '', ''];
    const transactionsFormatIncome = ['dd/mm/yyyy', '$###,###,##0.00', '', '', '', ''];
    Formatter.applyDataFormat(this.newIncomeTable, transactionsFormatIncome);
    Formatter.applyDataFormat(this.newExpensesTable, transactionsFormatExpenses);
    Formatter.applyDataFormat(this.newSummaryTable, ['$###,###,##0.00', '$###,###,##0.00', '$###,###,##0.00']);
    Formatter.applyDataFormat(this.newClassificationTable, ['', '$###,###,##0.00']);

    this.newIncomeTable.initialize([]);
    this.newExpensesTable.initialize([]);
    this.newSummaryTable.initialize([]);

    sheet.hideColumns(7);
    sheet.hideColumns(15);

    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (let i = 0; i < protections.length; i += 1) {
      protections[i].remove();
    }

    sheet
      .protect()
      .setWarningOnly(true)
      .setUnprotectedRanges([this.newIncomeTable.getDataRange(), this.newExpensesTable.getHeadersAndDataRange()]);

    if (this.newExpensesTable.getHeadersAndDataRange().getFilter() === null) {
      this.newExpensesTable.getHeadersAndDataRange().createFilter();
    }
  }

  writeDataPostMigration() {
    log.info(`writing data post migration`);
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
      newExpense.classificator = 'Manual';
      newExpense.key = '';
      updatedExpenses.push(newExpense);
    }
    this.newExpensesTable.setData(updatedExpenses);

    this.newSummaryTable.setData([
      {
        income: '=SUM(C24:C)',
        expenses: '=SUM(J24:J)-D4',
        investment: this.originalSummary[1].total,
      },
    ]);

    const classificationRows = [];
    for (let i = 0; i < this.numRows; i += 1) {
      classificationRows.push(['', `=if(isblank($Q${24 + i}), "", sumif($L$24:$L,$Q${24 + i},$J$24:$J))`]);
    }
    this.newClassificationTable.initialize(classificationRows);
  }

  static forAllMonths() {
    const migrations = [];
    const skipCloneSheet = true;
    // for (let i = 0; i <= 1; i += 1) {
    for (let i = 0; i < MONTHS.length; i += 1) {
      migrations.push(new MonthMigrationV4(MONTHS[i], skipCloneSheet));
      // migrations.push(new MonthMigrationV4(MONTHS[0], skipCloneSheet));
      // skipCloneSheet = true; // All months are the same, so the clone sheet needs to happen only once
    }

    return migrations;
  }
}
