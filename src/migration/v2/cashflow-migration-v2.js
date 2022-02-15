class CashflowMigrationV2 extends BaseSheetMigration {
  constructor() {
    super('CashFlow', false);
  }

  prepareSchema(sheet) {
    // Current schema
    this.originalSummaryTable = new DataTable(sheet, 2, 13, 'Config', ['Name', 'Value'], 2).withoutHeaders();

    this.newSummaryTable = new DataTable(sheet, 2, 13, 'Config', ['Name', 'Value'], 2);
  }

  loadData() {
    this.data = this.originalSummaryTable.getDataAsArray();
  }

  applyMigration(_sheet) {
    Formatter.removeTableFormat(this.originalSummaryTable);
    this.originalSummaryTable.clear();

    Formatter.applyDefaultTableFormat(this.newSummaryTable);

    this.newSummaryTable.getDataRange().setNumberFormats([
      ['', '$###,###,##0.00'],
      ['', 'dd/mm/yyyy'],
    ]);
  }

  writeDataPostMigration() {
    this.newSummaryTable.initialize([
      ['Min $ in account', this.data[0].value],
      ['Today', '=TODAY()'],
    ]);
  }
}

// function testCashflowMigrationV2() {
//   const m = new CashflowMigrationV2();
//   m.run();
//   Logger.log('ABC');
// }
