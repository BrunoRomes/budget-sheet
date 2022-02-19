class ModalHelper {
  constructor() {
    this.waitOutput = HtmlService.createHtmlOutput(
      '<b>Please wait...</b><br/><br/>This may take a while. This modal will auto-close when the operation is completed.'
    );
    this.autoCloseOutput = HtmlService.createHtmlOutput('<script>google.script.host.close();</script>');
    this.errorOutput = HtmlService.createHtmlOutput(
      '<b>Something went wrong...</b><br/><br/>Check the logs to understand the error.'
    );
  }

  showWait(title) {
    SpreadsheetApp.getUi().showModalDialog(this.waitOutput, title);
  }

  showError() {
    SpreadsheetApp.getUi().showModalDialog(this.errorOutput, 'Error...');
  }

  close() {
    SpreadsheetApp.getUi().showModalDialog(this.autoCloseOutput, 'Done...');
  }
}
