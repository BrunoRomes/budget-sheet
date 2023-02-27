class MonthSheetBootstrapper extends BaseSheetBootstrapper {
  createSheet() {
    const monthIndex = MONTHS.indexOf(this.sheetName);

    const rule1 = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'])
      .build();
    this.sheet.getRange('C1').setDataValidation(rule1);
    this.sheet.getRange('C1').setValue('Jan');

    const numRows = 200;
    const letterExpensesAmount = colToLetter(MonthSheet.colExpAmount);
    const letterIncomeAmount = colToLetter(MonthSheet.colIncAmount);
    const letterTransAmount = colToLetter(TransactionsSheet.columnAmmount);
    const letterTransDate = colToLetter(TransactionsSheet.columnDate);
    const letterTransIsInvestment = colToLetter(TransactionsSheet.columnIsInvestment);
    this.summaryTable = new DataTable(this.sheet, 1, 2, 'Summary', ['Category', 'Total'], 3)
      .withoutHeaders()
      .initialize([
        ['Income', `=SUM(${letterIncomeAmount}24:${letterIncomeAmount})`],
        ['Expenses', `=SUM(${letterExpensesAmount}24:${letterExpensesAmount})`],
        [
          'Investment',
          `=sumifs('All-Transactions'!${letterTransAmount}:${letterTransAmount}, 'All-Transactions'!${letterTransIsInvestment}:${letterTransIsInvestment}, "Yes", arrayformula(Month('All-Transactions'!${letterTransDate}:${letterTransDate})),month($C$1&1) )`,
        ],
      ]);

    const letterColDate = colToLetter(TransactionsSheet.columnDate);
    const letterColSource = colToLetter(TransactionsSheet.columnSource);
    const letterColIncome = colToLetter(TransactionsSheet.columnIsIncome);
    const letterColInvestment = colToLetter(TransactionsSheet.columnIsInvestment);

    this.incomeTable = new DataTable(
      this.sheet,
      21,
      9,
      'Income',
      ['Date', 'Amount', 'Description', 'Category', 'Classificator', 'Source'],
      numRows
    )
      .withDataValidationRules([new ColumnValidationRule(5, this.categoryValidationRule)])
      .initialize([
        [
          `=FILTER('All-Transactions'!${letterColDate}:${letterColSource}, Month('All-Transactions'!${letterColDate}:${letterColDate}
          ) = month($C$1&2), 'All-Transactions'!${letterColIncome}:${letterColIncome} = "Yes", 'All-Transactions'!${letterColInvestment}:${letterColInvestment} = "No")`,
          '',
          '',
          '',
          '',
          '',
        ],
      ]);
    this.expensesTable = new DataTable(
      this.sheet,
      21,
      2,
      'Expenses',
      ['Date', 'Amount', 'Description', 'Category', 'Classificator', 'Source'],
      numRows
    )
      .withDataValidationRules([new ColumnValidationRule(11, this.categoryValidationRule)])
      .initialize([
        [
          `=FILTER('All-Transactions'!${letterColDate}:${letterColSource}, Month('All-Transactions'!${letterColDate}:${colToLetter(
            TransactionsSheet.columnDate
          )}) = month($C$1&1), 'All-Transactions'!${letterColIncome}:${letterColIncome} = "No", 'All-Transactions'!${letterColInvestment}:${letterColInvestment} = "No")`,
          '',
          '',
          '',
          '',
          '',
        ],
      ]);

    const classificationRows = [];
    for (let i = 0; i < numRows; i += 1) {
      const formulaCalc = `=if(isblank($P${24 + i}), "", sumif($E$24:$E,$P${24 + i},$C$24:$C))`;
      if (i === 0) {
        classificationRows.push([`=unique($E$24:$E$${numRows})`, formulaCalc]);
      } else {
        classificationRows.push([``, formulaCalc]);
      }
    }
    this.classificationTable = new DataTable(
      this.sheet,
      21,
      16,
      'Expenses Classification',
      ['Category', 'Amount'],
      numRows
    ).initialize(classificationRows);

    const chart = this.sheet
      .newChart()
      .asPieChart()
      .clearRanges()
      .addRange(this.sheet.getRange('P24:P400'))
      .addRange(this.sheet.getRange('Q24:Q400'))
      .setPosition(2, 5, 0, 0)
      .setTitle('Value VS Category')
      .build();
    this.sheet.insertChart(chart);
  }

  applyFormat() {
    this.sheet.clearFormats();
    this.sheet.setHiddenGridlines(true);
    Formatter.applyDefaultTableFormat(this.summaryTable);
    Formatter.applyDefaultTableFormat(this.incomeTable);
    Formatter.applyDefaultTableFormat(this.expensesTable);
    Formatter.applyDefaultTableFormat(this.classificationTable);

    const dataRange = this.summaryTable.getDataRange();
    dataRange.getBandings()[0].remove();
    dataRange.applyColumnBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);

    const protections = this.sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (let i = 0; i < protections.length; i += 1) {
      protections[i].remove();
    }

    this.sheet.getRange('C1').setFontColor('#FF0000');
    this.sheet.getRange('C1').setFontSize(18);
    this.sheet.getRange('C1').setFontFamily('Raleway');
    this.sheet.getRange('C1').setFontWeight('bold');
    this.sheet.getRange('C1').setHorizontalAlignment('center');

    this.sheet
      .protect()
      .setWarningOnly(true)
      .setUnprotectedRanges([this.sheet.getRange('C1')]);

    this.sheet.setColumnWidth(2, 120);
    this.sheet.setColumnWidth(4, 320);
    this.sheet.setColumnWidth(5, 150);
    this.sheet.setColumnWidth(6, 150);
    this.sheet.setColumnWidth(11, 400);
    this.sheet.setColumnWidth(12, 150);
    this.sheet.setColumnWidth(13, 150);
    this.sheet.setColumnWidth(1, 20);
    this.sheet.setColumnWidth(8, 20);
    this.sheet.setColumnWidth(15, 20);

    const transactionsFormat = ['dd/mm/yyyy', '$###,###,##0.00', '', '', '', ''];
    Formatter.applyDataFormat(this.incomeTable, transactionsFormat);
    Formatter.applyDataFormat(this.expensesTable, transactionsFormat);
    Formatter.applyDataFormat(this.classificationTable, ['', '$###,###,##0.00']);
    Formatter.applyDataFormat(this.summaryTable, ['', '$###,###,##0.00']);
  }
}
