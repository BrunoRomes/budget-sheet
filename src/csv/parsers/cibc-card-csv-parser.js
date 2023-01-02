class CibcCardCsvParser extends BaseCsvParser {
  canParse(content) {
    if (content[0].length !== 5) {
      return false;
    }

    const dateFormat = /\d{4}-\d{1,2}-\d{1,2}/;
    const date = dateFormat.exec(content[0][0]);

    const valueFormat = /\d+\.\d{2}/;
    const value1 = valueFormat.exec(content[0][2]);
    const value2 = valueFormat.exec(content[0][3]);

    return date != null && (value1 != null || value2 != null);
  }

  parse(content) {
    // Example: [2022-03-17, OLDNAVY.COM 2944 505-462-0076, ON,	52.64,		, <CARD>]
    const transactions = {};
    for (let i = 0; i < content.length; i += 1) {
      const current = content[i];
      const date = current[0].split('-');
      if (date[0] !== '') {
        const description = current[1];
        const debit = parseFloat(current[2]);
        const credit = parseFloat(current[3]);
        const t = new CsvTransaction(date[0], date[1], date[2], description, debit > 0 ? -debit : credit, 'CIBC', '');
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

  getDelim(){
    return ','
  }
}
