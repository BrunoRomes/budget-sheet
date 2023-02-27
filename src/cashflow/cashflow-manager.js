class CashflowManager {
  updateCashflow() {
    const sources = this.deserializeSources();
    new CashflowSheet().refresh(sources);
  }

  deserializeSources() {
    const sources = [];

    CASHFLOW_SOURCES_JSON.bchydro.forEach((_json) => {
      sources.push(new BCHydroCashflowSource());
    });

    CASHFLOW_SOURCES_JSON.burnabyUtilities.forEach((_json) => {
      sources.push(new BurnabyUtilitiesCashflowSource());
    });

    CASHFLOW_SOURCES_JSON.monthlyExpenses.forEach((json) => {
      sources.push(new MonthlyExpenseCashflowSource(json.value, json.startDate, json.event));
    });

    CASHFLOW_SOURCES_JSON.biweeklyExpenses.forEach((json) => {
      sources.push(new BiweeklyExpenseCashflowSource(json.value, json.startDate, json.event));
    });

    CASHFLOW_SOURCES_JSON.rogersCard.forEach((_json) => {
      sources.push(new RogersCardCashflowSource());
    });

    CASHFLOW_SOURCES_JSON.scotiabankCard.forEach((_json) => {
      sources.push(new ScotiabankCardCashflowSource());
    });

    CASHFLOW_SOURCES_JSON.scotiabankChequing.forEach((json) => {
      sources.push(new ScotiabankChequingCashflowSource(json.account, json.event));
    });

    CASHFLOW_SOURCES_JSON.tangerineChequing.forEach((json) => {
      sources.push(new TangerineChequingCashflowSource(json.account, json.event));
    });

    return sources;
  }
}

// function testCashflowManager() {
//   UserConfig.loadConfig();
//   const a = new CashflowManager();
//   const b = a.deserializeSources();
//   log.info('abc');
// }
