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

function refresh() {
  withErrorHandling((modalHelper) => {
    const sheetName = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    modalHelper.showWait(`Refreshing ${sheetName} ...`);
    if (sheetName === 'All-Transactions') {
      const sheet = new TransactionsSheet();
      sheet.refresh();
      sheet.applyFormat();
    } else if (sheetName === 'CashFlow') {
      new CashflowManager().updateCashflow();
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
    modalHelper.showWait('Refreshing Cashflow...');
    new CashflowManager().updateCashflow();
  });
}

function importCsvs() {
  let nTrans = 0;
  withErrorHandling((modalHelper) => {
    const csvHandler = new CsvHandler();
    modalHelper.showWait('Sanitizing CSVs...');
    csvHandler.sanitizeCsvs(YEAR, true);
    modalHelper.showWait('Importing transactions from CSVs...');
    nTrans = csvHandler.importTransactions(true);
  });
  SpreadsheetApp.getUi().alert(`${nTrans} transactions found.`);
}

function reset() {
  new Bootstrap().reset();
}

function onOpen(_e) {
  SpreadsheetApp.getUi() // Or DocumentApp, SlidesApp, or FormApp.
    .createMenu('Finance')
    .addItem('Plaid Sync', 'doPlaid')
    .addItem('Import CSVs', 'importCsvs')
    .addItem('Classify Transactions', 'classifyTransactions')
    .addToUi();

  SpreadsheetApp.getUi() // Or DocumentApp, SlidesApp, or FormApp.
    .createMenu('Finance-Maintenance')
    .addItem('Setup Triggers', 'createOnOpenTriggers')
    .addItem('Clean Properties', 'cleanProperties')
    .addItem('Delete Keys', 'deleteKeys')
    .addToUi();
}

function cleanProperties() {
  log.info(`${JSON.stringify(PropertiesService.getScriptProperties().getProperties())}`);
  PropertiesService.getScriptProperties().deleteAllProperties();
}

function deleteKeys() {}

function classifyTransactions() {
  new TransactionsSheet().refresh();
}

function doPlaid() {
  let syncResult;
  withErrorHandling((modalHelper) => {
    modalHelper.showWait('Syncing with Plaid...');
    const plaid = new PlaidUpdater();
    syncResult = plaid.sync();
  });
  let errors = '';
  Object.keys(syncResult).forEach((k) => {
    errors += `${k} : ${syncResult[k]}\n\n`;
  });
  SpreadsheetApp.getUi().alert(`${errors}`);
}

function createOnOpenTriggers() {
  // Bootstrapping times out if called in the 'onOpen' function. The workaround it is to setup an "onOpen" installed trigger
  Trigger.deleteAllTriggers();
  Trigger.createSpreadsheetOpenTrigger('init');
  init();
}

function onEdit(e) {
  const startCol = e.range.columnStart;
  const endCol = e.range.columnEnd;
  const startRow = e.range.rowStart;
  const endRow = e.range.rowEnd;
  const newValue = e.value;

  if (e.range.getSheet().getName() === 'All-Transactions') {
    log.debug(`all-transactions change col: ${startCol}:${endCol} row: ${startRow}:${endRow}`);
    if (startCol === endCol && startRow === endRow && startCol === TransactionsSheet.columnCategory) {
      // user changed the category, so the classificator is now 'Manual'
      SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName('All-Transactions')
        .getRange(colToLetter(TransactionsSheet.columnClassificator) + startRow)
        .setValue('Manual');
      const cats = new CategorySheet().getCategories();
      if (cats[newValue].is_investment) {
        SpreadsheetApp.getActiveSpreadsheet()
          .getSheetByName('All-Transactions')
          .getRange(colToLetter(TransactionsSheet.columnIsInvestment) + startRow)
          .setValue('Yes');
      } else {
        SpreadsheetApp.getActiveSpreadsheet()
          .getSheetByName('All-Transactions')
          .getRange(colToLetter(TransactionsSheet.columnIsInvestment) + startRow)
          .setValue('No');
      }
      if (cats[newValue].is_income) {
        SpreadsheetApp.getActiveSpreadsheet()
          .getSheetByName('All-Transactions')
          .getRange(colToLetter(TransactionsSheet.columnIsIncome) + startRow)
          .setValue('Yes');
      } else {
        SpreadsheetApp.getActiveSpreadsheet()
          .getSheetByName('All-Transactions')
          .getRange(colToLetter(TransactionsSheet.columnIsIncome) + startRow)
          .setValue('No');
      }
    }
  }
}
