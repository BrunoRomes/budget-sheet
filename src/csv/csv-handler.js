class CsvHandler {
  constructor() {
    this.folder = this.private_changeDirectory(CSVS_FOLDER_PATH);
    this.sanitized_csv_suffix = ' Sanitized Transactions.csv';
    this.parsers = [
      new SanitizedCsvParser(),
      new CapitalOneCsvParser(),
      new TangerineCsvParser(),
      new AmazonCsvParser(),
      new RogersbankCardCsvParser(),
      new BrimCardCsvParser(),
      new ScotiabankCardCsvParser(),
      new ScotiabankCheckingsCsvParser(),
      new CibcCardCsvParser(),
    ];
  }

  sanitizeCsvs() {
    Logger.log('Sanitizing CSVs');
    const files = this.private_listCsvs();
    const transactions = this.private_parseCsvs(files);
    if (Object.keys(transactions).length === 0) {
      Logger.log('No transaction founds.');
      return;
    }

    const values = Object.keys(transactions)
      .sort()
      .map((key) => transactions[key]);
    const groupedTransactions = groupBy(values, 'yearMonth');
    this.private_exportCsvs(groupedTransactions);
    this.private_removeOldCsvs(files);
  }

  importTransactions() {
    Logger.log('Importing Transactions');
    for (let i = 0; i < MONTHS.length; i += 1) {
      this.importTransactionsForMonth(i);
    }
  }

  importTransactionsForMonth(monthIndex) {
    const filePrefix = `${YEAR}-${monthIndex + 1 < 10 ? `0${monthIndex + 1}` : monthIndex + 1}${
      this.sanitized_csv_suffix
    }`;
    const filesIt = this.folder.getFilesByName(filePrefix);
    if (filesIt.hasNext()) {
      Logger.log(`Importing transactions from file ${filePrefix}`);
      const file = filesIt.next();
      const transactions = this.private_parseCsvs([file]);
      this.private_updateTransactions(transactions, MONTHS[monthIndex]);
      file.setTrashed(true);
    }
  }

  // Private Methods

  private_updateTransactions(mappedTransactions, month) {
    const sheet = new MonthSheet(month);

    const expenses = sheet.getExpensesAsMap();
    const transactions = Object.values(mappedTransactions);
    for (let i = 0; i < transactions.length; i += 1) {
      const transaction = transactions[i];
      const date = new Date(`${transaction.year}-${transaction.month}-${transaction.day}T00:00:00`);
      const expense = new Transaction(
        transaction.key,
        date,
        transaction.description,
        -transaction.value,
        'Other',
        transaction.source
      );
      if (expense.key in expenses) {
        // Logger.log("Transaction already seen. Skipping: " + expense.key);
      } else {
        expenses[expense.key] = expense;
        Logger.log(`New Transaction Found: ${expense.key}`);
      }
    }

    sheet.setExpenses(Object.values(expenses));
  }

  private_changeDirectory(absolutePath) {
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

  private_listCsvs() {
    const filesByType = this.folder.getFilesByType('text/csv');
    const files = [];
    while (filesByType.hasNext()) {
      files.push(filesByType.next());
    }

    Logger.log(`${files.length} CSV files found.`);
    return files;
  }

  private_parseCsvs(files) {
    let transactions = {};
    for (let i = 0; i < files.length; i += 1) {
      const content = Utilities.parseCsv(files[i].getBlob().getDataAsString());
      if (content.length >= 1) {
        const fileTransaction = this.private_parseFileContent(files[i], content, this.parsers);
        transactions = { ...transactions, ...fileTransaction }; // Merging dictionaries
      }
    }

    Logger.log(`Total of ${Object.keys(transactions).length} transactions found.`);
    return transactions;
  }

  private_parseFileContent(file, content, parsers) {
    for (let i = 0; i < parsers.length; i += 1) {
      const parser = parsers[i];
      if (parser.canParse(content)) {
        Logger.log(`Using ${parser.constructor.name} to parse the CSV file ${file}`);
        return parser.parse(content);
      }
    }
    Logger.info(content[0]);
    throw new Error(`Unknown Source: ${content}`);
  }

  private_exportCsvs(groupedTransactions) {
    const dates = Object.keys(groupedTransactions);
    for (let i = 0; i < dates.length; i += 1) {
      this.private_exportCsv(dates[i], groupedTransactions[dates[i]]);
    }
  }

  private_exportCsv(yearMonth, transactions) {
    if (yearMonth < this.private_getDateThreshold()) {
      Logger.log(`Skipping file creation for ${yearMonth}.`);
      return;
    }

    const fileName = yearMonth + this.sanitized_csv_suffix;
    const rows = ['Key,Source,Year,Month,Day,Description,Value,YearMonth'];
    for (let i = 0; i < transactions.length; i += 1) {
      const t = transactions[i];
      const row = [
        t.key,
        t.source,
        t.year,
        t.month,
        t.day,
        t.description.replaceAll(',', ';'),
        t.value,
        t.yearMonth,
      ].join(',');
      rows.push(row);
    }

    const csv = rows.join('\r\n');

    const files = this.folder.getFilesByName(fileName);
    if (files.hasNext()) {
      const file = files.next();
      file.setContent(csv);
      Logger.log(`File ${fileName} updated.`);
    } else {
      this.folder.createFile(fileName, csv);
      Logger.log(`File ${fileName} created.`);
    }
  }

  private_getDateThreshold() {
    // TODO: Update this range
    return `${YEAR - 1}-01`;
  }

  private_removeOldCsvs(files) {
    const threshold = this.private_getDateThreshold();
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const name = file.getName();
      if (!name.endsWith(this.sanitized_csv_suffix) || name.substring(0, 8) < threshold) {
        Logger.log(`Deleting file ${name}`);
        file.setTrashed(true);
      }
    }
  }
}
