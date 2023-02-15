/*
Plaid Categories
INCOME
TRANSFER_IN
TRANSFER_OUT
LOAN_PAYMENTS
BANK_FEES
ENTERTAINMENT
FOOD_AND_DRINK
GENERAL_MERCHANDISE
HOME_IMPROVEMENT
MEDICAL
PERSONAL_CARE
GENERAL_SERVICES
GOVERNMENT_AND_NON_PROFIT
TRANSPORTATION
TRAVEL
RENT_AND_UTILITIES

When an user changes a category manually, lock the cell.
Locked cells should not be changed by the script.
Get plaid category, if in list of categories use it, otherwise insert Other.
Categories in 'Merchants' should always win the classifier should see if the transaction is from the merchant category, if it is it should change it.
*/

class PlaidUpdater {
  constructor() {
    const jsonString = HtmlService.createHtmlOutputFromFile('userconfig.json.html').getContent();
    const jsonObject = JSON.parse(jsonString);
    this.plaid_cfg = jsonObject.plaid_cfg;
    this.live_sources = jsonObject.live_update_sources;
    this.endpoint = `https://development.plaid.com`;
    log.debug(this.plaid_cfg);
    // log.debug(this.live_sources);
  }

  private_generateRequest(additionalFields, accessToken) {
    const plaidClientId = this.plaid_cfg.client_id;
    const plaidSecret = this.plaid_cfg.secret;

    const plaidHeaders = {
      contentType: 'application/json',
      'Content-Type': 'application/json',
    };

    // data is a parameter plaid requires for the post request
    // created via the plaid quickstart app (node)
    const baseData = {
      access_token: accessToken,
      client_id: plaidClientId,
      secret: plaidSecret,
    };
    const data = { ...baseData, ...additionalFields };
    // pass in the necessary headers
    // pass the payload as a json object
    const parameters = {
      headers: plaidHeaders,
      payload: JSON.stringify(data),
      method: 'post',
      muteHttpExceptions: true,
    };
    log.trace(`generated params ${JSON.stringify(parameters)}`);
    return parameters;
  }

  getAccounts(accessToken) {
    const parameters = this.private_generateRequest({}, accessToken);
    const url = `${this.endpoint}/accounts/balance/get`;
    const response = UrlFetchApp.fetch(url, parameters);
    log.debug(response);
    return JSON.parse(response).accounts;
  }

  getLiabilities(accessToken) {
    const parameters = this.private_generateRequest({}, accessToken);
    const url = `${this.endpoint}/liabilities/get`;
    const response = UrlFetchApp.fetch(url, parameters);
    log.debug(response);
  }

  getTransactionHistory(month, accessToken, accountId) {
    const COUNT = 500;
    const startDate = `${YEAR}-${month}-01`;
    // TODO: fix end date to be the month correct last day
    const endDate = `${YEAR}-${month}-28`;

    // data is a parameter plaid requires for the post request
    // created via the plaid quickstart app (node)
    const extraParameters = {
      start_date: startDate,
      end_date: endDate,
      options: { count: COUNT, offset: 0, include_personal_finance_category: true, account_ids: [accountId] },
    };
    const parameters = this.private_generateRequest(extraParameters, accessToken);

    // api host + endpoint
    const url = `${this.endpoint}/transactions/get`;
    const response = UrlFetchApp.fetch(url, parameters);
    const transactions = JSON.parse(response);
    return transactions.transactions;
  }

  sync() {
    log.info('Plaid::sync');
    this.live_sources.forEach((source) => {
      const plaidAccessToken = source.plaid_access_token;
      this.getLiabilities(plaidAccessToken);

      // const transactions = this.getTransactionHistory('02', plaidAccessToken);
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName('TEST_PLAID');
      sheet.clearContents();
      sheet.appendRow(['date', 'merchant', 'amount', 'category', 'category2', 'account']);
      // TODO make async
      this.getAccounts(plaidAccessToken).forEach((acc) => {
        log.info(`---------- on account ${acc.account_id} -------------`);

        const transactions = this.getTransactionHistory('01', plaidAccessToken, acc.account_id);
        transactions.forEach((t) => {
          log.debug(JSON.stringify(t));
          const row = [
            t.date,
            `${t.name}`, // -${t.merchant_name}`,
            t.amount,
            t.category[1],
            t.personal_finance_category.detailed,
            acc.name,
          ];
          sheet.appendRow(row);
        });
      });

      // accounts.forEach((account) => {
      //   Logger.log(`Account: ${account.official_name}`);
      //   Logger.log(`Account id: ${account.account_id}`);
      //   Logger.log(`Balance: ${account.balances.current}`);
      //   this.getTransactionHistory('01', plaidAccessToken, account.account_id);
      // });
    });
  }
}

function run() {
  log.info('run');
  const plaid = new PlaidUpdater();
  plaid.sync();
  /* plaid.live_sources.forEach((source) => {
    const plaidAccessToken = source.plaid_access_token;
    plaid.getAccounts(plaidAccessToken).forEach((acc) => {
      log.info(`---------- on account ${acc.account_id} -------------`)
      log.info(JSON.stringify(acc))
      const trans = plaid.getTransactionHistory('01', plaidAccessToken, acc.account_id)
    });
  }); */
}
// function onEdit(e) {
//   Logger.log(e.range.getSheet().getName());
//   Logger.log(`on edit ${JSON.stringify(e)}`);
// }
