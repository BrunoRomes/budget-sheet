/*
For now this class is only a playground, more dev work will happen here
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
  }

  private_generateRequest(additionalFields, accessToken, anonymous = false) {
    const plaidClientId = this.plaid_cfg.client_id;
    const plaidSecret = this.plaid_cfg.secret;

    const plaidHeaders = {
      contentType: 'application/json',
      'Content-Type': 'application/json',
    };

    // data is a parameter plaid requires for the post request
    // created via the plaid quickstart app (node)
    let baseData = {};
    if (!anonymous) {
      baseData = {
        access_token: accessToken,
        client_id: plaidClientId,
        secret: plaidSecret,
      };
    }
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
    const responseCode = response.getResponseCode();
    log.debug(`response code is: ${responseCode}`);
    if (parseInt(responseCode, 10) >= 300) {
      const errorMessage = JSON.parse(response.getContentText()).error_message;
      log.debug(`error message is ${errorMessage}`);
      throw new Error(errorMessage);
    }
    const respJson = JSON.parse(response.getContentText());
    return respJson.accounts;
  }

  getCategories() {
    const parameters = this.private_generateRequest({}, '', true);
    const url = `${this.endpoint}/categories/get`;
    const response = UrlFetchApp.fetch(url, parameters);
    return JSON.parse(response).categories;
  }

  getTransactionHistory(accessToken, accountId, startDate, includePending = false) {
    const COUNT = 500;
    // TODO: save last seen date to make it faster
    const endDate = `${YEAR}-12-31`;
    log.info(`getting transactions for account ${accountId} from ${startDate} to ${endDate}`);

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
    const filteredTransactions = [];
    transactions.transactions.forEach((t) => {
      if (t.pending) {
        if (includePending) {
          filteredTransactions.push(t);
        } else {
          log.info(`not adding transaction ${t} because it's pending`);
        }
      } else {
        filteredTransactions.push(t);
      }
    });
    return filteredTransactions;
  }

  sync() {
    log.info('Plaid::sync');
    const resp = new Map();
    this.live_sources.forEach((source) => {
      const plaidAccessToken = source.plaid_access_token;
      const categories = new CategorySheet().getCategories();
      // TODO make async, is it possible?
      const tSheet = new TransactionsSheet();
      const transactions = {};
      let accounts = [];
      try {
        accounts = this.getAccounts(plaidAccessToken);
      } catch (err) {
        resp[source.name] = err.message;
      }
      const scriptProperties = PropertiesService.getScriptProperties();
      accounts.forEach((acc) => {
        log.info(`---------- on account ${JSON.stringify(acc)} -------------`);
        let lastDateProcessed = scriptProperties.getProperty(`${acc.account_id}_date`);
        log.info(`last date processed ${lastDateProcessed}`);
        if (lastDateProcessed === undefined || lastDateProcessed === null) {
          lastDateProcessed = `${YEAR}-01-02`;
        }
        const lastDate = dateObjectFromString(lastDateProcessed);
        const startDate = formatDate(lastDate.setDate(lastDate.getDate() - 1));

        const plaidTransactions = this.getTransactionHistory(plaidAccessToken, acc.account_id, startDate, false);
        let maxDateProcessed = lastDate;
        plaidTransactions.forEach((t) => {
          const key = '';
          let cat = titleCase(t.personal_finance_category.primary);
          if (categories[cat] === undefined) {
            cat = 'Other';
          }
          const transactionDate = dateObjectFromString(t.date);
          if (transactionDate > maxDateProcessed) {
            log.info(`making last day processed to ${transactionDate}`);
            maxDateProcessed = transactionDate;
          }

          const transaction = new Transaction(
            key,
            transactionDate,
            t.name,
            Math.abs(t.amount),
            cat,
            'Plaid',
            categories[cat].is_income ? 'Yes' : 'No',
            categories[cat].is_investment ? 'Yes' : 'No',
            acc.official_name
          );
          transactions[transaction.key] = transaction;
          // TODO: check how many are new (not seen)
        });
        log.info(`Setting the last day processed for account ${acc.account_id} is ${maxDateProcessed}`);
        scriptProperties.setProperty(`${acc.account_id}_date`, formatDate(maxDateProcessed));
      }); // accounts for each
      const nTrans = tSheet.setExpenses(Object.values(transactions));
      if (resp[source.name] === undefined) {
        resp[source.name] = `${nTrans} transactions imported`;
      }
      tSheet.applyFormat();
    }); // live sources
    return resp;
  }
}
