class Trigger {
  static createSpreadsheetOpenTrigger(functionName) {
    const ss = SpreadsheetApp.getActive();
    ScriptApp.newTrigger(functionName).forSpreadsheet(ss).onOpen().create();
  }

  static deleteAllTriggers() {
    // Loop over all triggers.
    const allTriggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < allTriggers.length; i += 1) {
      ScriptApp.deleteTrigger(allTriggers[i]);
    }
  }
}
