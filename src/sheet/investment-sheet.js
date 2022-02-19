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
    this.refreshCategories();
    this.refreshTransactions();
  }

  refreshCategories() {
    const categories = new CategorySheet()
      .getCategoriesAsArray()
      .filter((entry) => entry.is_investment)
      .map((entry) => {
        const cat = entry;
        cat.category = cat.name;
        return cat;
      });

    this.classificationTable.setDataColumn(categories, 0);
  }

  refreshTransactions() {
    const allInvestment = this.loadAllInvestmentFromMonths();
    const current = this.getInvestments();
    allInvestment.forEach((investment) => {
      if (investment.key in current) {
        Logger.log(`Investment ${investment.key} already seen. Skipping it.`);
      } else {
        current[investment.key] = investment;
      }
    });

    this.setInvestments(Object.values(current));
  }

  loadAllInvestmentFromMonths() {
    let investments = [];
    const categories = new CategorySheet().getCategories();
    MONTHS.forEach((month) => {
      const monthSheet = new MonthSheet(month);
      investments = investments.concat(
        monthSheet.getExpenses().filter((exp) => exp.category in categories && categories[exp.category].is_investment)
      );
    });

    return investments;
  }

  getInvestments() {
    Logger.log('Getting investments.');
    const entries = this.investmentsTable.getDataAsMap('key');
    Logger.log(`Got ${Object.keys(entries).length} investments`);
    return entries;
  }

  setInvestments(investments) {
    Logger.log(`Writing ${investments.length} investments.`);

    this.investmentsTable.setData(investments.sort((a, b) => a.date - b.date));
  }
}

function testInvestmentSheet() {
  const sheet = new InvestmentSheet();
  // var a = sheet.getCategories();
  // var b = sheet.getCategories();
  sheet.applyFormat();
}
