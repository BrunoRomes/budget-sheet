class InvestmentMigrationV2 extends BaseSheetMigration {
  constructor() {
    super('Investments', false);
  }

  prepareSchema(sheet) {
    // Current schema
    const numRows = 200;
    this.originalInvestmentsTable = new DataTable(
      sheet,
      2,
      2,
      'Investment',
      ['Date', 'Amount', 'Description', 'Category', 'Source'],
      numRows
    ).withDataValidationRules([new ColumnValidationRule(5, this.categoryValidationRule)]);

    this.newInvestmentsTable = new DataTable(
      sheet,
      2,
      2,
      'Investment',
      ['Date', 'Amount', 'Description', 'Category', 'Source', 'Key'],
      numRows
    ).withDataValidationRules([new ColumnValidationRule(5, this.categoryValidationRule)]);
  }

  loadData() {
    // No data to be loaded. This is just going to add a new column
  }

  applyMigration(sheet) {
    Formatter.removeTableFormat(this.originalInvestmentsTable);

    sheet.insertColumnAfter(6);
    sheet.insertColumnAfter(13);

    Formatter.applyDefaultTableFormat(this.newInvestmentsTable);

    const transactionsFormat = ['dd/mm/yyyy', '$###,###,##0.00', '', '', '', ''];
    Formatter.applyDataFormat(this.newInvestmentsTable, transactionsFormat);
    this.newInvestmentsTable.initialize([]);

    sheet.hideColumns(7);
  }

  writeDataPostMigration() {
    // Nothing to write
  }
}

// function testInvestmentMigrationV2() {
//   const m = new InvestmentMigrationV2();
//   m.run();
//   Logger.log('ABC');
// }
