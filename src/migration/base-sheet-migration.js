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
      log.info('Cloning Sheet');
      const copiedSheet = sheet.copyTo(spreadsheet);
      copiedSheet.hideSheet();
      try {
        // Attempt the whole migration in a clone of the sheet first
        log.info('Attempting migration on cloned sheet');
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
      log.info('Migration on cloned sheet succeeded. Applying migration in original sheet');
    } else {
      log.info('Skipping migration on cloned sheet.');
    }
    this.prepareSchema(sheet);
    this.loadData();
    this.applyMigration(sheet);
    SpreadsheetApp.flush();
    this.writeDataPostMigration();
    SpreadsheetApp.flush();
    log.info('Migration succeeded');
  }

  prepareSchema(_sheet) {}

  loadData() {
    log.info('No Data loaded');
  }

  applyMigration(_sheet) {}

  writeDataPostMigration() {
    log.info('No Data written');
  }
}
