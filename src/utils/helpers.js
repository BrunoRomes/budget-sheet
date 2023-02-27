function groupBy(xs, key) {
  return xs.reduce((rv, x) => {
    const agg = rv;
    (agg[x[key]] = agg[x[key]] || []).push(x);
    return agg;
  }, {});
}
function colToLetter(col) {
  let temp;
  let letter = '';
  let column = col;
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function convertCurrencyToCad(currency, date) {
  let n = 1;
  const formDate = new Date(`${date}T14:00:00.000-0800`);
  // keep advancing day until there is an observation
  while (n < 10) {
    const formDateString = formDate.toISOString().split('T')[0];
    const url = `https://www.bankofcanada.ca/valet/observations/FX${currency}/json?start_date=${formDateString}&end_date=${formDateString}`;
    const response = UrlFetchApp.fetch(url);
    const jsonResponse = JSON.parse(response.getContentText());
    const r = jsonResponse.observations;
    if (r.length >= 1) {
      return jsonResponse.observations[0][`FX${currency}`].v;
    }
    formDate.setDate(formDate.getDate() + 1);
    n += 1;
  }
  return undefined;
}
function titleCase(text) {
  return text
    .toLowerCase()
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase()) // Initial char (after -/_)
    .replace(/[-_]+(.)/g, (_, c) => ` ${c.toUpperCase()}`); // First char after each -/_
  // return text.replace(/^_*(.)|_+(.)/g, (s, c, d) => (c ? c.toUpperCase() : ` ${d.toUpperCase()}`));
}
