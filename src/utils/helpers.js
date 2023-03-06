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

function changeDirectory(absolutePath) {
  let folder = DriveApp.getRootFolder();
  for (let i = 0; i < absolutePath.length; i += 1) {
    const folders = folder.getFoldersByName(absolutePath[i]);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      throw new Error(`Unknown Folder: ${absolutePath[i]}`);
    }
  }
  return folder;
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
}

function formatDate(date) {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join('-');
}

function dateObjectFromString(dateStr) {
  const dateArray = dateStr.split('-');
  return new Date(`${dateArray[0]}-${dateArray[1]}-${dateArray[2]}T00:00:00`);
}
