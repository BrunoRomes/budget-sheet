class ScotiabankCheckingsCsvParser extends BaseCsvParser {
  canParse(content) {
    return content[0].length === 5;
  }

  parse(content) {
    // Example: [1/13/2022	-113	-	Miscellaneous Payment	EQUITABLE BANK        ]
    const transactions = {};
    for (let i = 0; i < content.length; i += 1) {
      const current = content[i];
      const date = current[0].split('/');
      const description = current[4].trim() === '' ? current[3] : current[4].trim();
      const value = parseFloat(current[1]);
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
