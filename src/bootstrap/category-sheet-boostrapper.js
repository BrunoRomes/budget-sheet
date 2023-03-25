class CategorySheetBootstrapper extends BaseSheetBootstrapper {
  constructor() {
    super('Categories');
    const dataStartRow = 4;
    const range = this.sheet.getRange(dataStartRow, 2, 200, 1);
    this.categoryValidationRule = SpreadsheetApp.newDataValidation().requireValueInRange(range).build();
  }

  createSheet() {
    const numRows = 200;
    this.dataTable = new DataTable(this.sheet, 1, 2, 'Categories', ['Name', 'Is Income', 'Is Investment'], numRows)
      .withCheckboxes([new ColumnCheckbox(3), new ColumnCheckbox(4)])
      .initialize([
        // plaid categories
        ['Income', true, false],
        ['Transfer In', false, false],
        ['Transfer Out', false, false],
        ['Loan Payments', false, false],
        ['Bank Fees', false, false],
        ['Entertainment', false, false],
        ['Food And Drink', false, false],
        ['General Merchandise', false, false],
        ['Home Improvement', false, false],
        ['Medical', false, false],
        ['Personal Care', false, false],
        ['General Services', false, false],
        ['Government And Non Profit', false, false],
        ['Transportation', false, false],
        ['Travel', false, false],
        ['Rent And Utilities', false, false],
        // User categories
        ['Other', false, false],
        ['To Remove', false, false],
        ['Beauty', false, false],
        ['Booze', false, false],
        ['Car Insurance', false, false],
        ['Car Maintenance', false, false],
        ['Communication', false, false],
        ['Clothing', false, false],
        ['Electronics', false, false],
        ['Games', false, false],
        ['Gas', false, false],
        ['Gift', false, false],
        ['Grocery', false, false],
        ['Healthcare', false, false],
        ['Housing', false, false],
        ['House Stuff', false, false],
        ['Insurance', false, false],
        ['Internet Services', false, false],
        ['Learning', false, false],
        ['Parking', false, false],
        ['Paycheck', false, false],
        ['RRSP', false, true],
        ['Sports', false, false],
        ['TFSA', false, true],
        ['Interest', true, false],
        ['Cashback', true, false],
      ]);
  }

  applyFormat() {
    this.sheet.clearFormats();
    this.sheet.setHiddenGridlines(true);
    Formatter.applyDefaultTableFormat(this.dataTable);

    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (let i = 0; i < protections.length; i += 1) {
      protections[i].remove();
    }

    this.sheet.protect().setWarningOnly(true).setUnprotectedRanges([this.dataTable.getDataRange()]);
    this.sheet.setColumnWidth(1, 20);
    this.sheet.setColumnWidth(2, 250);
  }

  getValidationRule() {
    return this.categoryValidationRule;
  }
}
