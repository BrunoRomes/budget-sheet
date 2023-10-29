class InvestmentSheetBootstrapper extends BaseSheetBootstrapper {
  constructor(categoryValidationRule) {
    super('Investments');
    this.categoryValidationRule = categoryValidationRule;
  }

  createSheet() {
    const numRows = 200;
    const letterColDate = colToLetter(TransactionsSheet.columnDate);
    const letterColSource = colToLetter(TransactionsSheet.columnSource);
    const letterColIncome = colToLetter(TransactionsSheet.columnIsIncome);
    const letterColInvestment = colToLetter(TransactionsSheet.columnIsInvestment);
    this.investmentsTable = new DataTable(
      this.sheet,
      2,
      2,
      'Investment',
      ['Date', 'Amount', 'Description', 'Category', 'Classificator', 'Source'],
      numRows
    )
      .withDataValidationRules([new ColumnValidationRule(5, this.categoryValidationRule)])
      .initialize([
        [
          `=FILTER('All-Transactions'!${letterColDate}:${letterColSource}, 'All-Transactions'!${letterColIncome}:${letterColIncome} = "No", 'All-Transactions'!${letterColInvestment}:${letterColInvestment} = "Yes")`,
          '',
          '',
          '',
          '',
          '',
        ],
      ]);

    const classificationRows = [];
    for (let i = 0; i < numRows; i += 1) {
      const formulaCalc = `=if(isblank($I${5 + i}), "", sumif($E$5:$E,$I${5 + i},$C$5:$C))`;
      if (i === 0) {
        classificationRows.push([`=unique($E$5:$E$${numRows})`, formulaCalc]);
      } else {
        classificationRows.push([``, formulaCalc]);
      }
    }
    this.classificationTable = new DataTable(
      this.sheet,
      2,
      9,
      'Investment Classification',
      ['Category', 'Amount'],
      numRows
    ).initialize(classificationRows);

    this.summaryTable = new DataTable(this.sheet, 2, 12, 'Summary', ['Total'], 1).initialize([['=SUM(C5:C)']]);

    const chart = this.sheet
      .newChart()
      .asPieChart()
      .clearRanges()
      .addRange(this.sheet.getRange('I5:I400'))
      .addRange(this.sheet.getRange('J5:J400'))
      .setPosition(7, 11, 0, 0)
      .setTitle('Value VS Category')
      .build();
    this.sheet.insertChart(chart);
  }

  applyFormat() {
    this.sheet.clearFormats();
    this.sheet.setHiddenGridlines(true);
    Formatter.applyDefaultTableFormat(this.summaryTable);
    Formatter.applyDefaultTableFormat(this.investmentsTable);
    Formatter.applyDefaultTableFormat(this.classificationTable);

    this.sheet.protect().setWarningOnly(true);

    this.sheet.setColumnWidth(4, 320);
    this.sheet.setColumnWidth(5, 150);
    this.sheet.setColumnWidth(6, 150);
    this.sheet.setColumnWidth(8, 150);

    this.sheet.setColumnWidth(1, 20);
    this.sheet.setColumnWidth(8, 20);

    Formatter.applyDataFormat(this.investmentsTable, ['dd/mm/yyyy', '$###,###,##0.00', '', '', '', '']);
    Formatter.applyDataFormat(this.classificationTable, ['', '$###,###,##0.00']);
    Formatter.applyDataFormat(this.summaryTable, ['$###,###,##0.00']);
  }
}
