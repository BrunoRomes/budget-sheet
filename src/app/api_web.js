let DEPLOYMENT_ID = '';
class WebAppConfig {
  static loadConfig() {
    const jsonString = HtmlService.createHtmlOutputFromFile('webappconfig.json.html').getContent();
    const jsonObject = JSON.parse(jsonString);

    DEPLOYMENT_ID = jsonObject.deployment_id;
  }
}

function invokeApi(params, parallelismFactor) {
  if (DEPLOYMENT_ID === '') {
    WebAppConfig.loadConfig();
  }
  const url = `https://script.google.com/macros/s/${DEPLOYMENT_ID}/exec`;
  const token = ScriptApp.getOAuthToken();
  const resource = [];
  for (let i = 0; i < params.length; i += 1) {
    resource.push({
      url,
      method: 'POST',
      muteHttpExceptions: true,
      contentType: 'application/json',
      payload: JSON.stringify(params[i]),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (resource.length >= parallelismFactor) {
      const responses = UrlFetchApp.fetchAll(resource);
      Logger.log(responses);
      resource.splice(0, resource.length);
    }
  }

  if (resource.length > 0) {
    const responses = UrlFetchApp.fetchAll(resource);
    Logger.log(responses);
  }
}

function invokeMigrations() {
  migrationManager = new MigrationManager();
  for (let v = migrationManager.getLowestVersion(); v <= migrationManager.getNumberOfVersions(); v += 1) {
    pendingMigrations = migrationManager.getPendingMigrationsForVersion(v);

    if (pendingMigrations.length > 0) {
      const params = [];
      const keys = [];
      for (let i = 0; i < pendingMigrations.length; i += 1) {
        p = pendingMigrations[i];
        params.push({ operation: 'migrate', version: p.version, name: p.name, index: p.index });
        keys.push(p.name);
      }
      Logger.log(`Invoking migration for Version ${v}: ${JSON.stringify(params)}`);
      invokeApi(params, 2);

      migrationManager.updateMetadata(v, keys);
    }
  }
}

function invokeBootstrap() {
  const sheets = new Bootstrap().initSheets();
  const params = [];
  for (let i = 0; i < sheets.length; i += 1) {
    if (!sheets[i].alreadyExists) {
      params.push({ operation: 'bootstrap', sheet: sheets[i].getSheetName() });
    }
  }
  invokeApi(params, 20);
}

function doPost(e) {
  const input = JSON.stringify(e);
  Logger.log(input);
  const params = JSON.parse(e.postData.contents);
  const { operation } = params;

  const operationHandler = {
    bootstrap(parameters) {
      new Bootstrap().runForSheet(parameters.sheet);
    },
    migrate(parameters) {
      new MigrationManager().applySingleMigration(parameters.version, parameters.name, parameters.index);
    },
  };

  operationHandler[operation](params);

  return ContentService.createTextOutput('OK');
}

// TODO: FIX THE DEPLOYMENT URL
// TODO: ADD MIGRATIONS OPERATION
