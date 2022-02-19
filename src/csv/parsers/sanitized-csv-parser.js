class SanitizedCsvParser extends BaseCsvParser {
  canParse(content) {
    return content[0].length === 8 && content[0][0] === 'Key';
  }

  parse(content) {
    // Example: [Key,Source,Year,Month,Day,Description,Value,YearMonth]
    const transactions = {};
    for (let i = 1; i < content.length; i += 1) {
      const current = content[i];
      const key = current[0];
      if (key !== '') {
        const source = current[1];
        const year = current[2];
        const month = current[3];
        const day = current[4];
        const description = current[5];
        const value = parseFloat(current[6]);
        const t = new CsvTransaction(year, month, day, description, value, source, key);
        transactions[t.key] = t;
      }
    }
    return transactions;
  }
}
