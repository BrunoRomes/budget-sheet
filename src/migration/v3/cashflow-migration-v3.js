class CashflowMigrationV3 extends BaseSheetMigration {
  constructor() {
    super('CashFlow', false);
  }

  prepareSchema(sheet) {
    this.projectionTable = new DataTable(
      sheet,
      2,
      7,
      'Projection',
      ['Date', 'Account $', 'To min in balance', 'Invest $', 'To min in balance after invest'],
      31
    );
  }

  loadData() {
    // Nothing to load
  }

  applyMigration(sheet) {
    sheet.setColumnWidth(13, 150);
    // Nothing to do here. The only migration is in the formulas
  }

  writeDataPostMigration() {
    const projectionData = [];
    for (let i = 0; i < 31; i += 1) {
      projectionData.push([
        `=TODAY()+${i + 1}`,
        `=SUMIFS($E$5:$E$383,$B$5:$B$383,">="&$N$6,$B$5:$B$383,"<="&G${i + 5})`,
        `=H${i + 5}-$N$5`,
        '',
        `=I${i + 5}-SUM($J$5:J${i + 5})`,
      ]);
    }
    this.projectionTable.initialize(projectionData);
  }
}
