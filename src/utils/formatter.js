class Formatter {
  static applyDefaultTableFormat(dataTable) {
    const titleRange = dataTable.getTitleRange();
    titleRange.setFontColor('#f46524');
    titleRange.setFontSize(18);
    titleRange.setFontFamily('Raleway');
    titleRange.setFontWeight('bold');

    const headersRange = dataTable.getHeadersRange();
    if (headersRange != null) {
      headersRange.setFontColor('#334960');
      headersRange.setFontSize(12);
      headersRange.setFontFamily('Lato');
      headersRange.setFontWeight('bold');
      headersRange.setHorizontalAlignment('center');
      headersRange.setBorder(true, false, true, false, false, false);
      headersRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, true);
    }

    const dataRange = dataTable.getDataRange();
    dataRange.setFontColor('black');
    dataRange.setFontSize(10);
    dataRange.setFontFamily('Lato');
    dataRange.setHorizontalAlignment('center');
    dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
    dataRange.setWrap(true);

    const checkboxRanges = dataTable.getCheckboxesRanges();
    for (let i = 0; i < checkboxRanges.length; i += 1) {
      checkboxRanges[i].setFontColor('gray');
    }
  }

  static applyDataFormat(dataTable, format) {
    const range = dataTable.getDataRange();
    const numRows = range.getNumRows();
    const rangeFormat = [];
    for (let i = 0; i < numRows; i += 1) {
      rangeFormat.push(format);
    }
    range.setNumberFormats(rangeFormat);
  }

  static removeTableFormat(dataTable) {
    dataTable.getTitleRange().clearFormat();

    const headersRange = dataTable.getHeadersRange();
    if (headersRange != null) {
      headersRange.clearFormat();
    }

    dataTable.getDataRange().clearFormat();
  }
}
