class MigrationManager {
  constructor() {
    this.metadataSheet = new MetadataSheet();
    this.versionMigrations = {
      1: [], // No migration, we always start in version 1
      2: [new CashflowMigrationV2()],
      3: [new CashflowMigrationV3()],
    };
  }

  run() {
    log.info('Starting Sheet Migrations');
    const startingVersion = this.metadataSheet.getLowestSheetVersion() + 1;
    this.applyMigrations(startingVersion, VERSION);
    this.metadataSheet.updateAllVersions(VERSION);
    log.info('Sheet migrations completed.');
  }

  applyMigrations(startingVersion, targetVersion) {
    for (let i = startingVersion; i <= targetVersion; i += 1) {
      const migrations = this.versionMigrations[`${i}`].flat();

      for (let j = 0; j < migrations.length; j += 1) {
        const migration = migrations[j];
        const key = migration.getSheetName();
        if (this.metadataSheet.getMetadata(key) < i) {
          log.info(`Migrating Sheet ${key} to version ${i}`);
          migration.run();
          this.metadataSheet.updateMetadata(key, i);
        }
      }
    }
  }
}

function testMigrationManager() {
  const m = new MigrationManager();
  m.run();
  log.info('ABC');
}
