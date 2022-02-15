class OverviewMigrationV2 extends BaseSheetMigration {
  constructor() {
    super('Overview', false);
  }

  prepareSchema(sheet) {
    // Current schema
    this.summaryTable = new DataTable(sheet, 1, 2, 'Summary', ['Month', 'Income', 'Expenses', 'Net', '% Spent'], 14);
  }

  loadData() {
    // No need to load data. The only operation here is to update the formulas
  }

  applyMigration(_sheet) {
    // No need to change anything. The only change is in the formulas
  }

  writeDataPostMigration() {
    const summaryData = [];
    for (let i = 0; i < MONTHS.length; i += 1) {
      summaryData.push([
        MONTHS[i],
        `=${MONTHS[i]}!$B$4`,
        `=${MONTHS[i]}!$C$4`,
        `=C${i + 4}-D${i + 4}`,
        `=IFERROR(D${i + 4}/C${i + 4},0)`,
      ]);
    }
    summaryData.push(['Average', '=average(C3:C15)', '=average(D3:D15)', '=C16-D16', '=IFERROR(D16/C16,0)']);
    summaryData.push(['Total', '=sum(C3:C15)', '=sum(D3:D15)', '=C17-D17', '=IFERROR(D17/C17,0)']);

    this.summaryTable.initialize(summaryData);
  }
}

// function testOverviewMigrationV2() {
//   const m = new OverviewMigrationV2();
//   m.run();
//   Logger.log('ABC');
// }
