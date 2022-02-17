class CashflowSheet {
  constructor() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CashFlow');
    const numRows = 200;

    this.summaryTable = new DataTable(this.sheet, 2, 13, 'Config', ['', ''], 2).withoutHeaders().withoutHeaders();

    this.cashFlowTable = new DataTable(
      this.sheet,
      2,
      2,
      'Cash Flow',
      ['Date', 'Description', 'Key', 'Amount'],
      numRows
    );

    this.projectionTable = new DataTable(
      this.sheet,
      2,
      7,
      'Projection',
      ['Date', 'Account $', 'To min in balance', 'Invest $', 'To min in balance after invest'],
      31
    );
  }

  refresh(sources) {
    const current = this.cashFlowTable.getDataAsMap('key');
    for (let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const entries = source.fetch();
      for (let j = 0; j < entries.length; j += 1) {
        const entry = entries[j];
        const exists = entry.key in current;
        if (!exists || entry.replace) {
          current[entry.key] = entry;
        }
      }
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const entries = Object.values(current)
      .filter((entry) => entry.date >= yesterday)
      .sort((a, b) => a.date - b.date);
    this.cashFlowTable.setData(entries);
  }
}
