class XpCardCsvParser extends BaseCsvParser {
  canParse(content) {
    const canParse = content[0].length === 5 && content[0][0].trim() === 'Data' && content[0][1].trim() === 'Estabelecimento' && content[0][2].trim() === 'Portador';
    Logger.log(`XpCardCsvParser::canParse? ${canParse}`)
    return canParse
  }

  parse(content) {
    // Data Estabelecimento	Portador	Valor	Parcela
    // 02/10/2022; ESTABELECIMENTO;	TITULAR;	R$ 31,78;	2 de 6
    const transactions = {};
    for (let i = 1; i < content.length; i += 1) {
      const current = content[i];
      Logger.log(current)
      const date = current[0].split('/');
      const description = current[1];
      let value = parseFloat(current[3].replace('.','').replace(',','.').split(' ')[1]);
      //currency is in another country, convert to CAD
      const conversionRate = convertCurrencyToCad("BRLCAD", `${date[2]}-${date[1]}-${date[0]}`)
      value = value * conversionRate * -1;
      Logger.log("adjusted val " + value)

      const t = new CsvTransaction(date[2], date[1], date[0], description, value, 'XPI', '');
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

  getDelim(){
    return ';'
  }
}

