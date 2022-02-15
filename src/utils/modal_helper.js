class ModalHelper {
  constructor() {
    this.waitOutput = HtmlService.createHtmlOutput(
      '<b>Please wait...</b><br/><br/>This may take a while. This modal will auto-close when the operation is completed.'
    );
    this.autoCloseOutput = HtmlService.createHtmlOutput('<script>google.script.host.close();</script>');
  }

  showWait(title) {
    SpreadsheetApp.getUi().showModalDialog(this.waitOutput, title);
  }

  close() {
    SpreadsheetApp.getUi().showModalDialog(this.autoCloseOutput, 'Done...');
  }
}
