function withErrorHandling(func) {
  const modalHelper = new ModalHelper();
  try {
    modalHelper.showWait('Loading config...');
    UserConfig.loadConfig();

    func(modalHelper);

    modalHelper.close();
  } catch (error) {
    modalHelper.showError();
    throw error;
  }
}

function sanitizeCsvs() {
  withErrorHandling((modalHelper) => {
    const csvHandler = new CsvHandler();
    modalHelper.showWait('Sanitizing CSVs...');
    csvHandler.sanitizeCsvs();
    modalHelper.showWait('Importing transactions from CSVs...');
    csvHandler.importTransactions();
  });
}

function refresh() {
  withErrorHandling((modalHelper) => {
    const sheetName = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    modalHelper.showWait(`Refreshing ${sheetName} ...`);
    if (MONTHS.indexOf(sheetName) >= 0) {
      new CsvHandler().importTransactionsForMonth(MONTHS.indexOf(sheetName));
      const sheet = new MonthSheet(sheetName);
      sheet.refresh();
      sheet.applyFormat();
    } else if (sheetName === 'CashFlow') {
      new CashflowManager().updateCashflow();
    } else if (sheetName === 'Overview') {
      new OverviewSheet().refresh();
    } else if (sheetName === 'Investments') {
      const sheet = new InvestmentSheet();
      sheet.refresh();
      sheet.applyFormat();
    }
  });
}

function init() {
  withErrorHandling((modalHelper) => {
    // Init the spreadsheet: bootstraps and applies migrations.
    // This is slow, it will take a while.
    modalHelper.showWait('Bootstrapping...');
    new Bootstrap().run();
    modalHelper.showWait('Applying migrations...');
    new MigrationManager().run();
    const csvHandler = new CsvHandler();
    modalHelper.showWait('Sanitizing CSVs...');
    csvHandler.sanitizeCsvs();
    modalHelper.showWait('Importing transactions from CSVs...');
    csvHandler.importTransactions();
    sanitizeCsvs(); // TODO: THis can probably be its own trigger, as it does not depend on the spreadsheet schema at all. Loading transactions from the csv into the spreadsheet is another story, though.
    modalHelper.showWait('Refreshing Cashflow...');
    new CashflowManager().updateCashflow();
  });
}

function reset() {
  new Bootstrap().reset();
}

function onOpen(_e) {
  SpreadsheetApp.getUi() // Or DocumentApp, SlidesApp, or FormApp.
    .createMenu('Finance')
    .addItem('Setup Triggers', 'createOnOpenTriggers')
    .addItem('Plaid', 'doPlaid')
    // .addItem('Prepare to import CSVs', 'sanitizeCsvs')
    .addToUi();
}

function doPlaid() {
  const plaid = new PlaidUpdater();
  plaid.sync();
}

function createOnOpenTriggers() {
  // Bootstrapping times out if called in the 'onOpen' function. The workaround it is to setup an "onOpen" installed trigger
  Trigger.deleteAllTriggers();
  Trigger.createSpreadsheetOpenTrigger('init');
  init();
}
