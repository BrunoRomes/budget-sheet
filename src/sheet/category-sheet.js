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
    log.info('Getting categories');
    return this.dataTable.getDataAsMap('name');
  }

  getCategoriesAsArray() {
    log.info(`Getting ${this.dataTable.getDataAsArray().length} categories`);
    return this.dataTable.getDataAsArray();
  }

  sortCategories() {
    log.info('Sorting categories');
    let data = this.dataTable.getDataAsArray();
    data = data.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.dataTable.setData(data);
  }
}
