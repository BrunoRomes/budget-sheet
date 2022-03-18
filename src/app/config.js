const VERSION = 3;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let SHEET_FOLDER_PATH = [];
let CSVS_FOLDER_PATH = [];
let CASHFLOW_SOURCES_JSON = [];
let YEAR = 2021;

REFRESH_BUTTON_IMAGE =
  'https://docs.google.com/drawings/d/e/2PACX-1vSw_LSUvA5qfxCWjnyskpr1RQzzspMIwjProt3hHHiW9F6Tr5KHPIxFOed2CjQk60LGmO6H8sEZ4fNT/pub?w=279&h=100';

class UserConfig {
  static loadConfig() {
    const jsonString = HtmlService.createHtmlOutputFromFile('userconfig.json.html').getContent();
    const jsonObject = JSON.parse(jsonString);

    YEAR = jsonObject.year;
    SHEET_FOLDER_PATH = jsonObject.sheet_folder_path;
    CSVS_FOLDER_PATH = jsonObject.csvs_folder_path;
    CASHFLOW_SOURCES_JSON = jsonObject.cashflow_sources;
  }
}
