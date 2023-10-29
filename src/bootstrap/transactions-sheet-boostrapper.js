class AllTransactionsSheetBootstrapper extends BaseSheetBootstrapper {
  constructor(categoryValidationRule) {
    super('All-Transactions');
    this.categoryValidationRule = categoryValidationRule;
  }

  createSheet() {
    const numRows = 2000;
    this.mainTable = new DataTable(
      this.sheet,
      1,
      TransactionsSheet.columnDate,
      'All-Transactions',
      TransactionsSheet.headers,
      numRows
    )
      .withDataValidationRules([
        new ColumnValidationRule(TransactionsSheet.columnCategory, this.categoryValidationRule),
      ])
      .initialize([]);

    if (this.mainTable.getHeadersAndDataRange().getFilter() === null) {
      this.mainTable.getHeadersAndDataRange().createFilter();
    }
  }

  applyFormat() {
    this.sheet.clearFormats();
    this.sheet.setHiddenGridlines(true);
    Formatter.applyDefaultTableFormat(this.mainTable);

    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (let i = 0; i < protections.length; i += 1) {
      protections[i].remove();
    }

    this.sheet
      .protect()
      .setWarningOnly(true)
      .setUnprotectedRanges([this.mainTable.getDataRange(), this.mainTable.getTitleRange()]);

    this.sheet.setColumnWidth(1, 20);
    this.sheet.setColumnWidth(TransactionsSheet.columnDescription, 250);
    this.sheet.setColumnWidth(TransactionsSheet.columnCategory, 150);
    this.sheet.setColumnWidth(TransactionsSheet.columnClassificator, 100);
    this.sheet.setColumnWidth(TransactionsSheet.columnIsIncome, 100);
    this.sheet.setColumnWidth(TransactionsSheet.columnSource, 100);
    this.sheet.setColumnWidth(TransactionsSheet.columnKey, 250);

    this.sheet.setFrozenRows(3);

    Formatter.applyDataFormat(this.mainTable, TransactionsSheet.transactionsFormat);

    const conditionalFormatRules = [
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('Other')
        .setFontColor('#F46524')
        .setBold(true)
        .setRanges([this.mainTable.getDataRange()])
        .build(),
    ];
    this.sheet.setConditionalFormatRules(conditionalFormatRules);
  }
}
