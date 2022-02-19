class CapitalOneCsvParser extends BaseCsvParser {
  canParse(content) {
    return content[0].length === 7 && content[0][0] === 'Transaction Date';
  }

  parse(content) {
    // Example: [Transaction Date, Posted Date, Card No., Description, Category, Debit, Credit]
    const transactions = {};
    for (let i = 1; i < content.length; i += 1) {
      const current = content[i];
      const date = current[0].split('-');
      if (date[0] !== '') {
        const description = current[3];
        const debit = parseFloat(current[5]);
        const credit = parseFloat(current[6]);
        const t = new CsvTransaction(
          date[0],
          date[1],
          date[2],
          description,
          debit > 0 ? -debit : credit,
          'CapitalOne Costco',
          ''
        );
        let { key } = t;
        let count = 1;
        while (key in transactions) {
          key = `${t.key}_${count}`;
          count += 1;
        }
        t.key = key;
        transactions[t.key] = t;
      }
    }
    return transactions;
  }
}
