function sanitizeCsvs() {}

function refreshCashflow() {}

function init() {
  // Init the spreadsheet: bootstraps and applies migrations.
  // This is slow, it will take a while.
  new Bootstrap().run();
  new MigrationManager().run();
  sanitizeCsvs();
  refreshCashflow();
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
