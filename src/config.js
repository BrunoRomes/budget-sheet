const VERSION = 3;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SHEET_FOLDER_PATH = [];
const CSVS_FOLDER_PATH = [];
let CASHFLOW_SOURCES_JSON = [];
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
    CASHFLOW_SOURCES_JSON = jsonObject.cashflow_sources;
  }
}
