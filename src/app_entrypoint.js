function sanitizeCsvs() {}

function refreshCashflow() {
  new CashflowManager().updateCashflow();
}

function init() {
  const modalHelper = new ModalHelper();
  modalHelper.showWait('Loading config...');
  UserConfig.loadConfig();

  // Init the spreadsheet: bootstraps and applies migrations.
  // This is slow, it will take a while.
  modalHelper.showWait('Bootstrapping...');
  new Bootstrap().run();
  modalHelper.showWait('Applying migrations...');
  new MigrationManager().run();
  modalHelper.showWait('Sanitizing CSVs...');
  sanitizeCsvs(); // TODO: THis can probably be its own trigger, as it does not depend on the spreadsheet schema at all. Loading transactions from the csv into the spreadsheet is another story, though.
  modalHelper.showWait('Refreshing Cashflow...');
  refreshCashflow();
  modalHelper.close();
}

function reset() {
  new Bootstrap().reset();
}

function testApplyMigration() {
  // new MigrationManager().applyMigrations(<STARTING_VERSION>,<TARGET_VERSION>);
}

function onOpen(_e) {
  SpreadsheetApp.getUi() // Or DocumentApp, SlidesApp, or FormApp.
    .createMenu('Finance')
    .addItem('Setup Triggers', 'createOnOpenTriggers')
    .addItem('Prepare to import CSVs', 'sanitizeCsvs')
    .addToUi();
}

function createOnOpenTriggers() {
  // Bootstrapping times out if called in the 'onOpen' function. The workaround it is to setup an "onOpen" installed trigger
  Trigger.deleteAllTriggers();
  Trigger.createSpreadsheetOpenTrigger('init');
}
