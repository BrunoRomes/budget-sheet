class Bootstrap {
  constructor() {
    this.defaultSheetName = 'Sheet1';
  }

  run() {
    log.info('Attempting to run bootstrap');
    new MetadataSheetBootstrapper().bootstrap();

    const categorySheetBoostrapper = new CategorySheetBootstrapper();
    categorySheetBoostrapper.bootstrap();

    const categoryValidationRule = categorySheetBoostrapper.getValidationRule();
    new MerchantSheetBootstrapper(categoryValidationRule).bootstrap();

    new AllTransactionsSheetBootstrapper(categoryValidationRule).bootstrap();

    new InvestmentSheetBootstrapper(categoryValidationRule).bootstrap();
    new CashflowSheetBootstrapper().bootstrap();
    new MonthSheetBootstrapper('Months').bootstrap();
    new OverviewSheetBootstrapper().bootstrap();

    const defaultSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.defaultSheetName);
    if (defaultSheet != null) {
      SpreadsheetApp.getActiveSpreadsheet().deleteSheet(defaultSheet);
    }
  }

  reset() {
    log.info('Reseting all sheets.');
    const defaultSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.defaultSheetName);
    if (defaultSheet == null) {
      SpreadsheetApp.getActiveSpreadsheet().insertSheet(this.defaultSheetName);
    }
    const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    const numSheets = sheets.length;
    for (let i = 0; i < numSheets; i += 1) {
      const sheet = sheets[i];
      if (sheet.getName() !== this.defaultSheetName) {
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
      }
    }

    this.run();
  }
}
