class MetadataSheet {
  constructor() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Metadata');
    this.dataTable = new DataTable(this.sheet, 1, 2, 'Metadata', ['Name', 'Value'], 20);
    this.metadata = this.dataTable.getDataAsMap('name');
  }

  getMetadata(key) {
    log.debug(`fetching key ${key}`);
    return this.metadata[key].value;
  }

  updateMetadata(key, value) {
    this.metadata[key].value = value;
  }

  saveMetadata() {
    this.dataTable.setData(Object.values(this.metadata));
  }

  getLowestSheetVersion() {
    // Positions 0 -> 17 holds sheets versions
    let lowest = VERSION;
    const data = this.dataTable.getDataAsArray();
    for (let i = 0; i < 18; i += 1) {
      lowest = Math.min(lowest, data[i].value);
    }
    return lowest;
  }

  updateAllVersions(value) {
    const data = this.dataTable.getDataAsArray();
    for (let i = 0; i < 18; i += 1) {
      data[i].value = value;
    }
    this.dataTable.setData(data);
    this.metadata = this.dataTable.getDataAsMap('name');
  }
}

// function testMetadataSheet() {
//   const sheet = new MetadataSheet();
//   const a = sheet.getMetadata('Categories');
//   sheet.updateMetadata('Categories', 0);
//   const b = sheet.getMetadata('Categories');
//   Logger.log('ABC');
// }
