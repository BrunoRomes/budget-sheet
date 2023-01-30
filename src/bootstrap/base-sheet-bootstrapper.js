class BaseSheetBootstrapper {
  constructor(sheetName) {
    this.sheetName = sheetName;
  }

  init() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.sheetName);

    if (sheet !== null) {
      Logger.log(`${this.sheetName} sheet already exists. Skipping it.`);
      this.alreadyExists = true;
      this.sheet = sheet;
    } else {
      Logger.log(`Bootstrapping sheet ${this.sheetName}`);
      this.alreadyExists = false;
      this.sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(this.sheetName, 0);
    }
  }

  getSheetName() {
    return this.sheetName;
  }

  bootstrap(force) {
    if (force === false && this.alreadyExists) {
      return;
    }
    this.createSheet();
    this.applyFormat();
    new MetadataSheet().updateMetadata(this.sheetName, 1);
  }

  createSheet() {
    Logger.log("'createSheet' from BaseSheet called. Nothing will be done here.");
  }

  applyFormat() {
    Logger.log("'applyFormat' from BaseSheet called. Nothing will be done here.");
  }
}
