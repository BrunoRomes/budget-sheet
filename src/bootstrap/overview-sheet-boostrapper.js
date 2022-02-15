class OverviewSheetBootstrapper extends BaseSheetBootstrapper {
  constructor() {
    super('Overview');
  }

  createSheet() {
    const numRows = 200;
    const summaryData = [];
    for (let i = 0; i < MONTHS.length; i += 1) {
      summaryData.push([
        MONTHS[i],
        `=${MONTHS[i]}!$C$2`,
        `=${MONTHS[i]}!$C$3`,
        `=C${i + 4}-D${i + 4}`,
        `=IFERROR(D${i + 4}/C${i + 4},0)`,
      ]);
    }
    summaryData.push(['Average', '=average(C3:C15)', '=average(D3:D15)', '=C16-D16', '=IFERROR(D16/C16,0)']);
    summaryData.push(['Total', '=sum(C3:C15)', '=sum(D3:D15)', '=C17-D17', '=IFERROR(D17/C17,0)']);
    this.summaryTable = new DataTable(
      this.sheet,
      1,
      2,
      'Summary',
      ['Month', 'Income', 'Expenses', 'Net', '% Spent'],
      14
    ).initialize(summaryData);

    const breakdownHeaders = [];
    breakdownHeaders.push('Category');
    for (let i = 0; i < MONTHS.length; i += 1) {
      breakdownHeaders.push(MONTHS[i]);
    }
    breakdownHeaders.push('TOTAL');
    breakdownHeaders.push('Average');

    const breakdownData = [];
    for (let i = 0; i < numRows; i += 1) {
      const data = [];
      data.push('');
      for (let j = 0; j < MONTHS.length; j += 1) {
        data.push(`=if(isblank($B${i + 43}), "", sumif(${MONTHS[j]}!$N$24:$N,$B${i + 43},${MONTHS[j]}!$O$24:$O))`);
      }
      data.push(`=if(isblank($B${i + 43}), "", sum(IFERROR(C${i + 43}:N${i + 43})))`);
      data.push(`=if(isblank($B${i + 43}), "", IFERROR(AVERAGE(C${i + 43}:N${i + 43}),0))`);

      breakdownData.push(data);
    }

    this.breakdownTable = new DataTable(
      this.sheet,
      40,
      2,
      'Breakdown Per Category',
      breakdownHeaders,
      numRows
    ).initialize(breakdownData);

    this.sheet.insertChart(
      this.sheet
        .newChart()
        .asAreaChart()
        .clearRanges()
        .addRange(this.sheet.getRange('B4:B15'))
        .addRange(this.sheet.getRange('C4:C15'))
        .addRange(this.sheet.getRange('D4:D15'))
        .setPosition(1, 8, 0, 0)
        .setTitle('Income VS Expense')
        .build()
    );

    this.sheet.insertChart(
      this.sheet
        .newChart()
        .asColumnChart()
        .clearRanges()
        .addRange(this.sheet.getRange('B4:B16'))
        .addRange(this.sheet.getRange('E4:E16'))
        .setPosition(19, 2, 0, 0)
        .setTitle('Net VS Month')
        .build()
    );

    this.sheet.insertChart(
      this.sheet
        .newChart()
        .asPieChart()
        .clearRanges()
        .addRange(this.sheet.getRange('B58:B258'))
        .addRange(this.sheet.getRange('O58:O258'))
        .setPosition(19, 8, 0, 0)
        .setTitle('Total VS Category')
        .build()
    );
  }

  applyFormat() {
    this.sheet.clearFormats();
    this.sheet.setHiddenGridlines(true);
    Formatter.applyDefaultTableFormat(this.summaryTable);
    Formatter.applyDefaultTableFormat(this.breakdownTable);

    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (let i = 0; i < protections.length; i += 1) {
      protections[i].remove();
    }

    this.sheet.protect().setWarningOnly(true);

    Formatter.applyDataFormat(this.summaryTable, [
      '',
      '$###,###,##0.00',
      '$###,###,##0.00',
      '$###,###,##0.00',
      '##0.## %',
    ]);
    const breakdownFormat = [''];
    for (let i = 0; i < 14; i += 1) {
      breakdownFormat.push('$###,###,##0.00');
    }
    Formatter.applyDataFormat(this.breakdownTable, breakdownFormat);
  }
}
