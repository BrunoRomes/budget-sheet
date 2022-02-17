const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const VERSION = 2;
const SHEET_FOLDER_PATH = [];
const CSVS_FOLDER_PATH = [];
const CASHFLOW_SOURCES = [];
let YEAR = 2021;

class UserConfig {
  static loadConfig() {
    const jsonString = HtmlService.createHtmlOutputFromFile('userconfig.json.html').getContent();
    const jsonObject = JSON.parse(jsonString);

    YEAR = jsonObject.year;
    for (let i = 0; i < jsonObject.sheet_folder_path.length; i += 1) {
      SHEET_FOLDER_PATH.push(jsonObject.sheet_folder_path[i]);
    }
    for (let i = 0; i < jsonObject.csvs_folder_path.length; i += 1) {
      CSVS_FOLDER_PATH.push(jsonObject.csvs_folder_path[i]);
    }
  }

  // {
  //     "year": "2022",
  //     "sheet_folder_path": ["Budget"],
  //     "csvs_folder_path": ["Budget", "csvs"],
  //     "cashflow_sources": [
  //         {
  //             "type": "bchydro"
  //         },
  //         {
  //             "type": "burnabyUtilities"
  //         },
  //         {
  //             "type": "monthlyExpense",
  //             "value": -383.94,
  //             "event": "Strata",
  //             "startDate": "2022-01-01"
  //         },
  //         {
  //             "type": "biweeklyExpense",
  //             "value": -997.76,
  //             "event": "Mortgage",
  //             "startDate": "2022-01-13"
  //         },
  //         {
  //             "type": "capitaloneCard",
  //             "account": "1887",
  //             "event": "Capital One Costco"
  //         },
  //         {
  //             "type": "rogersCard"
  //         },
  //         {
  //             "type": "scotiabankCard"
  //         },
  //         {
  //             "type": "tangerineChequing",
  //             "account": "8625",
  //             "event": "Tangerine Acc"
  //         },
  //         {
  //             "type": "scotiabankChequing",
  //             "account": "*****04*3787",
  //             "event": "Scotiabank Acc"
  //         }
  //     ]
  // }
}
