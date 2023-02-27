class MerchantSheet {
  constructor() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Merchants');
    const numRows = 200;
    this.dataTable = new DataTable(this.sheet, 1, 2, 'Merchants', ['Name', 'Category'], numRows);
  }

  getMerchants() {
    log.info('Getting Merchants');
    return this.dataTable.getDataAsArray();
  }
}

// function testMerchantSheet() {
//   const sheet = new MerchantSheet();
//   const a = sheet.getMerchants();
//   // var b = sheet.getCategories();
//   log.info('ABC');
// }
