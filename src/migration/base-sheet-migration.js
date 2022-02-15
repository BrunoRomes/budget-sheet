class BaseSheetMigration {
  constructor(sheetName, skipCloneSheet) {
    this.sheetName = sheetName;
    this.skipCloneSheet = skipCloneSheet;
  }

  getSheetName() {
    return this.sheetName;
  }

  run() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(this.sheetName);
    if (!this.skipCloneSheet) {
      Logger.log('Cloning Sheet');
      const copiedSheet = sheet.copyTo(spreadsheet);
      copiedSheet.hideSheet();
      try {
        // Attempt the whole migration in a clone of the sheet first
        Logger.log('Attempting migration on cloned sheet');
        this.prepareSchema(copiedSheet);
        this.loadData();
        this.applyMigration(copiedSheet);
        SpreadsheetApp.flush();
        this.writeDataPostMigration();
        SpreadsheetApp.flush();
      } finally {
        // Clean up by deleting the clone sheet
        SpreadsheetApp.flush();
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(copiedSheet);
        SpreadsheetApp.flush();
      }
      Logger.log('Migration on cloned sheet succeeded. Applying migration in original sheet');
    } else {
      Logger.log('Skipping migration on cloned sheet.');
    }
    this.prepareSchema(sheet);
    this.loadData();
    this.applyMigration(sheet);
    SpreadsheetApp.flush();
    this.writeDataPostMigration();
    SpreadsheetApp.flush();
    Logger.log('Migration succeeded');
  }

  prepareSchema(_sheet) {}

  loadData() {
    Logger.log('No Data loaded');
  }

  applyMigration(_sheet) {}

  writeDataPostMigration() {
    Logger.log('No Data written');
  }
}
