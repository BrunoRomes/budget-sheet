class InvestmentSheetBootstrapper extends BaseSheetBootstrapper {
  constructor(categoryValidationRule) {
    super('Investments');
    this.categoryValidationRule = categoryValidationRule;
  }

  createSheet() {
    const numRows = 200;
    this.investmentsTable = new DataTable(
      this.sheet,
      2,
      2,
      'Investment',
      ['Date', 'Amount', 'Description', 'Category', 'Source'],
      numRows
    )
      .withDataValidationRules([new ColumnValidationRule(5, this.categoryValidationRule)])
      .initialize([]);

    const classificationRows = [];
    for (let i = 0; i < numRows; i += 1) {
      classificationRows.push(['', `=if(isblank($H${5 + i}), "", sumif($E$5:$E,$H${5 + i},$C$5:$C))`]);
    }

    this.classificationTable = new DataTable(
      this.sheet,
      2,
      8,
      'Investment Classification',
      ['Category', 'Amount'],
      numRows
    ).initialize(classificationRows);

    this.summaryTable = new DataTable(this.sheet, 2, 11, 'Summary', ['Total'], 1).initialize([['=SUM(C5:C)']]);

    const chart = this.sheet
      .newChart()
      .asPieChart()
      .clearRanges()
      .addRange(this.sheet.getRange('H5:H400'))
      .addRange(this.sheet.getRange('I5:I400'))
      .setPosition(7, 11, 0, 0)
      .setTitle('Value VS Category')
      .build();
    this.sheet.insertChart(chart);

    const image = this.sheet.insertImage(REFRESH_BUTTON_IMAGE, 12, 28);
    image.assignScript('refresh');
  }

  applyFormat() {
    this.sheet.clearFormats();
    this.sheet.setHiddenGridlines(true);
    Formatter.applyDefaultTableFormat(this.summaryTable);
    Formatter.applyDefaultTableFormat(this.investmentsTable);
    Formatter.applyDefaultTableFormat(this.classificationTable);

    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (let i = 0; i < protections.length; i += 1) {
      protections[i].remove();
    }

    this.sheet.protect().setWarningOnly(true).setUnprotectedRanges([this.investmentsTable.getDataRange()]);

    this.sheet.setColumnWidth(4, 320);
    this.sheet.setColumnWidth(5, 150);
    this.sheet.setColumnWidth(6, 150);
    this.sheet.setColumnWidth(8, 150);

    Formatter.applyDataFormat(this.investmentsTable, ['dd/mm/yyyy', '$###,###,##0.00', '', '', '']);
    Formatter.applyDataFormat(this.classificationTable, ['', '$###,###,##0.00']);
    Formatter.applyDataFormat(this.summaryTable, ['$###,###,##0.00']);
  }
}
