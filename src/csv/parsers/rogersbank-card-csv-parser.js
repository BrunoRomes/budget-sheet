class RogersbankCardCsvParser extends BaseCsvParser {
  canParse(content) {
    // Date, Posted Date, Reference Number, Activity Type, Status, Transaction, Card Number, Merchant Category,
    // Merchant Name, Merchant City, Merchant State/Province, Merchant Country, Merchant Postal Code/Zip, Amount,
    // Rewards, Name on Card

    const canParse =
      content[0].length === 15 &&
      content[0][RogersbankCardCsvParser.columnPostedDate] === 'Posted Date' &&
      content[0][RogersbankCardCsvParser.columnAmount] === 'Amount';
    log.info(`RogersBankCard::canParse? ${canParse}`);
    return canParse;
  }

  parse(content) {
    // Example: 2022-01-12	2022-01-12	"12302022012000019387349"	TRANS	Approved	************5535	Digital Goods – Games	Sony Interactive Enter	8003457669	CA	94404	$17.91
    log.info(`Rogers bank start parsing`);

    const transactions = {};
    for (let i = 1; i < content.length; i += 1) {
      const current = content[i];
      const date = current[0].split('-');
      log.debug('---- ');
      log.debug(`date: ${date}`);
      const description = `${current[RogersbankCardCsvParser.columnDescription]}`;
      log.debug(`description: ${description}`);
      let value = current[RogersbankCardCsvParser.columnAmount];
      value = value.split('$');
      value = parseFloat(value[1]);
      log.debug(`value: ${value}`);
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
    log.info(`end parsing Rogers Bank`);
    return transactions;
  }

  getDelim() {
    return ',';
  }
}
RogersbankCardCsvParser.columnPostedDate = 1;
RogersbankCardCsvParser.columnAmount = 12;
RogersbankCardCsvParser.columnDescription = 7;
