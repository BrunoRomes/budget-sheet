class OverviewSheetBootstrapper extends BaseSheetBootstrapper {
  constructor() {
    super('Overview');
  }

  createSheet() {
    const letterTransAmount = colToLetter(TransactionsSheet.columnAmmount);
    const letterTransDate = colToLetter(TransactionsSheet.columnDate);
    const letterTransIsInvestment = colToLetter(TransactionsSheet.columnIsInvestment);
    const letterTransIsIncome = colToLetter(TransactionsSheet.columnIsIncome);
    const numRows = 200;
    const summaryData = [];
    for (let i = 0; i < MONTHS.length; i += 1) {
      const formulaExpenses = `=sumifs('All-Transactions'!${letterTransAmount}:${letterTransAmount}, 'All-Transactions'!${letterTransIsIncome}:${letterTransIsIncome}, "No", 'All-Transactions'!${letterTransIsInvestment}:${letterTransIsInvestment}, "No", arrayformula(Month('All-Transactions'!${letterTransDate}:${letterTransDate})),${
        i + 1
      } )`;
      const formulaIncome = `=sumifs('All-Transactions'!${letterTransAmount}:${letterTransAmount}, 'All-Transactions'!${letterTransIsIncome}:${letterTransIsIncome}, "Yes", 'All-Transactions'!${letterTransIsInvestment}:${letterTransIsInvestment}, "No", arrayformula(Month('All-Transactions'!${letterTransDate}:${letterTransDate})),${
        i + 1
      } ) * -1`;
      summaryData.push([
        MONTHS[i],
        formulaIncome,
        formulaExpenses,
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

    const monthCatCol = colToLetter(MonthSheet.colExpCategory);
    const monthAmount = colToLetter(MonthSheet.colExpAmount);
    const breakdownData = [];
    for (let i = 0; i < numRows; i += 1) {
      const data = [];
      if (i === 0) {
        data.push(
          `=unique('All-Transactions'!${colToLetter(TransactionsSheet.columnCategory)}4:${colToLetter(
            TransactionsSheet.columnCategory
          )})`
        );
      } else {
        data.push('');
      }
      // TODO: use references on formulas
      for (let j = 0; j < MONTHS.length; j += 1) {
        const form = `=if(isblank($B${
          i + 43
        }), "", sumifs('All-Transactions'!C4:C, 'All-Transactions'!H4:H, "No", 'All-Transactions'!I4:I, "No", arrayformula(Month('All-Transactions'!B4:B)),${
          j + 1
        } , 'All-Transactions'!E4:E, $B${43 + i}))`;

        data.push(form);
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
        .addRange(this.sheet.getRange('B43:B258'))
        .addRange(this.sheet.getRange('O43:O258'))
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

    this.sheet.setColumnWidth(2, 150);
    this.sheet.setColumnWidth(1, 20);
  }
}
