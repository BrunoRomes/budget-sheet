class InvestmentSheet {
  constructor() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Investments');
    const numRows = 200;

    // Current schema
    this.investmentsTable = new DataTable(
      this.sheet,
      2,
      2,
      'Investment',
      ['Date', 'Amount', 'Description', 'Category', 'Source', 'Key'],
      numRows
    ).withDataValidationRules([new ColumnValidationRule(5, this.categoryValidationRule)]);

    this.classificationTable = new DataTable(
      this.sheet,
      2,
      9,
      'Investment Classification',
      ['Category', 'Amount'],
      numRows
    );

    this.summaryTable = new DataTable(this.sheet, 2, 12, 'Summary', ['Total'], 1);
  }

  applyFormat() {
    Formatter.removeTableFormat(this.investmentsTable);
    Formatter.removeTableFormat(this.classificationTable);

    Formatter.applyDefaultTableFormat(this.investmentsTable);
    Formatter.applyDefaultTableFormat(this.classificationTable);

    const transactionsFormat = ['dd/mm/yyyy', '$###,###,##0.00', '', '', '', ''];
    Formatter.applyDataFormat(this.investmentsTable, transactionsFormat);

    this.sheet.hideColumns(7);
  }

  refresh() {
    this.applyFormat();
  }
}

function testInvestmentSheet() {
  const sheet = new InvestmentSheet();
  // var a = sheet.getCategories();
  // var b = sheet.getCategories();
  sheet.applyFormat();
}
