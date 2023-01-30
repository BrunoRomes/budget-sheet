class Bootstrap {
  constructor() {
    this.defaultSheetName = 'Sheet1';
  }

  getSheets() {
    Logger.log('Getting all sheets to bootstrap');
    const sheets = [];
    sheets.push(new MetadataSheetBootstrapper());

    const categorySheetBoostrapper = new CategorySheetBootstrapper();
    sheets.push(categorySheetBoostrapper);

    const categoryValidationRule = categorySheetBoostrapper.getValidationRule();
    sheets.push(new MerchantSheetBootstrapper(categoryValidationRule));

    for (let i = MONTHS.length - 1; i >= 0; i -= 1) {
      sheets.push(new MonthSheetBootstrapper(MONTHS[i], categoryValidationRule));
    }
    sheets.push(new InvestmentSheetBootstrapper(categoryValidationRule));
    sheets.push(new CashflowSheetBootstrapper());
    sheets.push(new OverviewSheetBootstrapper());

    return sheets;
  }

  initSheets() {
    Logger.log('Attempting to run bootstrap');
    const sheets = this.getSheets();
    for (let i = 0; i < sheets.length; i += 1) {
      sheets[i].init();
    }

    const defaultSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.defaultSheetName);
    if (defaultSheet != null) {
      SpreadsheetApp.getActiveSpreadsheet().deleteSheet(defaultSheet);
    }

    return sheets;
  }

  runForSheet(sheetName) {
    const sheets = this.getSheets();
    for (let i = 0; i < sheets.length; i += 1) {
      if (sheets[i].getSheetName() === sheetName) {
        sheets[i].init();
        sheets[i].bootstrap(true);
      }
    }
  }

  run() {
    Logger.log('Attempting to run bootstrap');
    const sheets = this.initSheets();
    for (let i = 0; i < sheets.length; i += 1) {
      sheets[i].bootstrap(false);
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
