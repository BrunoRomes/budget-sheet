class CategorySheet {
  constructor() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Categories');
    const numRows = 200;
    // Current schema
    this.dataTable = new DataTable(
      this.sheet,
      1,
      2,
      'Categories',
      ['Name', 'Is Income', 'Is Investment'],
      numRows
    ).withCheckboxes([new ColumnCheckbox(3), new ColumnCheckbox(4)]);
  }

  getCategories() {
    Logger.log('Getting categories');
    return this.dataTable.getDataAsMap('name');
  }

  getCategoriesAsArray() {
    Logger.log('Getting categories');
    return this.dataTable.getDataAsArray();
  }

  sortCategories() {
    Logger.log('Sorting categories');
    let data = this.dataTable.getDataAsArray();
    data = data.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.dataTable.setData(data);
  }
}

// function testCategorySheet() {
//   const sheet = new CategorySheet();
//   const a = sheet.getCategories();
//   sheet.sortCategories();
//   const b = sheet.getCategories();
//   Logger.log('ABC');
// }
