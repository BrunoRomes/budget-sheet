class Bootstrap {
  constructor() {
    this.defaultSheetName = 'Sheet1';
  }

  run() {
    Logger.log('Attempting to run bootstrap');
    new MetadataSheetBootstrapper().bootstrap();

    const categorySheetBoostrapper = new CategorySheetBootstrapper();
    categorySheetBoostrapper.bootstrap();

    const categoryValidationRule = categorySheetBoostrapper.getValidationRule();
    new MerchantSheetBootstrapper(categoryValidationRule).bootstrap();

    for (let i = MONTHS.length - 1; i >= 0; i -= 1) {
      new MonthSheetBootstrapper(MONTHS[i], categoryValidationRule).bootstrap();
    }
    new InvestmentSheetBootstrapper(categoryValidationRule).bootstrap();
    new CashflowSheetBootstrapper().bootstrap();
    new OverviewSheetBootstrapper().bootstrap();

    const defaultSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.defaultSheetName);
    if (defaultSheet != null) {
      SpreadsheetApp.getActiveSpreadsheet().deleteSheet(defaultSheet);
    }
  }

  reset() {
    Logger.log('Reseting all sheets.');
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
