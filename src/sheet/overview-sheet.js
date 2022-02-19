class OverviewSheet {
  constructor() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Overview');
    const numRows = 200;

    // Current Schema
    this.summaryTable = new DataTable(
      this.sheet,
      1,
      2,
      'Summary',
      ['Month', 'Income', 'Expenses', 'Net', '% Spent'],
      14
    );

    const breakdownHeaders = [];
    breakdownHeaders.push('Category');
    for (let i = 0; i < MONTHS.length; i += 1) {
      breakdownHeaders.push(MONTHS[i]);
    }
    breakdownHeaders.push('TOTAL');
    breakdownHeaders.push('Average');
    this.breakdownTable = new DataTable(this.sheet, 40, 2, 'Breakdown Per Category', breakdownHeaders, numRows);
  }

  refresh() {
    const categories = new CategorySheet()
      .getCategoriesAsArray()
      .filter((entry) => !entry.is_income && !entry.is_investment)
      .sort((a, b) => (a.name > b.name ? 1 : -1))
      .map((entry) => {
        return { category: entry.name };
      });
    this.breakdownTable.setDataColumn(categories, 0);
  }
}
