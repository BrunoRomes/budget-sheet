class CsvHandler {
  constructor() {
    this.folder = changeDirectory(CSVS_FOLDER_PATH);
    this.sanitized_csv_filename = 'Sanitized Transactions.csv';
    this.parsers = [
      new SanitizedCsvParser(),
      new TangerineCsvParser(),
      new AmazonCsvParser(),
      new RogersbankCardCsvParser(),
      new XpCardCsvParser(),
      new BrimCardCsvParser(),
      new ScotiabankCardCsvParser(),
      new ScotiabankCheckingsCsvParser(),
      new AmexDetailedCardCsvParser(),
      new CibcCardCsvParser(),
    ];
  }

  sanitizeCsvs(currentYear, removeFiles = true) {
    log.info('Sanitizing CSVs');
    const files = this.private_listCsvs();
    const transactions = this.private_parseCsvs(files);
    if (Object.keys(transactions).length === 0) {
      log.info('No transaction found.');
      return;
    }
    // Remove last year transactions and sort by date
    const entries = Object.values(transactions)
      .filter((entry) => parseInt(entry.year, 10) === parseInt(currentYear, 10))
      .sort((a, b) => a.date - b.date);
    log.info(`${entries.length} entries after filtering`);
    this.private_exportCsv(entries);
    if (removeFiles) {
      this.private_removeOldCsvs(files);
    }
  }

  importTransactions(removeFiles = true) {
    // TODO: alex working on this.....
    log.info('Importing Transactions');
    let nTrans = 0;
    const filesIt = this.folder.getFilesByName(this.sanitized_csv_filename);
    if (filesIt.hasNext()) {
      log.info(`Importing transactions from file ${this.sanitized_csv_filename}`);
      const file = filesIt.next();
      const transactions = this.private_parseCsvs([file]);
      this.private_updateTransactions(transactions);
      nTrans += Object.keys(transactions).length;
      file.setTrashed(removeFiles);
    }
    return nTrans;
  }

  // Private Methods

  private_updateTransactions(mappedTransactions) {
    const sheet = new TransactionsSheet('All-Transactions');
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
        'None',
        'No',
        'No',
        transaction.source
      );
      if (expense.key in expenses) {
        log.info(`Transaction already seen. Skipping: ${expense.key}`);
      } else {
        expenses[expense.key] = expense;
        log.info(`New Transaction Found: ${expense.key}`);
      }
    }
    sheet.setExpenses(Object.values(expenses));
  }

  private_listCsvs() {
    const filesByType = this.folder.getFilesByType('text/csv');
    const files = [];
    while (filesByType.hasNext()) {
      files.push(filesByType.next());
    }

    log.info(`${files.length} CSV files found.`);
    return files;
  }

  private_parseCsvs(files) {
    let transactions = {};
    for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
      const file = files[fileIndex];
      let parsed = false;
      log.info(`parsing file ${file}`);
      if (`${file}`.endsWith('NewTransactionKeys.csv')) {
        log.info(`skipping file ${file}`);
        parsed = true;
      }
      for (let parserIndex = 0; parserIndex < this.parsers.length; parserIndex += 1) {
        if (parsed) {
          break;
        }
        const parser = this.parsers[parserIndex];
        const delim = parser.getDelim();
        const content = Utilities.parseCsv(file.getBlob().getDataAsString(), delim);
        if (content.length >= 1) {
          if (parser.canParse(content)) {
            log.info(`Using ${parser.constructor.name} to parse the CSV file ${file}`);
            const fileTransaction = parser.parse(content);
            transactions = { ...transactions, ...fileTransaction }; // Merging dictionaries
            parsed = true;
          }
        }
      }
    }
    log.info(`Total of ${Object.keys(transactions).length} transactions found.`);
    return transactions;
  }

  private_exportCsv(transactions) {
    const fileName = this.sanitized_csv_filename;
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
      log.info(`File ${fileName} updated with ${transactions.length} transactions. `);
    } else {
      this.folder.createFile(fileName, csv);
      log.info(`File ${fileName} created with ${transactions.length} transactions.`);
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
      if (!name.endsWith(this.sanitized_csv_filename) || name.substring(0, 8) < threshold) {
        log.info(`Deleting file ${name}`);
        file.setTrashed(true);
      }
    }
  }
}
