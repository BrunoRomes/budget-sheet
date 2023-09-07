class BrimCardCsvParser extends BaseCsvParser {
  canParse(content) {
    const canParse =
      (content[0].length === 7 || content[0].length === 8) &&
      content[0][0] === 'No' &&
      content[0][1] === 'Transaction Date';
    log.info(`BrimCardParser::canParse? ${canParse}`);
    return canParse;
  }

  parse(content) {
    // Example: 2, 2022-02-25, -, "Best Buy #973", You, 89.59, -, Tech

    const transactions = {};
    for (let i = 1; i < content.length; i += 1) {
      const current = content[i];
      const date = current[1].split('-');
      const description = current[3];
      let value = current[4];
      value = parseFloat(value);
      const trans = new CsvTransaction(date[0], date[1], date[2], description, -value, 'Brim Card', '');
      let { key } = trans;
      let count = 1;
      while (key in transactions) {
        key = `${trans.key}_${count}`;
        count += 1;
      }
      trans.key = key;
      transactions[trans.key] = trans;
    }
    return transactions;
  }

  getDelim() {
    return ',';
  }
}
