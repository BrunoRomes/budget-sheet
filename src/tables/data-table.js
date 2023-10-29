class DataTable {
  constructor(sheet, startRow, startCol, title, headers, numRows) {
    this.sheet = sheet;
    this.startRow = startRow;
    this.startCol = startCol;
    this.title = title;
    this.headers = headers;
    this.numRows = numRows;
    this.columnCheckboxes = [];
    this.columnValidationRules = [];
    this.includeHeaders = true;
    this.headersKeys = [];
    for (let i = 0; i < headers.length; i += 1) {
      this.headersKeys.push(
        headers[i]
          .trim()
          .toLowerCase()
          .replaceAll(/[,.;?!]/g, '')
          .replaceAll(/\s/g, '_')
      );
    }
  }

  withCheckboxes(columnCheckboxes) {
    this.columnCheckboxes = columnCheckboxes;
    return this;
  }

  withDataValidationRules(columnValidationRules) {
    this.columnValidationRules = columnValidationRules;
    return this;
  }

  withoutHeaders() {
    this.includeHeaders = false;
    return this;
  }

  initialize(initialData) {
    const offset = this.includeHeaders ? 2 : 0;
    this.getTitleRange().setValues([[this.title]]);
    if (this.includeHeaders) {
      this.getHeadersRange().setValues([this.headers]);
    }
    const checkboxRanges = this.getCheckboxesRanges();
    for (let i = 0; i < checkboxRanges.length; i += 1) {
      checkboxRanges[i].insertCheckboxes();
    }

    for (let i = 0; i < this.columnValidationRules.length; i += 1) {
      const columnValidationRule = this.columnValidationRules[i];
      this.sheet
        .getRange(this.startRow + offset + 1, columnValidationRule.getColumn(), this.numRows, 1)
        .setDataValidation(columnValidationRule.getRule());
    }

    if (initialData.length > 0) {
      this.sheet
        .getRange(this.startRow + offset + 1, this.startCol, initialData.length, this.headers.length)
        .setValues(initialData);
    }
    return this;
  }

  clear() {
    this.getTitleRange().clear();
    if (this.includeHeaders) {
      this.getHeadersRange().clear();
    }
    this.getDataRange().clear();
    return this;
  }

  getTitleRange() {
    return this.sheet.getRange(this.startRow, this.startCol, 1, 1);
  }

  getHeadersAndDataRange() {
    if (this.includeHeaders) {
      const offset = 2;
      return this.sheet.getRange(this.startRow + offset, this.startCol, this.numRows + 1, this.headers.length);
    }
    return null;
  }

  getHeadersRange() {
    if (this.includeHeaders) {
      const offset = 2;
      return this.sheet.getRange(this.startRow + offset, this.startCol, 1, this.headers.length);
    }
    return null;
  }

  getDataRange() {
    const offset = this.includeHeaders ? 2 : 0;
    return this.sheet.getRange(this.startRow + offset + 1, this.startCol, this.numRows, this.headers.length);
  }

  getDataRangeColumn(columnOffset) {
    const offset = this.includeHeaders ? 2 : 0;
    return this.sheet.getRange(this.startRow + offset + 1, this.startCol + columnOffset, this.numRows, 1);
  }

  getTopDataRange(numRows) {
    const offset = this.includeHeaders ? 2 : 0;
    return this.sheet.getRange(this.startRow + offset + 1, this.startCol, numRows, this.headers.length);
  }

  getTopDataRangeColumn(numRows, columnOffset) {
    const offset = this.includeHeaders ? 2 : 0;
    return this.sheet.getRange(this.startRow + offset + 1, this.startCol + columnOffset, numRows, 1);
  }

  getCheckboxesRanges() {
    const offset = this.includeHeaders ? 2 : 0;
    const ranges = [];
    for (let i = 0; i < this.columnCheckboxes.length; i += 1) {
      const columnCheckbox = this.columnCheckboxes[i];
      ranges.push(this.sheet.getRange(this.startRow + offset + 1, columnCheckbox.getColumn(), this.numRows, 1));
    }
    return ranges;
  }

  getDataAsArray() {
    const data = [];
    const values = this.getDataRange().getValues();
    for (let i = 0; i < values.length; i += 1) {
      const value = values[i];
      const entry = {};
      for (let j = 0; j < this.headersKeys.length; j += 1) {
        entry[this.headersKeys[j]] = value[j];
      }
      if (entry[this.headersKeys[0]] !== '') {
        data.push(entry);
      }
    }
    return data;
  }

  getDataAsMap(keyColumnName) {
    const data = {};
    const values = this.getDataRange().getValues();
    for (let i = 0; i < values.length; i += 1) {
      const value = values[i];
      const entry = {};
      for (let j = 0; j < this.headersKeys.length; j += 1) {
        entry[this.headersKeys[j]] = value[j];
      }
      const key = entry[keyColumnName];
      if (entry[keyColumnName] !== '') {
        data[key] = entry;
      }
    }
    return data;
  }

  setData(data) {
    this.getDataRange().clearContent();
    if (data.length === 0) {
      return;
    }

    const formattedData = [];
    log.debug(`set data, the headers are ${this.headersKeys}`);
    for (let i = 0; i < data.length; i += 1) {
      const entry = data[i];
      const formattedEntry = [];
      for (let j = 0; j < this.headersKeys.length; j += 1) {
        formattedEntry.push(entry[this.headersKeys[j]]);
      }
      formattedData.push(formattedEntry);
    }
    this.getTopDataRange(formattedData.length).setValues(formattedData);
  }

  setDataColumn(data, columnOffset) {
    this.getDataRangeColumn(columnOffset).clearContent();
    if (data.length === 0) {
      return;
    }

    const formattedData = [];
    for (let i = 0; i < data.length; i += 1) {
      const entry = data[i];
      const formattedEntry = [entry[this.headersKeys[columnOffset]]];
      formattedData.push(formattedEntry);
    }

    this.getTopDataRangeColumn(formattedData.length, columnOffset).setValues(formattedData);
  }
}
