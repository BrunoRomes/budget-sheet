class MetadataSheetBootstrapper extends BaseSheetBootstrapper {
  constructor() {
    super('Metadata');
  }

  createSheet() {
    const versions = [
      ['Metadata', 1],
      ['Categories', 1],
      ['Merchants', 1],
      ['Investments', 1],
      ['CashFlow', 1],
      ['Overview', 1],
    ];
    for (let i = 0; i < MONTHS.length; i += 1) {
      versions.push([MONTHS[i], 1]);
    }

    this.dataTable = new DataTable(this.sheet, 1, 2, 'Metadata', ['Name', 'Value'], 20).initialize(versions);
  }

  applyFormat() {
    this.sheet.clearFormats();
    this.sheet.setHiddenGridlines(true);
    Formatter.applyDefaultTableFormat(this.dataTable);
    this.sheet.hideSheet();
  }
}
