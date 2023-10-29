class AmexDetailedCardCsvParser extends BaseCsvParser {
  canParse(content) {
    /*
    ,Transaction Details: ,American Express Cobalt® Card,,
    ,CARDMEMBERNAME,Activity as of 29 Jan 2023,,
    ,Account Number: XXX-XXXX,,,
    ,,,,
    ,,,,
    ,,,,
    Summary,,,,Total
    Last billed statement,,,,$0.00
    Charges & Adjustments,,,,$252.28
    Payments & Credits,,,,$0.00
    Summary for this billed period:,,,,$252.28
    ,,,,
    Total of transactions by Card,+ Debits,- Credits,,Total
    CARDMEMBER1-XXX,$252.28,$0.00,,$252.28
    CARDMEMBER2-XXX,$0.00,$0.00,,$0.00
    ,,,,
    Date,Description,,Cardmember,Amount
    27 Jan 2023,vendor,,cardmember,$14.55
     */
    return (
      content.length > 16 &&
      content[16].length === 5 &&
      content[16][0] === 'Date' &&
      content[16][1] === 'Description' &&
      content[16][3] === 'Cardmember' &&
      content[16][4] === 'Amount'
    );
  }

  parse(content) {
    const transactions = {};
    const cardName = content[0][2].trim();
    for (let i = 17; i < content.length; i += 1) {
      const current = content[i];
      const dateObj = new Date(current[0].trim());
      const dateArray = dateObj.toISOString().split('T')[0].split('-');

      const description = current[1];
      const value = parseFloat(current[4].trim().split('$')[1]);
      const trans = new CsvTransaction(dateArray[0], dateArray[1], dateArray[2], description, -value, cardName, '');
      log.info(trans.toStr());
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
