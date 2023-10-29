class CashflowSheetBootstrapper extends BaseSheetBootstrapper {
  constructor() {
    super('CashFlow');
  }

  createSheet() {
    const numRows = 200;
    this.cashFlowTable = new DataTable(
      this.sheet,
      2,
      2,
      'Cash Flow',
      ['Key', 'Date', 'Description', 'Amount'],
      numRows
    ).initialize([]);

    const projectionData = [];
    for (let i = 0; i < 31; i += 1) {
      projectionData.push([
        `=TODAY()+${i + 1}`,
        `=SUMIFS($E$5:$E$383,$C$5:$C$383,">="&$N$4,$C$5:$C$383,"<="&G${i + 5})`,
        `=H${i + 5}-$N$3`,
        '',
        `=I${i + 5}-SUM($J$5:J${i + 5})`,
      ]);
    }
    this.projectionTable = new DataTable(
      this.sheet,
      2,
      7,
      'Projection',
      ['Date', 'Account $', 'To min in balance', 'Invest $', 'To min in balance after invest'],
      31
    ).initialize(projectionData);

    this.summaryTable = new DataTable(this.sheet, 2, 13, 'Config', ['Name', 'Value'], 2).withoutHeaders().initialize([
      ['Min $ in account', 5000.0],
      ['Today', '=TODAY()'],
    ]);

    const image = this.sheet.insertImage(REFRESH_BUTTON_IMAGE, 7, 41);
    image.assignScript('refresh');
  }

  applyFormat() {
    this.sheet.clearFormats();
    this.sheet.setHiddenGridlines(true);
    Formatter.applyDefaultTableFormat(this.summaryTable);
    Formatter.applyDefaultTableFormat(this.cashFlowTable);
    Formatter.applyDefaultTableFormat(this.projectionTable);

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
      .setUnprotectedRanges([this.cashFlowTable.getDataRange(), this.projectionTable.getDataRange()]);

    this.sheet.setColumnWidth(1, 20);
    this.sheet.setColumnWidth(4, 320);
    this.sheet.setColumnWidth(5, 150);
    this.sheet.setColumnWidth(8, 150);
    this.sheet.setColumnWidth(9, 150);
    this.sheet.setColumnWidth(10, 150);
    this.sheet.setColumnWidth(11, 225);

    Formatter.applyDataFormat(this.cashFlowTable, ['', 'dd/mm/yyyy', '', '$###,###,##0.00']);
    Formatter.applyDataFormat(this.projectionTable, [
      'dd/mm/yyyy',
      '$###,###,##0.00',
      '$###,###,##0.00',
      '$###,###,##0.00',
      '$###,###,##0.00',
    ]);

    this.summaryTable.getDataRange().setNumberFormats([
      ['', '$###,###,##0.00'],
      ['', 'dd/mm/yyyy'],
    ]);

    const conditionalFormatRules = [
      SpreadsheetApp.newConditionalFormatRule()
        .whenNumberLessThan(0)
        .setFontColor('#c53929')
        .setBold(true)
        .setRanges([this.sheet.getRange('E:E')])
        .build(),

      SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThan(0)
        .setFontColor('#0b8043')
        .setBold(true)
        .setRanges([this.sheet.getRange('E:E')])
        .build(),
    ];
    this.sheet.setConditionalFormatRules(conditionalFormatRules);
  }
}
