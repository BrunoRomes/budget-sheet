class TangerineCsvParser extends BaseCsvParser {
  canParse(content) {
    return content[0].length === 5 && (content[0][0] === 'Date' || content[0][0] === 'Transaction date');
  }

  parse(content) {
    // Example: [Date, Transaction, Name, Memo, Amount]
    const transactions = {};
    for (let i = 1; i < content.length; i += 1) {
      const current = content[i];
      const date = current[0].split('/');
      const description = current[2];
      const value = parseFloat(current[4]);
      const t = new CsvTransaction(date[2], date[0], date[1], description, value, 'Tangerine');
      let { key } = t;
      let count = 1;
      while (key in transactions) {
        key = `${t.key}_${count}`;
        count += 1;
      }
      t.key = key;
      transactions[t.key] = t;
    }
    return transactions;
  }
}
