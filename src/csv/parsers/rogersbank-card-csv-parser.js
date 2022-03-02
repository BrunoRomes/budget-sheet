class RogersbankCardCsvParser extends BaseCsvParser {
  canParse(content) {
    return content[0].length === 12 && content[0][1] === 'Posted Date' && content[0][11] === 'Amount';
  }

  parse(content) {
    // Example: 2022-01-12	2022-01-12	"12302022012000019387349"	TRANS	Approved	************5535	Digital Goods – Games	Sony Interactive Enter	8003457669	CA	94404	$17.91

    const transactions = {};
    for (let i = 1; i < content.length; i += 1) {
      const current = content[i];
      const date = current[0].split('-');
      const description = current[7];
      let value = current[11];
      value = value.split('$');
      value = parseFloat(value[1]);
      const trans = new CsvTransaction(date[0], date[1], date[2], description, -value, 'Rogers Card', '');
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
}
