class BaseCashflowSource {
  fetch() {
    return [];
  }

  gmailSearch(query, start, max) {
    const threads = GmailApp.search(query, start, max);
    const entries = [];
    for (let t = 0; t < threads.length; t += 1) {
      const messages = threads[t].getMessages();
      for (let i = messages.length - 1; i >= 0; i -= 1) {
        const entry = this.processGmailThread(messages[i].getPlainBody());
        if (entry !== null) {
          entries.push(entry);
        }
      }
    }
    return entries;
  }

  processGmailThread(_messageBody) {
    return null;
  }
}
