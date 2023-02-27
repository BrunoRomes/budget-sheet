class TransactionClassifier {
  constructor() {
    this.expensesMap = {};
    this.incomesMap = {};
    this.categoriesMap = {};
    this.merchants = [];
    this.usedCategories = {};
    this.categorySheet = new CategorySheet();
    this.merchantSheet = new MerchantSheet();
  }

  getExpensesArray() {
    return Object.values(this.expensesMap);
  }

  getIncomesArray() {
    return Object.values(this.incomesMap);
  }

  getUsedCategoriesArray() {
    return Object.values(this.usedCategories);
  }

  classify(expenses, incomes) {
    this.expensesMap = expenses;
    this.incomesMap = incomes;
    this.categoriesMap = this.categorySheet.getCategories();
    this.merchants = this.merchantSheet.getMerchants();

    this.classifyExpenses();
  }

  classifyExpensesFromMap(expenses) {
    this.expensesMap = expenses;
    this.categoriesMap = this.categorySheet.getCategories();
    this.merchants = this.merchantSheet.getMerchants();
    this.classifyExpenses();
  }

  classifyExpenses() {
    const expensesList = Object.values(this.expensesMap);
    const expensesToRemove = [];
    this.usedCategories = {};

    expensesList.forEach((exp) => {
      log.debug(`Classify ${JSON.stringify(exp)}`);
      const expense = exp;
      if (expense.category === '') {
        expense.category = 'Other';
      }
      const category = this.categoriesMap[expense.category];
      const { classificator } = expense;

      // get category
      if (classificator !== 'Manual') {
        log.info(`not manual classificator is ${classificator}`);
        if (category.name === 'Other' || classificator === 'Plaid') {
          // find the category using the merchant sheet
          const newCategory = this.classifySingleExpense(expense);
          if (newCategory.name === 'Other' && category.name !== 'Other') {
            // do not do it, we had a best one
            log.debug(`should not change category ${category.name}`);
          } else {
            category.name = newCategory.name;
            expense.classificator = 'Merchants';
          }
          log.info(`the new category is ${category.name}`);
        }
      }

      if (category.name === 'To Remove') {
        expensesToRemove.push(expense.key);
      } else if (category.is_income) {
        expense.is_income = `Yes`;
      } else if (category.is_investment) {
        expense.is_investment = `Yes`;
      } else {
        this.usedCategories[category.name] = { category: category.name };
      }
      log.info(`Expense ${JSON.stringify(expense)}`);
    });
    expensesToRemove.forEach((toRemove) => {
      delete this.expensesMap[toRemove];
    });
  }

  classifySingleExpense(expense) {
    const merchant = expense.description;
    if (merchant === undefined) return '';
    const merchantClean = merchant.toLowerCase().replace('(', ' ').replace(')', ' ');
    merchantClean.replace(/\W/g, '');

    for (let i = 0; i < this.merchants.length; i += 1) {
      const merchantData = this.merchants[i];
      const merchantDataPattern = merchantData.name.toLowerCase();
      merchantDataPattern.replace(/\W/g, '');

      let match = merchantClean.toLowerCase().match(merchantDataPattern);
      if (match === undefined) {
        match = merchantDataPattern.toLowerCase().match(merchantClean);
      }
      if (match) {
        return this.categoriesMap[merchantData.category] || this.categoriesMap.Other;
      }
    }

    return this.categoriesMap.Other;
  }
}
