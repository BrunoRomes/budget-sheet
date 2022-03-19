class AmazonCsvParser extends BaseCsvParser {
  canParse(content) {
    return content[0].length === 13 && content[0][0].trim() === 'order id' && content[0][1].trim() === 'items';
  }

  parse(content) {
    // Example: order id	items	to	date	total	shipping	shipping_refund	gift	VAT	GST	PST	refund	payments
    const transactions = {};
    const descriptionThreshold = 50; // Changing this might have side-effects, as it will change the idempotency key.
    for (let i = 1; i < content.length - 1; i += 1) {
      const current = content[i];
      const orderid = current[0];
      const items = current[1];
      const to = current[2].trim();

      const date = current[3].split('-');
      const description = `AmazonItems: ${
        items.length > descriptionThreshold ? `${items.substring(0, descriptionThreshold)}…` : items
      }`;
      const value = parseFloat(current[4].substring(4).trim());
      const t = new CsvTransaction(date[0], date[1], date[2], description, -value, 'Amazon', '');
      t.description = `ORDER:${orderid} - ${t.description}`;
      let { key } = t;
      let count = 1;
      while (key in transactions) {
        key = `${t.key}_${count}`;
        count += 1;
      }
      t.key = key;
      transactions[t.key] = t;

      const refund = parseFloat(current[11].length > 4 ? current[11].substring(4).trim() : current[11]);
      if (refund !== 0) {
        const t2 = new CsvTransaction(date[0], date[1], date[2], description, refund, 'Amazon', '');
        t2.description = `ORDER:${orderid} - ${t2.description}`;
        let key2 = t2.key;
        let count2 = 1;
        while (key2 in transactions) {
          key2 = `${t2.key}_${count2}`;
          count2 += 1;
        }
        t2.key = key2;
        transactions[t2.key] = t2;
      }
    }
    return transactions;
  }
}
