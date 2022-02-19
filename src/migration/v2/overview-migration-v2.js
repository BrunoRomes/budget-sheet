class OverviewMigrationV2 extends BaseSheetMigration {
  constructor() {
    super('Overview', false);
  }

  prepareSchema(sheet) {
    // Current schema
    this.summaryTable = new DataTable(sheet, 1, 2, 'Summary', ['Month', 'Income', 'Expenses', 'Net', '% Spent'], 14);
    this.numRows = 200;
    const breakdownHeaders = [];
    breakdownHeaders.push('Category');
    for (let i = 0; i < MONTHS.length; i += 1) {
      breakdownHeaders.push(MONTHS[i]);
    }
    breakdownHeaders.push('TOTAL');
    breakdownHeaders.push('Average');

    this.breakdownTable = new DataTable(sheet, 40, 2, 'Breakdown Per Category', breakdownHeaders, this.numRows);
  }

  loadData() {
    // No need to load data. The only operation here is to update the formulas
  }

  applyMigration(_sheet) {
    // No need to change anything. The only change is in the formulas
  }

  writeDataPostMigration() {
    const summaryData = [];
    for (let i = 0; i < MONTHS.length; i += 1) {
      summaryData.push([
        MONTHS[i],
        `=${MONTHS[i]}!$B$4`,
        `=${MONTHS[i]}!$C$4`,
        `=C${i + 4}-D${i + 4}`,
        `=IFERROR(D${i + 4}/C${i + 4},0)`,
      ]);
    }
    summaryData.push(['Average', '=average(C3:C15)', '=average(D3:D15)', '=C16-D16', '=IFERROR(D16/C16,0)']);
    summaryData.push(['Total', '=sum(C3:C15)', '=sum(D3:D15)', '=C17-D17', '=IFERROR(D17/C17,0)']);

    this.summaryTable.initialize(summaryData);

    const breakdownData = [];
    for (let i = 0; i < this.numRows; i += 1) {
      const data = [];
      data.push('');
      for (let j = 0; j < MONTHS.length; j += 1) {
        data.push(`=if(isblank($B${i + 43}), "", sumif(${MONTHS[j]}!$P$24:$P,$B${i + 43},${MONTHS[j]}!$Q$24:$Q))`);
      }
      data.push(`=if(isblank($B${i + 43}), "", sum(IFERROR(C${i + 43}:N${i + 43})))`);
      data.push(`=if(isblank($B${i + 43}), "", IFERROR(AVERAGE(C${i + 43}:N${i + 43}),0))`);

      breakdownData.push(data);
    }

    this.breakdownTable.initialize(breakdownData);
  }
}

// function testOverviewMigrationV2() {
//   const m = new OverviewMigrationV2();
//   m.run();
//   Logger.log('ABC');
// }
