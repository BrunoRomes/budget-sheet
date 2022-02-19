class ScotiabankCardCsvParser extends BaseCsvParser {
  canParse(content) {
    return content[0].length === 3;
  }

  parse(content) {
    // Example: [11/24/2021, ICBC #28794              BURNABY      BC , -1488.00]
    const transactions = {};
    for (let i = 0; i < content.length; i += 1) {
      const current = content[i];
      const date = current[0].split('/');
      const description = current[1];
      const value = parseFloat(current[2]);
      const t = new CsvTransaction(date[2], date[0], date[1], description, value, 'Scotiabank', '');
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
