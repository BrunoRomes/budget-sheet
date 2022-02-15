class MonthSheetBootstrapper extends BaseSheetBootstrapper {
  constructor(month, categoryValidationRule) {
    super(month);
    this.categoryValidationRule = categoryValidationRule;
  }

  createSheet() {
    const numRows = 200;
    this.summaryTable = new DataTable(this.sheet, 1, 2, 'Summary', ['Category', 'Total'], 3)
      .withoutHeaders()
      .initialize([
        ['Income', '=SUM(C24:C)'],
        ['Expenses', '=SUM(I24:I)-C4'],
        ['Investment', 0.0],
      ]);

    this.incomeTable = new DataTable(
      this.sheet,
      21,
      2,
      'Income',
      ['Date', 'Amount', 'Description', 'Category', 'Source'],
      numRows
    )
      .withDataValidationRules([new ColumnValidationRule(5, this.categoryValidationRule)])
      .initialize([]);

    this.expensesTable = new DataTable(
      this.sheet,
      21,
      8,
      'Expenses',
      ['Date', 'Amount', 'Description', 'Category', 'Source'],
      numRows
    )
      .withDataValidationRules([new ColumnValidationRule(11, this.categoryValidationRule)])
      .initialize([]);

    const classificationRows = [];
    for (let i = 0; i < 200; i += 1) {
      classificationRows.push(['', `=if(isblank($N${24 + i}), "", sumif($K$24:$K,$N${24 + i},$I$24:$I))`]);
    }
    this.classificationTable = new DataTable(
      this.sheet,
      21,
      14,
      'Expenses Classification',
      ['Category', 'Amount'],
      numRows
    ).initialize(classificationRows);

    const chart = this.sheet
      .newChart()
      .asPieChart()
      .clearRanges()
      .addRange(this.sheet.getRange('N24:N400'))
      .addRange(this.sheet.getRange('O24:O400'))
      .setPosition(2, 10, 0, 0)
      .setTitle('Value VS Category')
      .build();
    this.sheet.insertChart(chart);
  }

  applyFormat() {
    this.sheet.clearFormats();
    this.sheet.setHiddenGridlines(true);
    Formatter.applyDefaultTableFormat(this.summaryTable);
    Formatter.applyDefaultTableFormat(this.incomeTable);
    Formatter.applyDefaultTableFormat(this.expensesTable);
    Formatter.applyDefaultTableFormat(this.classificationTable);

    const dataRange = this.summaryTable.getDataRange();
    dataRange.getBandings()[0].remove();
    dataRange.applyColumnBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);

    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (let i = 0; i < protections.length; i += 1) {
      protections[i].remove();
    }

    this.sheet
      .protect()
      .setWarningOnly(true)
      .setUnprotectedRanges([this.incomeTable.getDataRange(), this.expensesTable.getDataRange()]);

    this.sheet.setColumnWidth(4, 320);
    this.sheet.setColumnWidth(5, 150);
    this.sheet.setColumnWidth(6, 150);
    this.sheet.setColumnWidth(10, 400);
    this.sheet.setColumnWidth(11, 150);
    this.sheet.setColumnWidth(12, 150);
    this.sheet.setColumnWidth(14, 150);

    const transactionsFormat = ['dd/mm/yyyy', '$###,###,##0.00', '', '', ''];
    Formatter.applyDataFormat(this.incomeTable, transactionsFormat);
    Formatter.applyDataFormat(this.expensesTable, transactionsFormat);
    Formatter.applyDataFormat(this.classificationTable, ['', '$###,###,##0.00']);
    Formatter.applyDataFormat(this.summaryTable, ['', '$###,###,##0.00']);

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
}
