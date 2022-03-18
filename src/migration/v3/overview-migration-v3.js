class OverviewMigrationV3 extends BaseSheetMigration {
  constructor() {
    super('Overview', false);
  }

  prepareSchema(sheet) {
    // // Current schema
    this.summaryTable = new DataTable(sheet, 1, 2, 'Summary', ['Month', 'Income', 'Expenses', 'Net', '% Spent'], 14);
  }

  loadData() {
    // No need to load data. The only operation here is to update the formulas
  }

  applyMigration(sheet) {
    const n = sheet.getCharts().length;
    for (let i = n - 1; i >= 0; i -= 1) {
      const chart = sheet.getCharts()[i];
      sheet.removeChart(chart);
    }

    sheet.insertChart(
      sheet
        .newChart()
        .asAreaChart()
        .clearRanges()
        .addRange(sheet.getRange('B4:B15'))
        .addRange(sheet.getRange('C4:C15'))
        .addRange(sheet.getRange('D4:D15'))
        .setPosition(1, 8, 0, 0)
        .setTitle('Income VS Expense')
        .build()
    );

    sheet.insertChart(
      sheet
        .newChart()
        .asColumnChart()
        .clearRanges()
        .addRange(sheet.getRange('B4:B16'))
        .addRange(sheet.getRange('E4:E16'))
        .setPosition(19, 2, 0, 0)
        .setTitle('Net VS Month')
        .build()
    );

    sheet.insertChart(
      sheet
        .newChart()
        .asPieChart()
        .clearRanges()
        .addRange(sheet.getRange('B43:B243'))
        .addRange(sheet.getRange('O43:O243'))
        .setPosition(19, 8, 0, 0)
        .setTitle('Total VS Category')
        .build()
    );
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
    summaryData.push([
      'Average',
      '=averageif(C3:C15, "<>0")',
      '=averageif(D3:D15, "<>0")',
      '=C16-D16',
      '=IFERROR(D16/C16,0)',
    ]);
    summaryData.push(['Total', '=sum(C3:C15)', '=sum(D3:D15)', '=C17-D17', '=IFERROR(D17/C17,0)']);
    this.summaryTable.initialize(summaryData);
  }
}
