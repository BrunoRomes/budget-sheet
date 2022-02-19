class CashflowMigrationV2 extends BaseSheetMigration {
  constructor() {
    super('CashFlow', false);
  }

  prepareSchema(sheet) {
    // Current schema
    this.originalSummaryTable = new DataTable(sheet, 2, 13, 'Config', ['Name', 'Value'], 2).withoutHeaders();

    this.newSummaryTable = new DataTable(sheet, 2, 13, 'Config', ['Name', 'Value'], 2);

    const numRows = 200;
    // Current schema
    this.originalCashFlowTable = new DataTable(
      sheet,
      2,
      2,
      'Cash Flow',
      ['Key', 'Date', 'Description', 'Amount'],
      numRows
    );

    this.newCashFlowTable = new DataTable(sheet, 2, 2, 'Cash Flow', ['Date', 'Description', 'Key', 'Amount'], numRows);

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
    this.summaryData = this.originalSummaryTable.getDataAsArray();
    this.data = this.originalCashFlowTable.getDataAsArray();
  }

  applyMigration(sheet) {
    Formatter.removeTableFormat(this.originalSummaryTable);
    this.originalSummaryTable.clear();
    this.originalCashFlowTable.clear();

    Formatter.applyDefaultTableFormat(this.newSummaryTable);
    Formatter.applyDefaultTableFormat(this.newCashFlowTable);
    Formatter.applyDataFormat(this.newCashFlowTable, ['dd/mm/yyyy', '', '', '$###,###,##0.00']);

    this.newSummaryTable.getDataRange().setNumberFormats([
      ['', '$###,###,##0.00'],
      ['', 'dd/mm/yyyy'],
    ]);

    sheet.setColumnWidth(3, 320);
    sheet.hideColumns(4);

    const conditionalFormatRules = [
      SpreadsheetApp.newConditionalFormatRule()
        .whenNumberLessThan(0)
        .setFontColor('#c53929')
        .setBold(true)
        .setRanges([sheet.getRange('E:E')])
        .build(),

      SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThan(0)
        .setFontColor('#0b8043')
        .setBold(true)
        .setRanges([sheet.getRange('E:E')])
        .build(),
    ];
    sheet.setConditionalFormatRules(conditionalFormatRules);
  }

  writeDataPostMigration() {
    this.newSummaryTable.initialize([
      ['Min $ in account', this.summaryData[0].value],
      ['Today', '=TODAY()'],
    ]);

    this.newCashFlowTable.initialize([]).setData(this.data);

    const projectionData = [];
    for (let i = 0; i < 31; i += 1) {
      projectionData.push([
        `=TODAY()+${i + 1}`,
        `=SUMIFS($E$5:$E$383,$B$5:$B$383,">="&$N$6,$B$5:$B$383,"<="&G${i + 5})`,
        `=H${i + 5}-$N$3`,
        '',
        `=I${i + 5}-SUM($J$5:J${i + 5})`,
      ]);
    }
    this.projectionTable.initialize(projectionData);
  }
}
