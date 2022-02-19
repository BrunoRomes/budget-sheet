class TransactionClassifier {
  constructor() {
    this.expensesMap = {};
    this.incomesMap = {};
    this.categoriesMap = {};
    this.merchants = [];
    this.usedCategories = {};
    this.totalInvested = 0;
    this.categorySheet = new CategorySheet();
    this.merchantSheet = new MerchantSheet();
  }

  getExpensesArray() {
    return Object.values(this.expensesMap);
  }

  getIncomesArray() {
    return Object.values(this.incomesMap);
  }

  getTotalInvested() {
    return this.totalInvested;
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

  classifyExpenses() {
    const expensesList = Object.values(this.expensesMap);
    const expensesToRemove = [];
    this.totalInvested = 0;
    this.usedCategories = {};

    expensesList.forEach((exp) => {
      const expense = exp;
      if (expense.category === '') {
        expense.category = 'Other';
      }
      let category = this.categoriesMap[expense.category];
      if (category === undefined || category.name === 'Other') {
        category = this.classifySingleExpense(expense);
        expense.category = category.name;
      }

      if (category.name === 'To Remove') {
        expensesToRemove.push(expense.key);
      } else if (category.is_income) {
        expensesToRemove.push(expense.key);
        expense.value = Math.abs(expense.value);
        expense.amount = Math.abs(expense.value);
        this.incomesMap[expense.key] = expense;
      } else if (category.is_investment) {
        this.totalInvested += Math.abs(expense.value);
      } else {
        this.usedCategories[category.name] = { category: category.name };
      }
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
