class BaseSheetBootstrapper {
  constructor(sheetName) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    this.sheetName = sheetName;

    if (sheet !== null) {
      log.info(`${sheetName} sheet already exists. Skipping it.`);
      this.alreadyExists = true;
      this.sheet = sheet;
    } else {
      log.info(`Bootstrapping sheet ${sheetName}`);
      this.alreadyExists = false;
      this.sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName, 0);
    }
  }

  bootstrap() {
    if (this.alreadyExists) {
      return;
    }
    this.createSheet();
    this.applyFormat();
    new MetadataSheet().updateMetadata(this.sheetName, 1);
  }

  createSheet() {
    log.info("'createSheet' from BaseSheet called. Nothing will be done here.");
  }

  applyFormat() {
    log.info("'applyFormat' from BaseSheet called. Nothing will be done here.");
  }
}
