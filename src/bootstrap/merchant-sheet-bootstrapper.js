class MerchantSheetBootstrapper extends BaseSheetBootstrapper {
  constructor(categoryValidationRule) {
    super('Merchants');
    this.categoryValidationRule = categoryValidationRule;
  }

  createSheet() {
    const numRows = 200;
    this.dataTable = new DataTable(this.sheet, 1, 2, 'Merchants', ['Name', 'Category'], numRows)
      .withDataValidationRules([new ColumnValidationRule(3, this.categoryValidationRule)])
      .initialize([
        ['Restaurant', 'Restaurant'],
        ['SUPERMARKET', 'Grocery'],
        ['chevron', 'Gas'],
        ['mobil@', 'Gas'],
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
    this.sheet.setColumnWidth(2, 350);
    this.sheet.setColumnWidth(3, 200);
  }
}
