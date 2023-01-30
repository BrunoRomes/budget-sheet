class CategorySheetBootstrapper extends BaseSheetBootstrapper {
  constructor() {
    super('Categories');
  }

  init() {
    super.init();
    const dataStartRow = 4;
    const range = this.sheet.getRange(dataStartRow, 2, 200, 1);
    this.categoryValidationRule = SpreadsheetApp.newDataValidation().requireValueInRange(range).build();
  }

  createSheet() {
    const numRows = 200;
    this.dataTable = new DataTable(this.sheet, 1, 2, 'Categories', ['Name', 'Is Income', 'Is Investment'], numRows)
      .withCheckboxes([new ColumnCheckbox(3), new ColumnCheckbox(4)])
      .initialize([
        ['Other', false, false],
        ['To Remove', false, false],
        ['Beauty', false, false],
        ['Booze', false, false],
        ['Car Insurance', false, false],
        ['Car Maintenance', false, false],
        ['Cellphone', false, false],
        ['Clothing', false, false],
        ['Electronics', false, false],
        ['Entertainment', false, false],
        ['Fees', false, false],
        ['Games', false, false],
        ['Gas', false, false],
        ['Gift', false, false],
        ['Grocery', false, false],
        ['Healthcare', false, false],
        ['House Stuff', false, false],
        ['Housing', false, false],
        ['Insurance', false, false],
        ['Internet Services', false, false],
        ['Learning', false, false],
        ['Parking', false, false],
        ['Paycheck', true, false],
        ['Restaurant', false, false],
        ['RRSP', false, true],
        ['Sports', false, false],
        ['TFSA', false, true],
        ['Transportation', false, false],
        ['Travel', false, false],
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
    this.sheet.setColumnWidth(2, 200);
  }

  getValidationRule() {
    return this.categoryValidationRule;
  }
}
